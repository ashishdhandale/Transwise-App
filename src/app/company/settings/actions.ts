

'use client';

import type { z } from 'zod';
import type { chargeSchema } from '@/components/company/settings/additional-charges-settings';
import type { itemDetailsSchema } from '@/components/company/settings/item-details-settings';
import type { dashboardSettingsSchema } from '@/components/company/settings/dashboard-settings';

const LOCAL_STORAGE_KEY_COMPANY_SETTINGS = 'transwise_company_settings';

// Define the shape of each module's settings
type CompanyProfileFormValues = z.infer<typeof import('@/components/company/settings/company-profile-settings').profileSchema>;
type GeneralInstructionsSettingsValues = z.infer<typeof import('@/components/company/settings/general-instructions-settings').generalInstructionsSchema>;
type BookingSettingsValues = z.infer<typeof import('@/components/company/settings/booking-settings').bookingSettingsSchema>;
type AdditionalChargesSettingsValues = z.infer<typeof chargeSchema>[];
type ItemDetailsSettingsValues = z.infer<typeof itemDetailsSchema>['columns'];
type DashboardSettingsValues = z.infer<typeof dashboardSettingsSchema>;


// Combine all settings types into a single interface
export type AllCompanySettings = CompanyProfileFormValues & GeneralInstructionsSettingsValues & BookingSettingsValues & {
    additionalCharges: AdditionalChargesSettingsValues;
    itemColumns: ItemDetailsSettingsValues;
} & DashboardSettingsValues;

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
    lrFormat: 'compact',
    bankName: '',
    accountHolderName: '',
    accountNo: '',
    ifscCode: '',
    bankBranch: '',
    // General Instructions
    defaultFromStation: 'Nagpur',
    printCopy: ['printAll', 'printSender', 'printReceiver', 'printDriver', 'printOffice'],
    sendNotification: ['notifSms', 'notifWhatsapp'],
    // Booking Settings
    defaultItemRows: 2,
    // Item Details
    itemColumns: [
        { id: 'ewbNo', label: 'EWB no.', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[220px]' },
        { id: 'itemName', label: 'Item Name*', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[160px]' },
        { id: 'description', label: 'Description*', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[220px]' },
        { id: 'qty', label: 'Qty*', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[100px]' },
        { id: 'actWt', label: 'Act.wt*', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[100px]' },
        { id: 'chgWt', label: 'Chg.wt*', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[100px]' },
        { id: 'rate', label: 'Rate', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[100px]' },
        { id: 'freightOn', label: 'Freight ON', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[130px]' },
        { id: 'lumpsum', label: 'Lumpsum', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[120px]' },
        { id: 'pvtMark', label: 'Pvt.Mark', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[140px]' },
        { id: 'invoiceNo', label: 'Invoice No', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[140px]' },
        { id: 'dValue', label: 'D.Value', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[140px]' },
    ],
    // Additional Charges
    additionalCharges: [
        { id: 'builtyCharge', name: 'Builty Charge', calculationType: 'fixed', value: 0, isVisible: true, isEditable: true, isCustom: false },
        { id: 'doorDelivery', name: 'Door Delivery', calculationType: 'fixed', value: 0, isVisible: true, isEditable: true, isCustom: false },
        { id: 'collectionCharge', name: 'Collection Charge', calculationType: 'fixed', value: 0, isVisible: true, isEditable: true, isCustom: false },
        { id: 'loadingLabourCharge', name: 'Loading Labour Charge', calculationType: 'per_kg_actual', value: 0, isVisible: true, isEditable: true, isCustom: false },
        { id: 'pfCharge', name: 'P.F. Charge', calculationType: 'fixed', value: 0, isVisible: true, isEditable: false, isCustom: false },
        { id: 'othersCharge', name: 'Others Charge', calculationType: 'fixed', value: 0, isVisible: true, isEditable: true, isCustom: false },
    ],
    // Dashboard Settings
    vehicleDocReminderDays: 30,
};

// This function is safe to call on the server and client. It returns only the default values.
export function getDefaultCompanySettings(): AllCompanySettings {
    return defaultSettings;
}

// This function should only be called on the client side, inside a useEffect.
export function loadCompanySettingsFromStorage(): AllCompanySettings {
    if (typeof window !== 'undefined') {
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
