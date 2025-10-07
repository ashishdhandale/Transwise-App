
export interface LicenceType {
  id: string;
  name: "Trial" | "Bronze" | "Gold" | "Platinum" | string;
  fee: number;
  validityDays: number;
}

const LOCAL_STORAGE_KEY = 'transwise_licence_types';

const initialLicenceTypes: LicenceType[] = [
    { id: 'licence-1', name: 'Single User', fee: 500, validityDays: 30 },
    { id: 'licence-2', name: 'Multi Branch', fee: 2000, validityDays: 30 },
    { id: 'licence-3', name: 'Booking Agent', fee: 300, validityDays: 30 },
    { id: 'licence-4', name: 'Freight Forwarder', fee: 300, validityDays: 30 },
    { id: 'licence-5', name: 'Delivery Agent', fee: 300, validityDays: 30 },
    { id: 'licence-6', name: 'FTL', fee: 1000, validityDays: 30 },
];

export const getLicenceTypes = (): LicenceType[] => {
    if (typeof window === 'undefined') return initialLicenceTypes;
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (data) {
            // Ensure existing data has validityDays
            const parsedData = JSON.parse(data);
            const migratedData = parsedData.map((lic: Partial<LicenceType>) => {
                const initial = initialLicenceTypes.find(il => il.name === lic.name);
                return {
                    ...lic,
                    validityDays: lic.validityDays ?? initial?.validityDays ?? 30,
                };
            });
            return migratedData;
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
