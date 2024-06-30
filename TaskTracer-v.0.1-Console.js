const pidusage = require('pidusage');
const { Observable, combineLatest } = require('rxjs');
const { map, distinctUntilChanged, throttleTime } = require('rxjs/operators');

// Funkcja do monitorowania zasobów dla wybranego procesu
function monitorProcessUsage(pid) {
    // Tworzymy strumień zdarzeń dotyczących zużycia pamięci
    const memoryUsage$ = new Observable((observer) => {
        const updateMemoryInfo = () => {
            pidusage(pid, (err, stats) => {
                if (err) {
                    console.error('Błąd podczas pobierania statystyk pamięci procesu:', err);
                    return;
                }
                observer.next({
                    memory: {
                        rss: stats.memory / 1024 / 1024, // w MB
                        // Można dodać więcej informacji o pamięci, jeśli są dostępne
                    }
                });
            });
        };

        const intervalMemory = setInterval(updateMemoryInfo, 1000);

        return () => clearInterval(intervalMemory);
    });

    // Tworzymy strumień zdarzeń dotyczących użycia procesora
    const cpuUsage$ = new Observable((observer) => {
        const updateCPUInfo = () => {
            pidusage(pid, (err, stats) => {
                if (err) {
                    console.error('Błąd podczas pobierania statystyk CPU procesu:', err);
                    return;
                }
                observer.next({
                    cpu: {
                        user: stats.cpu / 1000, // w sekundach
                        // Można dodać więcej informacji o CPU, jeśli są dostępne
                    }
                });
            });
        };

        const intervalCPU = setInterval(updateCPUInfo, 1000);

        return () => clearInterval(intervalCPU);
    });

    // Łączymy oba strumienie za pomocą combineLatest
    const combined$ = combineLatest([memoryUsage$, cpuUsage$]);

    combined$.pipe(
        map(([memoryInfo, cpuUsage]) => ({
            memory: {
                rss: memoryInfo.memory.rss,
            },
            cpu: {
                user: cpuUsage.cpu.user,
            },
        })),
        distinctUntilChanged(),
        throttleTime(200)
    ).subscribe((usageInfo) => {
        console.log(`Resource Usage for PID ${pid}:`, usageInfo);
    });
}

// Przykładowy PID procesu, który chcemy monitorować
const pidToMonitor = process.argv[2]; // Pobieramy PID jako argument linii poleceń
if (!pidToMonitor) {
    console.error('Nie podano PID procesu do monitorowania.');
    process.exit(1);
}

// Rozpoczynamy monitorowanie zasobów dla wybranego procesu
monitorProcessUsage(pidToMonitor);
