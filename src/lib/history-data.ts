
export interface LogEntry {
  timestamp: string;
  action:
    | 'Booking Created'
    | 'Booking Updated'
    | 'Booking Cancelled'
    | 'Booking Partially Cancelled'
    | 'Partially Delivered'
    | 'In Loading'
    | 'Dispatched from Warehouse'
    | 'In Transit'
    | 'Arrived at Hub'
    | 'Out for Delivery'
    | 'Delivered';
  details: string;
  user: string;
}

export interface BookingHistory {
  id: string; // This will be the LR Number (e.g., "CONAG01")
  logs: LogEntry[];
}

const LOCAL_STORAGE_KEY_HISTORY = 'transwise_history';

// Function to get all history logs
export const getHistoryLogs = (): BookingHistory[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORY);
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch (error) {
    console.error("Failed to load history logs from localStorage", error);
    return [];
  }
};

// Function to save all history logs
export const saveHistoryLogs = (history: BookingHistory[]) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (error) {
        console.error("Failed to save history logs to localStorage", error);
    }
}

// Function to add a new log entry
export const addHistoryLog = (lrNumber: string, action: LogEntry['action'], user: string, details?: string) => {
  if (typeof window === 'undefined') return;
  
  const allHistory = getHistoryLogs();
  let existingHistory = allHistory.find(h => h.id === lrNumber);

  const newLog: LogEntry = {
    timestamp: new Date().toLocaleString(),
    action,
    details: details || `${action} for LR: ${lrNumber}`,
    user,
  };

  if (existingHistory) {
    // Add new log to the top of the list
    existingHistory.logs.unshift(newLog);
  } else {
    existingHistory = {
      id: lrNumber,
      logs: [newLog],
    };
    allHistory.push(existingHistory);
  }

  saveHistoryLogs(allHistory);
};

export const historyData: BookingHistory[] = [];
