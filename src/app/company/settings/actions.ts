
'use client';

import type { CompanyProfileFormValues } from '@/components/company/settings/company-profile-settings';
import type { GeneralInstructionsSettingsValues } from '@/components/company/settings/general-instructions-settings';
import type { BookingSettingsValues } from '@/components/company/settings/booking-settings';


export type AllCompanySettings = CompanyProfileFormValues & GeneralInstructionsSettingsValues & BookingSettingsValues;

const LOCAL_STORAGE_KEY_COMPANY_SETTINGS = 'transwise_company_settings';


export const defaultSettings: AllCompanySettings = {
    // Company Profile
    companyName: 'My Transwise Company',
    lrPrefix: 'CONAG',
    challanPrefix: 'CHLN',
    headOfficeAddress: '123 Logistics Lane, Transport City, 440001',
    officeAddress2: '',
    city: 'Nagpur',
    pan: 'ABCDE1234F',
    gstNo: '27ABCDE1234F1Z5',
    companyContactNo: '9876543210',
    companyEmail: 'contact@transwise.com',
    currency: 'INR',
    countryCode: 'en-IN',
    grnFormat: 'with_char',
    // General Instructions
    printCopy: ['printAll', 'printSender', 'printReceiver', 'printDriver', 'printOffice'],
    sendNotification: ['notifSms', 'notifWhatsapp'],
    // Booking Settings
    defaultItemRows: 2,
};

// This function is safe to call on the server and client. It returns only the default values.
export function getDefaultCompanySettings(): AllCompanySettings {
    return defaultSettings;
}

// This function should only be called on the client side, inside a useEffect.
export function loadCompanySettingsFromStorage(): AllCompanySettings {
    try {
        const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY_COMPANY_SETTINGS);
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            // Merge with defaults to ensure all keys are present
            return { ...defaultSettings, ...parsed };
        }
    } catch (error) {
        console.error("Could not load company settings from localStorage", error);
    }
    return defaultSettings;
}


export async function saveCompanySettings(data: AllCompanySettings): Promise<{ success: boolean; message: string }> {
    if (typeof window === 'undefined') {
      return { success: false, message: 'LocalStorage is not available.' };
    }
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY_COMPANY_SETTINGS, JSON.stringify(data));
        return { success: true, message: 'Settings saved successfully.' };
    } catch (error) {
        console.error('Failed to save settings:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
