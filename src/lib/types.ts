

export type DeliveryStatus =
  | 'Pending'
  | 'In Transit'
  | 'Delivered'
  | 'Delayed'
  | 'Cancelled';

export type DeliveryUrgency = 'low' | 'medium' | 'high';

export interface Delivery {
  id: string;
  customer: string;
  destination: string;
  status: DeliveryStatus;
  eta: string;
  timeWindowStart: string;
  timeWindowEnd: string;
  urgency: DeliveryUrgency;
  size: number;
}

export interface Vehicle {
  id: string;
  driver: string;
  status: 'Idle' | 'In Transit' | 'Maintenance';
  location: {
    lat: number;
    lng: number;
    name: string;
  };
}

export type UserRole = 'Admin' | 'Company';

export interface BaseUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AdminUser extends BaseUser {
  role: 'Admin';
}

export interface Company {
  id:string;
  name: string;
}

export interface CompanyUser extends BaseUser {
  role: 'Company';
  companyId: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  companyId: string;
}

export type User = AdminUser | CompanyUser;

export interface City {
  id: number;
  name: string;
  aliasCode: string;
  pinCode: string;
}

export type CustomerType = 
  | 'Company' 
  | 'Individual' 
  | 'Commission Agent' 
  | 'Booking Agent' 
  | 'Delivery Agent' 
  | 'Freight Forwarder'
  | 'Consignor'
  | 'Consignee';

export interface Customer {
  id: number;
  name: string;
  gstin: string;
  address: string;
  mobile: string;
  email: string;
  type: CustomerType;
  openingBalance: number;
}

export interface Item {
  id: number;
  name: string;
  hsnCode: string;
  description: string;
}

export type VendorType = 
  | 'Vehicle Supplier'
  | 'Freight Forwarder'
  | 'Delivery Agent' 
  | 'Booking Agent';

export interface Vendor {
  id: number;
  name: string;
  type: VendorType;
  address: string;
  mobile: string;
  email: string;
  openingBalance: number;
}

export type NewRequest = {
    id: number;
    companyName: string;
    gstNo: string;
    transporterId: string;
    address: string;
    contactNo: string;
    licenceType: "Trial" | "Bronze" | "Gold" | "Platinum";
};

export type ExistingUser = {
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

export interface Driver {
  id: number;
  name: string;
  licenseNumber: string;
  licenseValidity: string;
  mobile: string;
  address: string;
  bloodGroup: string;
  monthlySalary: number;
  photo?: string;
}

export type VehicleOwnerType = 'Own' | 'Supplier';

export interface VehicleMaster {
  id: number;
  vehicleNo: string;
  vehicleType: string;
  ownerType: VehicleOwnerType;
  supplierName?: string;
  rcNo: string;
  capacity?: number;
  insuranceValidity?: string;
  fitnessCertificateValidity?: string;
  pucValidity?: string;
  permitDetails?: string;
}

export type RateOnType = 'Chg.wt' | 'Act.wt' | 'Quantity' | 'Fixed';

export interface ChargeDetail {
    value: number;
    per: RateOnType;
}

export interface StationRate {
    fromStation: string;
    toStation: string;
    rate: number;
    rateOn: RateOnType;
    lrType?: string;
    itemName?: string;
    description?: string;
    wtPerUnit?: number;
    senderName?: string;
    receiverName?: string;
    doorDelivery?: ChargeDetail;
    collectionCharge?: ChargeDetail;
    loadingLabourCharge?: ChargeDetail;
}

export interface ItemRate {
    itemId: string;
    rate: number;
    rateOn: RateOnType;
}

export interface RateList {
  id: number;
  name: string;
  isStandard?: boolean;
  quotationDate?: string;
  validTill?: string;
  // Associations
  customerIds: number[];
  // Rate structures
  stationRates: StationRate[];
  itemRates: ItemRate[];
}

export type AccountType = 
  | 'Asset' | 'Liability' | 'Income' | 'Expense' | 'Capital' 
  | 'Customer' | 'Vendor' | 'Bank' | 'Cash';

export const accountGroups: { label: string; types: AccountType[] }[] = [
    { label: 'Assets', types: ['Bank', 'Cash', 'Asset'] },
    { label: 'Liabilities', types: ['Liability'] },
    { label: 'Equity', types: ['Capital'] },
    { label: 'Income', types: ['Income'] },
    { label: 'Expense', types: ['Expense'] },
];

// Readonly types that are linked to other master data
export const readOnlyAccountTypes: AccountType[] = ['Customer', 'Vendor'];

export interface Account {
  id: string; // Can be 'customer-1', 'vendor-2', 'account-3'
  name: string;
  type: AccountType;
  openingBalance: number;
  // Additional details for specific types
  gstin?: string;
  address?: string;
  mobile?: string;
  email?: string;
}

export type StaffRole = 
  | 'Manager'
  | 'Accountant'
  | 'Booking Clerk'
  | 'Loading Supervisor'
  | 'Delivery Boy'
  | 'Driver';

export interface Staff {
  id: number;
  name: string;
  role: StaffRole;
  mobile: string;
  address: string;
  monthlySalary: number;
  photo: string;
  joiningDate: string;
  username?: string;
  password?: string;
}
