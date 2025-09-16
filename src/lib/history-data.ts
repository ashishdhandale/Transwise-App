
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

export const historyData: BookingHistory[] = [
  {
    id: 'LR12345',
    logs: [
      {
        timestamp: '2024-07-30 09:15 AM',
        action: 'Booking Created',
        details: 'Booking created for 10 boxes of electronics from Raipur to Nagpur.',
        user: 'BranchUser01',
      },
      {
        timestamp: '2024-07-30 11:00 AM',
        action: 'Booking Update',
        details: 'Payment status changed to PAID.',
        user: 'BranchUser01',
      },
      {
        timestamp: '2024-07-30 04:30 PM',
        action: 'Dispatched from Warehouse',
        details: 'Package left Raipur warehouse. Vehicle: CG-04-AB-1234.',
        user: 'WarehouseStaff02',
      },
      {
        timestamp: '2024-07-31 01:00 AM',
        action: 'In Transit',
        details: 'Vehicle crossed Bhandara checkpoint.',
        user: 'System',
      },
      {
        timestamp: '2024-07-31 08:45 AM',
        action: 'Arrived at Hub',
        details: 'Package arrived at Nagpur distribution hub.',
        user: 'HubManager01',
      },
      {
        timestamp: '2024-07-31 10:20 AM',
        action: 'Out for Delivery',
        details: 'Assigned to delivery agent Ravi Kumar.',
        user: 'NagpurDispatch',
      },
      {
        timestamp: '2024-07-31 02:10 PM',
        action: 'Delivered',
        details: 'Package delivered to consignee and signed by Mr. Sharma.',
        user: 'Ravi Kumar (Driver)',
      },
    ],
  },
  {
    id: 'GR67890',
    logs: [
      {
        timestamp: '2024-08-01 10:00 AM',
        action: 'Booking Created',
        details: 'Booking for 50 bags of cement from Bilaspur to Durg.',
        user: 'CompanyAdmin',
      },
       {
        timestamp: '2024-08-01 02:00 PM',
        action: 'Dispatched from Warehouse',
        details: 'Goods loaded and dispatched. Vehicle: CG-07-XY-5678',
        user: 'BilaspurStaff',
      },
       {
        timestamp: '2024-08-01 05:00 PM',
        action: 'Delivered',
        details: 'Delivered to construction site in Durg.',
        user: 'Driver05',
      },
    ],
  },
];
