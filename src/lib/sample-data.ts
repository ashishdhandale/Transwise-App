
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

const companySuffixes = ["Logistics", "Movers", "Transports", "Shippers", "Carriers", "Freight", "Express", "Haulers", "Group", "Solutions"];
const firstNames = ["Amit", "Rohan", "Suresh", "Vikram", "Deepak", "Priya", "Sunita", "Anjali", "Kavita", "Meera"];
const lastNames = ["Sharma", "Verma", "Singh", "Gupta", "Kumar", "Patel", "Shah", "Mehta", "Jain", "Reddy"];
const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow"];
const licenceTypes: ("Trial" | "Bronze" | "Gold" | "Platinum")[] = ["Trial", "Bronze", "Gold", "Platinum"];

// A simple pseudo-random number generator to ensure consistent data
class SimpleSeededRandom {
    private seed: number;
    constructor(seed: number) {
        this.seed = seed;
    }
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
}

const randomFrom = <T>(arr: T[], rng: SimpleSeededRandom): T => arr[Math.floor(rng.next() * arr.length)];

const generateRandomGst = (rng: SimpleSeededRandom): string => {
    const num = Math.floor(rng.next() * 100).toString().padStart(2, '0');
    const letters1 = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
    const letters2 = 'ABCFGHLJPT';
    const randomPan = Array.from({ length: 10 }, () => characters[Math.floor(rng.next() * characters.length)]).join('');
    const rest = `${Math.floor(rng.next() * 10)}${randomFrom(['Z', 'A', 'B', 'C'], rng)}${Math.floor(rng.next() * 10)}`;
    return `${num}${randomPan.slice(0, 10)}${rest}`;
};

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const generateNewRequests = (count: number): NewRequest[] => {
    const rng = new SimpleSeededRandom(12345); // Fixed seed for "new requests"
    const requests: NewRequest[] = [];
    for (let i = 1; i <= count; i++) {
        const companyName = `${randomFrom(firstNames, rng)} ${randomFrom(companySuffixes, rng)}`;
        const city = randomFrom(cities, rng);
        requests.push({
            id: i,
            companyName: companyName,
            gstNo: generateRandomGst(rng),
            transporterId: `TID-${Math.floor(1000 + rng.next() * 9000)}`,
            address: `${Math.floor(10 + rng.next() * 989)} Main St, ${city}`,
            contactNo: `9${Math.floor(100000000 + rng.next() * 900000000)}`,
            licenceType: randomFrom(licenceTypes, rng),
        });
    }
    return requests;
};

const generateExistingUsers = (count: number): ExistingUser[] => {
    const rng = new SimpleSeededRandom(54321); // Different fixed seed for "existing users"
    const users: ExistingUser[] = [];
    for (let i = 1; i <= count; i++) {
        const city = randomFrom(cities, rng);
        const currentYear = new Date().getFullYear();
        const validTillYear = currentYear + Math.floor(rng.next() * 3);
        const validTillMonth = Math.floor(rng.next() * 12) + 1;
        const validTillDay = Math.floor(rng.next() * 28) + 1;

        users.push({
            id: i,
            userId: `USR-${String(i).padStart(3, '0')}`,
            subIds: Math.floor(rng.next() * 10),
            companyName: `${randomFrom(lastNames, rng)} ${randomFrom(companySuffixes, rng)}`,
            gstNo: generateRandomGst(rng),
            transporterId: `TID-${Math.floor(1000 + rng.next() * 9000)}`,
            address: `${Math.floor(10 + rng.next() * 989)} Industrial Area, ${city}`,
            contactNo: `9${Math.floor(100000000 + rng.next() * 900000000)}`,
            totalIssuedIds: Math.floor(5 + rng.next() * 45),
            licenceType: randomFrom(licenceTypes, rng),
            validTill: `${validTillYear}-${String(validTillMonth).padStart(2, '0')}-${String(validTillDay).padStart(2, '0')}`,
        });
    }
    return users;
};

// Generate the data once and export it
export const newRequests: NewRequest[] = generateNewRequests(50);
export const existingUsers: ExistingUser[] = generateExistingUsers(50);
