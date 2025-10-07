
export interface LicenceType {
  id: string;
  name: "Trial" | "Bronze" | "Gold" | "Platinum" | string;
  fee: number;
}

const LOCAL_STORAGE_KEY = 'transwise_licence_types';

const initialLicenceTypes: LicenceType[] = [
    { id: 'licence-1', name: 'Trial', fee: 0 },
    { id: 'licence-2', name: 'Bronze', fee: 250 },
    { id: 'licence-3', name: 'Gold', fee: 500 },
    { id: 'licence-4', name: 'Platinum', fee: 1000 },
];

export const getLicenceTypes = (): LicenceType[] => {
    if (typeof window === 'undefined') return initialLicenceTypes;
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialLicenceTypes));
        return initialLicenceTypes;
    } catch (error) {
        console.error("Could not load licence types.", error);
        return initialLicenceTypes;
    }
};

export const saveLicenceTypes = (licences: LicenceType[]) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(licences));
    } catch (error) {
        console.error("Could not save licence types.", error);
    }
};
