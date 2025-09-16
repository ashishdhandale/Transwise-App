
type NewRequest = {
    id: number;
    companyName: string;
    gstNo: string;
    transporterId: string;
    address: string;
    contactNo: string;
    licenceType: "Trial" | "Bronze" | "Gold" | "Platinum";
};

type ExistingUser = {
    id: number;
    userId: string;
    subIds: number;
    companyName: string;
    gstNo: string;
    transporterId: string;
    address: string;
    contactNo: string;
    totalIssuedIds: number;
    licenceType: "Trial" | "Bronze" | "Gold" | "Platinum";
    validTill: string;
};

const randomFrom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateRandomGst = (): string => {
    const num = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const letters1 = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
    const letters2 = 'ABCFGHLJPT';
    const randomLetters = Array.from({ length: 4 }, () => letters1[Math.floor(Math.random() * letters1.length)]).join('');
    const randomPan = `${letters1[Math.floor(Math.random() * letters1.length)]}${letters2[Math.floor(Math.random() * letters2.length)]}${randomLetters}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}${letters1[Math.floor(Math.random() * letters1.length)]}`;
    const rest = `${Math.floor(Math.random() * 10)}${randomFrom(['Z', 'A', 'B', 'C'])}${Math.floor(Math.random() * 10)}`;
    return `${num}${panLetters(pan(10))}${rest}`;
};

const panLetters = (str: string) => str.slice(0, 10);
const pan = (length: number) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}


const companySuffixes = ["Logistics", "Movers", "Transports", "Shippers", "Carriers", "Freight", "Express", "Haulers", "Group", "Solutions"];
const firstNames = ["Amit", "Rohan", "Suresh", "Vikram", "Deepak", "Priya", "Sunita", "Anjali", "Kavita", "Meera"];
const lastNames = ["Sharma", "Verma", "Singh", "Gupta", "Kumar", "Patel", "Shah", "Mehta", "Jain", "Reddy"];
const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow"];
const states = ["MH", "DL", "KA", "TN", "WB", "TS", "MH", "GJ", "RJ", "UP"];
const licenceTypes: ("Trial" | "Bronze" | "Gold" | "Platinum")[] = ["Trial", "Bronze", "Gold", "Platinum"];

const generateNewRequests = (count: number): NewRequest[] => {
    const requests: NewRequest[] = [];
    for (let i = 1; i <= count; i++) {
        const companyName = `${randomFrom(firstNames)} ${randomFrom(companySuffixes)}`;
        const city = randomFrom(cities);
        requests.push({
            id: i,
            companyName: companyName,
            gstNo: generateRandomGst(),
            transporterId: `TID-${Math.floor(1000 + Math.random() * 9000)}`,
            address: `${Math.floor(10 + Math.random() * 989)} Main St, ${city}`,
            contactNo: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
            licenceType: randomFrom(licenceTypes),
        });
    }
    return requests;
};

const generateExistingUsers = (count: number): ExistingUser[] => {
    const users: ExistingUser[] = [];
    for (let i = 1; i <= count; i++) {
        const city = randomFrom(cities);
        const validTillYear = new Date().getFullYear() + Math.floor(Math.random() * 3);
        const validTillMonth = Math.floor(Math.random() * 12) + 1;
        const validTillDay = Math.floor(Math.random() * 28) + 1;

        users.push({
            id: i,
            userId: `USR-${String(i).padStart(3, '0')}`,
            subIds: Math.floor(Math.random() * 10),
            companyName: `${randomFrom(lastNames)} ${randomFrom(companySuffixes)}`,
            gstNo: generateRandomGst(),
            transporterId: `TID-${Math.floor(1000 + Math.random() * 9000)}`,
            address: `${Math.floor(10 + Math.random() * 989)} Industrial Area, ${city}`,
            contactNo: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
            totalIssuedIds: Math.floor(5 + Math.random() * 45),
            licenceType: randomFrom(licenceTypes),
            validTill: `${validTillYear}-${String(validTillMonth).padStart(2, '0')}-${String(validTillDay).padStart(2, '0')}`,
        });
    }
    return users;
};

export const newRequests: NewRequest[] = generateNewRequests(50);
export const existingUsers: ExistingUser[] = generateExistingUsers(50);
