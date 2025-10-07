
'use client';

import type { CompanyProfileFormValues } from '@/components/company/settings/company-profile-settings';

const LOCAL_STORAGE_KEY = 'transwise_company_profile';

const defaultProfile: CompanyProfileFormValues = {
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
    grnFormat: 'with_char'
};

export async function getCompanyProfile(): Promise<CompanyProfileFormValues> {
    if (typeof window === 'undefined') {
        // Return a default structure on the server
        return defaultProfile;
    }
    try {
        const savedProfile = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedProfile) {
            return JSON.parse(savedProfile);
        }
    } catch (error) {
        console.error("Could not load profile from localStorage", error);
    }
    // Return default if nothing is saved
    return defaultProfile;
}

export async function saveCompanyProfile(data: CompanyProfileFormValues): Promise<{ success: boolean; message: string }> {
    if (typeof window === 'undefined') {
      return { success: false, message: 'LocalStorage is not available.' };
    }
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        return { success: true, message: 'Profile saved successfully.' };
    } catch (error) {
        console.error('Failed to save profile:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
