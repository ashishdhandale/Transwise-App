
// This file has been cleared to start the challan feature from scratch.
// Types and data fetching logic will be re-added as we build the feature.

export interface Challan {}
export interface LrDetail {}

const CHALLAN_DATA_KEY = 'transwise_challan_data';
const LR_DETAILS_KEY = 'transwise_lr_details_data';


export const getChallanData = (): Challan[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(CHALLAN_DATA_KEY);
    return data ? JSON.parse(data) : [];
}

export const saveChallanData = (data: Challan[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CHALLAN_DATA_KEY, JSON.stringify(data));
}

export const getLrDetailsData = (): LrDetail[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(LR_DETAILS_KEY);
    return data ? JSON.parse(data) : [];
}

export const saveLrDetailsData = (data: LrDetail[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LR_DETAILS_KEY, JSON.stringify(data));
}
