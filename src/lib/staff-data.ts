
import type { Staff } from './types';

const LOCAL_STORAGE_KEY = 'transwise_staff';

const initialStaff: Staff[] = [
    {
        id: 1,
        name: 'Amit Sharma',
        role: 'Manager',
        mobile: '9876543210',
        address: '123, Main Road, Nagpur',
        monthlySalary: 50000,
        photo: 'https://picsum.photos/seed/amit/200/200',
        joiningDate: '2022-01-15T00:00:00.000Z',
        username: 'amit.sharma',
        password: 'password123',
        branch: 'Main Office',
        bankName: 'State Bank of India',
        accountNo: '12345678901',
        ifscCode: 'SBIN0000123',
        emergencyContactName: 'Sunita Sharma',
        emergencyContactNo: '9876543219',
        idProofType: 'Aadhaar',
        idProofNo: '1234 5678 9012',
    },
    {
        id: 2,
        name: 'Priya Singh',
        role: 'Accountant',
        mobile: '9876543211',
        address: '456, West Avenue, Nagpur',
        monthlySalary: 35000,
        photo: 'https://picsum.photos/seed/priya/200/200',
        joiningDate: '2023-03-01T00:00:00.000Z',
        username: 'priya.singh',
        password: 'password123',
        branch: 'Pune Hub',
        bankName: 'HDFC Bank',
        accountNo: '09876543210',
        ifscCode: 'HDFC0000321',
        emergencyContactName: 'Rajesh Singh',
        emergencyContactNo: '9876543218',
        idProofType: 'PAN',
        idProofNo: 'ABCDE1234F',
    },
];

export const getStaff = (): Staff[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const savedStaff = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedStaff) {
            return JSON.parse(savedStaff);
        }
        // Initialize with default data if none exists
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialStaff));
        return initialStaff;
    } catch (error) {
        console.error("Failed to load staff data from local storage", error);
        return initialStaff;
    }
};

export const saveStaff = (staff: Staff[]) => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(staff));
    } catch (error) {
        console.error("Failed to save staff data to localStorage", error);
    }
};
