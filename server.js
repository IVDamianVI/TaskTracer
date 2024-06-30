const express = require('express');
const pidusage = require('pidusage');
const os = require('os');
const osUtils = require('os-utils');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Endpoint to get list of processes
app.get('/api/processes', (req, res) => {
    exec('tasklist', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send(error);
        }
        const processes = stdout.split('\n').slice(3).map(line => {
            const parts = line.trim().split(/\s+/);
            const pid = parts[1];
            const command = parts[0];
            return { pid, command };
        }).filter(process => process.pid);
        res.json(processes);
    });
});

// Endpoint to monitor a specific process
app.get('/api/monitor/:pid', (req, res) => {
    const pid = parseInt(req.params.pid, 10);

    if (isNaN(pid)) {
        return res.status(400).send('Invalid PID');
    }

    console.log(`Monitoring PID: ${pid}`);  // Log the PID being monitored

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const updateProcessUsage = () => {
        pidusage(pid, (err, stats) => {
            if (err) {
                console.error(`Error getting stats for PID ${pid}:`, err);
                res.write(`data: ${JSON.stringify({ error: 'Error fetching data' })}\n\n`);
                return;
            }
            const usageInfo = {
                memory: (stats.memory / 1024 / 1024), // Convert to MB
                cpu: stats.cpu // CPU usage in percentage
            };
            res.write(`data: ${JSON.stringify(usageInfo)}\n\n`);
        });
    };

    const interval = setInterval(updateProcessUsage, 1000); // Update every second

    req.on('close', () => {
        clearInterval(interval);
        console.log(`Stopped monitoring PID: ${pid}`);
    });
});

// Endpoint to get system-wide CPU and memory usage
app.get('/api/system', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const updateSystemUsage = () => {
        osUtils.cpuUsage((cpuPercentage) => {
            const freeMemMB = (osUtils.freemem() * 1024) / 1000; // osUtils.freemem() returns value in GB, multiply by 1024 to get MB
            const totalMemMB = (osUtils.totalmem() * 1024) / 1000; // osUtils.totalmem() returns value in GB, multiply by 1024 to get MB
            const usedMemMB = totalMemMB - freeMemMB;
            const systemUsage = {
                cpu: cpuPercentage * 100, // Convert to percentage
                memory: {
                    total: totalMemMB,
                    used: usedMemMB,
                    free: freeMemMB
                }
            };
            res.write(`data: ${JSON.stringify(systemUsage)}\n\n`);
        });
    };

    const intervalSystem = setInterval(updateSystemUsage, 1000); // Update every second

    req.on('close', () => {
        clearInterval(intervalSystem);
        console.log('Stopped monitoring system usage');
    });
});

// Serve React app for any other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
