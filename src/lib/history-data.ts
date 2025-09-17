
export interface LogEntry {
  timestamp: string;
  action:
    | 'Booking Created'
    | 'Booking Updated'
    | 'Dispatched from Warehouse'
    | 'In Transit'
    | 'Arrived at Hub'
    | 'Out for Delivery'
    | 'Delivered';
  details: string;
  user: string;
}

export interface BookingHistory {
  id: string; // This will be the GR Number (e.g., "CONAG01")
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

// Function to add a new log entry
export const addHistoryLog = (grNumber: string, action: LogEntry['action'], user: string) => {
  if (typeof window === 'undefined') return;
  
  const allHistory = getHistoryLogs();
  const existingHistory = allHistory.find(h => h.id === grNumber);

  const newLog: LogEntry = {
    timestamp: new Date().toLocaleString(),
    action,
    details: `${action} for GR: ${grNumber}`,
    user,
  };

  if (existingHistory) {
    existingHistory.logs.push(newLog);
  } else {
    allHistory.push({
      id: grNumber,
      logs: [newLog],
    });
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(allHistory));
  } catch (error) {
    console.error("Failed to save history log to localStorage", error);
  }
};

export const historyData: BookingHistory[] = [];
