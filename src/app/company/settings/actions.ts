
'use server';

import type { CompanyProfileFormValues } from "@/components/company/settings/company-profile-settings";

// In a real application, this would interact with a database like Firestore or a SQL database.
// For this prototype, we'll simulate a single database record using a server-side variable.
let companyProfileRecord: CompanyProfileFormValues | null = null;

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
};


/**
 * Retrieves the company profile.
 * If no profile exists, it returns a default one.
 */
export async function getCompanyProfile(): Promise<CompanyProfileFormValues> {
    console.log('Server Action: getCompanyProfile');
    // Simulate async database call
    await new Promise(resolve => setTimeout(resolve, 50)); 
    
    if (companyProfileRecord) {
        return companyProfileRecord;
    }
    
    return defaultProfile;
}

/**
 * Saves the company profile.
 * @param data The company profile data to save.
 * @returns A success or error message.
 */
export async function saveCompanyProfile(data: CompanyProfileFormValues): Promise<{ success: boolean, message: string }> {
    console.log('Server Action: saveCompanyProfile', data);
    // Simulate async database call
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        companyProfileRecord = data;
        return { success: true, message: 'Profile saved successfully.' };
    } catch (error) {
        console.error('Failed to save profile:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

    