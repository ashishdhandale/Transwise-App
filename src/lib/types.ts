

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

export interface StationRate {
  fromStation: string;
  toStation: string;
  rate: number;
}

export interface KmRate {
  fromKm: number;
  toKm: number;
  ratePerKm: number;
}

export interface TruckRate {
  truckType: string;
  rate: number;
}

export interface ItemRate {
  itemId: string;
  rate: number;
}

export interface RateList {
  id: number;
  name: string;
  // Associations
  customerIds: number[];
  // Rate structures
  stationRates: StationRate[];
  kmRates: KmRate[];
  truckRates: TruckRate[];
  itemRates: ItemRate[];
}
