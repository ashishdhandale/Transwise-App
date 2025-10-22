
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

export type UserRole = 'Admin' | 'Company' | 'Branch';

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

export type BranchType = 'Owned' | 'Agency';

export interface Branch {
  id: string;
  branchId: string;
  name: string;
  type: BranchType;
  location: string;
  address: string;
  city: string;
  state: string;
  contactNo: string;
  email: string;
  gstin: string;
  lrPrefix?: string;
  companyId: string;
  username?: string;
  password?: string;
  forcePasswordChange?: boolean;
  isActive?: boolean;
}

export type User = AdminUser | CompanyUser;

export interface City {
  id: number;
  name: string;
  aliasCode: string;
  pinCode: string;
}

export type CustomerType = 
  | 'Consignor / Consignee'
  | 'Commission Agent' 
  | 'Booking Agent' 
  | 'Delivery Agent' 
  | 'Freight Forwarder'
  | 'Agency';

export interface Customer {
  id: number;
  name: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  mobile: string;
  email: string;
  type: CustomerType;
  openingBalance: number;
}

export interface Item {
  id: number;
  name: string;
  aliasCode: string;
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
  city: string;
  state: string;
  mobile: string;
  email: string;
  openingBalance: number;
  gstin?: string;
  pan?: string;
  bankName?: string;
  accountNo?: string;
  ifscCode?: string;
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

export interface ExistingUser {
    id: number;
    companyId: string; // Unique internal ID for the company
    subIds: number;
    companyName: string;
    gstNo: string;
    transporterId: string;
    address: string;
    contactNo: string;
    licenceType: "Trial" | "Bronze" | "Gold" | "Platinum" | string;
    validTill: string;
    maxUsers: number;
    maxBranches: number;
    logo?: boolean;
    state: string;
    city: string;
    pan: string;
    companyEmail: string;
    authPersonName: string;
    authContactNo: string;
    authEmail: string; // This is the User ID for login
    role: UserRole;
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

export interface StaffPermissions {
  dashboard: boolean;
  booking: boolean;
  stock: boolean;
  accounts: boolean;
  master: boolean;
  reports: boolean;
  challan: boolean;
  vehicleHire: boolean;
  vehicleExpense: boolean;
  utility: boolean;
}

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
  branch?: string;
  bankName?: string;
  accountNo?: string;
  ifscCode?: string;
  emergencyContactName?: string;
  emergencyContactNo?: string;
  idProofType?: string;
  idProofNo?: string;
  permissions: StaffPermissions;
  forcePasswordChange?: boolean;
  isActive: boolean;
}

export interface OnlineInquiry {
    id: number;
    name: string;
    contact: string;
    source: 'Website' | 'Facebook' | 'Manual';
    message: string;
    status: 'New' | 'Contacted' | 'Resolved';
    date: string;
}
