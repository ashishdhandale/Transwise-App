
export interface LogEntry {
  timestamp: string;
  action:
    | 'Booking Created'
    | 'Booking Update'
    | 'Dispatched from Warehouse'
    | 'In Transit'
    | 'Arrived at Hub'
    | 'Out for Delivery'
    | 'Delivered';
  details: string;
  user: string;
}

export interface BookingHistory {
  id: string;
  logs: LogEntry[];
}

export const historyData: BookingHistory[] = [];
