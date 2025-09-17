
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

export type UserRole = 'Admin' | 'Company' | 'Branch' | 'employee';

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

export interface BranchUser extends BaseUser {
  role: 'Branch';
  branchId: string;
}

export interface EmployeeUser extends BaseUser {
  role: 'employee';
  branchId: string;
}

export type User = AdminUser | CompanyUser | BranchUser | EmployeeUser;

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
}
