import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const staticPIDs = [
    // { pid: '1044', command: 'explorer.exe' },
    // { pid: '1200', command: 'cmd.exe' },
    // { pid: '884', command: 'Registry' },
    // { pid: 'abcd', command: 'InvalidProcess' },
];

const ProcessMonitor = () => {
    const [pid, setPid] = useState('');
    const [command, setCommand] = useState('');
    const [usage, setUsage] = useState({});
    const [systemUsage, setSystemUsage] = useState({});
    const [error, setError] = useState(null);
    const [processes, setProcesses] = useState(staticPIDs);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        fetch('/api/processes')
            .then(response => response.json())
            .then(data => setProcesses(prevProcesses => [...prevProcesses, ...data]))
            .catch(err => setError('Error fetching processes'));
    }, []);

    useEffect(() => {
        if (!pid) return;

        const eventSource = new EventSource(`/api/monitor/${pid}`);
        eventSource.onmessage = event => {
            const data = JSON.parse(event.data);
            if (data.error) {
                setError(data.error);
                eventSource.close();
            } else {
                setUsage(data);
                setError(null);
            }
        };
        eventSource.onerror = () => {
            setError('Error fetching data. Please make sure the PID is correct.');
            eventSource.close();
        };

        return () => eventSource.close();
    }, [pid]);

    useEffect(() => {
        const eventSource = new EventSource('/api/system');
        eventSource.onmessage = event => {
            const data = JSON.parse(event.data);
            setSystemUsage(data);
        };
        eventSource.onerror = () => {
            setError('Error fetching system data.');
            eventSource.close();
        };

        return () => eventSource.close();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const pidValue = e.target.elements.pid.value.trim();
        const selectedProcess = processes.find(process => process.pid === pidValue);
        if (pidValue && !isNaN(pidValue) && selectedProcess) {
            setPid(pidValue);
            setCommand(selectedProcess.command);
        } else {
            setError('Please enter a valid PID.');
        }
    };

    const handlePidClick = (pidValue) => {
        const selectedProcess = processes.find(process => process.pid === pidValue);
        if (pidValue && !isNaN(pidValue) && selectedProcess) {
            setPid(pidValue);
            setCommand(selectedProcess.command);
            setError(null);
        } else {
            setError('Please enter a valid PID.');
        }
    };

    const toggleDarkMode = () => {
        setDarkMode(prevDarkMode => !prevDarkMode);
    };

    useEffect(() => {
        document.body.className = darkMode ? 'dark-mode' : 'light-mode';
    }, [darkMode]);

    const filteredProcesses = processes
        .filter(process => !isNaN(process.pid))
        .sort((a, b) => a.pid - b.pid);

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="text-center"><i className="bi bi-bullseye"></i> TaskTracer</h1>
                <button className="btn btn-secondary" onClick={toggleDarkMode}>
                    {darkMode ? <i className="bi bi-sun-fill"></i> : <i className="bi bi-moon-fill"></i>}
                </button>
            </div>
            <form onSubmit={handleSubmit} className="mb-4">
                <div className={`input-group ${darkMode ? 'dark-mode' : 'light-mode'}`}>
                    <input type="text" name="pid" className="form-control" placeholder="Enter PID" />
                    <button type="submit" className="btn btn-primary">Monitor</button>
                </div>
            </form>
            {error && <div className="alert alert-danger mt-2">{error}</div>}
            {pid && (
                <div className={`card mb-4 ${darkMode ? 'dark-mode' : 'light-mode'}`}>
                    <h2 className="mb-3">Resource Usage for {command} (PID {pid})</h2>
                    <div className="card-body">
                        <div className="row">
                            <div className="col">
                                <div className="card">
                                    <div className="card-header">
                                        <i className="bi bi-memory"></i> Memory
                                    </div>
                                    <div className="card-body">
                                        {usage.memory !== undefined ? `${usage.memory.toFixed(2)} MB` : 'Loading...'}
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="card">
                                    <div className="card-header">
                                        <i className="bi bi-cpu-fill"></i> CPU:
                                    </div>
                                    <div className="card-body">
                                        {usage.cpu !== undefined ? `${usage.cpu.toFixed(2)} %` : 'Loading...'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className={`card mb-4 ${darkMode ? 'dark-mode' : 'light-mode'}`}>
                <h2 className="mb-3"><i className="bi bi-windows"></i> System-Wide Resource Usage</h2>
                <div className="card-body">
                    <div className="row">
                        <div className="col">
                            <div className="card">
                                <div className="card-header">
                                    <i className="bi bi-cpu-fill"></i> CPU
                                </div>
                                <div className="card-body">
                                    {systemUsage.cpu !== undefined ? `${systemUsage.cpu.toFixed(2)} %` : 'Loading...'}
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card">
                                <div className="card-header">
                                    <i className="bi bi-memory"></i> Total Memory
                                </div>
                                <div className="card-body">
                                    {systemUsage.memory !== undefined ? `${systemUsage.memory.total.toFixed(2)} MB` : 'Loading...'}
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card">
                                <div className="card-header">
                                    <i className="bi bi-memory"></i> Used Memory
                                </div>
                                <div className="card-body">
                                    {systemUsage.memory !== undefined ? `${systemUsage.memory.used.toFixed(2)} MB` : 'Loading...'}
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card">
                                <div className="card-header">
                                    <i className="bi bi-memory"></i> Free Memory
                                </div>
                                <div className="card-body">
                                    {systemUsage.memory !== undefined ? `${systemUsage.memory.free.toFixed(2)} MB` : 'Loading...'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <h2 className="mb-3">Running Processes</h2>
            <table className={`table ${darkMode ? 'table-dark' : 'table-light'}`}>
                <thead className={darkMode ? 'thead-dark' : ''}>
                    <tr>
                        <th>PID</th>
                        <th>Command</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProcesses.map(process => (
                        <tr key={process.pid}>
                            <td>{process.pid}</td>
                            <td>{process.command}</td>
                            <td>
                                <button onClick={() => handlePidClick(process.pid)} className="btn btn-outline-primary btn-sm">
                                    Monitor <i className="bi bi-activity"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProcessMonitor;
