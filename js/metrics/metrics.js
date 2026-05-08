/**
 * Calculates the average scheduling metrics from execution traces.
 * * @param {Array} executionTraces - Array of objects: { processId, start, finish }
 * @param {Array} processes - Array of original process objects: { id, arrivalTime, burstTime }
 * @returns {Array} - [avgTurnaroundTime, avgWaitingTime, avgResponseTime]
 */
function metrics(executionTraces, processes) {
    // 1. Set up an object to track the first start and last finish times for each process
    const processStats = {};

    processes.forEach(process => {
        processStats[process.id] = {
            arrivalTime: process.arrivalTime,
            burstTime: process.burstTime,
            firstStart: null,
            lastFinish: null
        };
    });

    // 2. Iterate through the trace array to find First Start (for RT) and Last Finish (for TAT)
    executionTraces.forEach(trace => {
        const stats = processStats[trace.processId];
        if (!stats) return; // Skip if process ID isn't in our initial list

        // Update first start time (if it hasn't been set yet, or if we found an earlier start)
        if (stats.firstStart === null || trace.start < stats.firstStart) {
            stats.firstStart = trace.start;
        }

        // Update last finish time (completion time)
        if (stats.lastFinish === null || trace.finish > stats.lastFinish) {
            stats.lastFinish = trace.finish;
        }
    });

    // 3. Calculate metrics for each process to find the totals
    let totalTAT = 0;
    let totalWT = 0;
    let totalRT = 0;
    const numProcesses = processes.length;

    Object.values(processStats).forEach(stats => {
        // Turnaround Time = Completion Time (last finish) - Arrival Time
        const tat = stats.lastFinish - stats.arrivalTime;
        
        // Waiting Time = Turnaround Time - Burst Time
        const wt = tat - stats.burstTime;
        
        // Response Time = First Start Time - Arrival Time
        const rt = stats.firstStart - stats.arrivalTime;

        totalTAT += tat;
        totalWT += wt;
        totalRT += rt;
    });

    // 4. Calculate averages
    const avgTurnaround = Number((totalTAT / numProcesses).toFixed(2));
    const avgWaiting = Number((totalWT / numProcesses).toFixed(2));
    const avgResponse = Number((totalRT / numProcesses).toFixed(2));

    // Output strictly as required by the handout: [avgTurnaround, avgWaiting, avgResponse]
    return [avgTurnaround, avgWaiting, avgResponse];
}

// Ensure it can be imported by George in the UI/Scenario testing branch
export default metrics;
