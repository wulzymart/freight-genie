export enum StaffRole {
  MANAGER = "Manager",
  STATION_OFFICER = "Station officer",
  VEHICLE_ASSISTANT = "Vehicle assistant",
  DRIVER = "Driver",
}
export enum UserRole {
  DEVELOPER = "Developer",
  STAFF = "Staff",
  CUSTOMER = "Customer",
}
export enum PaymentType {
  CARD = 'CARD',
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  WALLET = 'WALLET',
}
export type NewCustomerType = "Yes" | "No";
export type UserType = {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  staff: {
    id: string;
    firstname: string;
    lastname: string;
    phoneNumber: string;
    role: StaffRole;
    officePersonnelInfo: null;
    vehicleAssistantInfo: null;
    driverInfo: null;
  };
};

export type VendorType = {
  id: string;
  companyName: string;
  address: string;
  phoneNumber: string;
  email: string;
  domainName: string;
  logo: string | null;
  verified: boolean;
  active: boolean;
  registration: null;
  config: null;
};

export enum StationType {
  REGIONAL = "regional",
  LOCAL = "local",
}

export type ApiResponseType = {
  message: string;
  success: boolean;
  [key: string]: any;
};
export enum RouteCoverage {
  LOCAL = "Regional",
  INTRASTATE = "Intrastate-regions",
  INTERSTATE = "Interstate-regions",
}
export enum RouteType {
  REGULAR = "Regular",
  EXPRESS = "Express",
}

export interface RouteInterface {
  id: number;
  coverage: RouteCoverage;
  type: RouteType;
  code: string;
  stationIds: string[];
}

export interface Station {
  id?: string;
  name: string;
  nickName?: string;
  code: string;

  latitude: null | number;

  longitude: null | number;
  stateId: number;

  lgaId: number;

  address: string;

  type: StationType;

  localStations: Station[];

  regionalStationId: string | null;

  phoneNumbers: string[];

  createdAt: Date;

  updatedAt: Date;
}
export interface Lga {
  id: number;
  name: string;
  stateId: number;
}
export interface State {
  id: number;
  name: string;
  code: string;
  capitalCode: string;
  lgas: Lga;
}
export enum OperationEnum {
  INTERSTATION = "Interstation",
  LASTMAN = "Last-man",
}
export enum CustomerType {
  INDIVIDUAL = "individual",
  CORPORATE = "corporate",
}
export interface History {
  id: string;
  info: string;
  performedBy: any;
  performedById: string;
  createdAt: Date;
}
export interface Customer {
  id: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  email: string;
  address: { stateId: number; address: string };
  customerType: CustomerType;
  histories: History[];
  // orders: Relation<Order[]>;
  createdAt: Date;
  updatedAt: Date;
}
export enum StationOperation {
  LOCAL = "Local",
  INTERSTATION = "Interstation",
}

export enum InterStationOperation {
  REGIONAL = "Regional",
  INTRASTATE = "Intrastate Regions",
  INTERSTATE = "Interstate Regions",
}
export enum OrderType {
  REGULAR = "Regular",
  EXPRESS = "Express",
}

export enum DeliveryType {
  PICKUP_TO_DOOR = "Pickup to door",
  PICKUP_TO_STATION = "Pickup to station",
  STATION_TO_STATION = "Station to station",
  STATION_TO_DOOR = "Station to door",
}
export enum TypePricing {
  FIXED = "fixed",
  PER_KG = "per kg",
}

export type VendorConfig = {
  expressFactor: number;
  hqId: string;
  customerCareLine: string;
  vat: number;
  insuranceFactor: number;
  ecommerceFactor: number;
  distanceFactor: number;
  distanceThreshold: number;
  logo: string;
};

export type Order = {
  id: string;
  trackingNumber: string;
  customerId: string;
  // customer: Relation<Customer>;
  orderType: OrderType;
  originStationId: string;
  stationOperation: StationOperation;
  interStationOperation?: InterStationOperation;
  deliveryType: DeliveryType;
  // originStation: Relation<Station>;
  // destinationStation: Relation<Station>;
  destinationStationId?: string;
  destinationRegionStationId?: string;
  receiver: {
    address: { stateId: number; address: string };
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  item: {
    quantity: number;
    weight?: number;
    height?: number;
    length?: number;
    width?: number;
    type: string;
    category: string;
    condition: string;
    description: string;
  };
  insurance: { insured: boolean; itemValue?: number };
  additionalCharges: { charge: string; price: number }[];
  price: {
    freightPrice: number;
    totalAdditionalService: number;
    VAT: number;
    insurance?: number;
    subTotal: number;
    Total: number;
  };
  paymentInfo?: {};
  payOnDelivery: boolean
  // processedBy: Relation<OfficePersonnel>;
  // shipment: Relation<Shipment> | null;
  histories: History[];
  createdAt: Date;
  updatedAt: Date;
};

export type ItemType = {
  name: string
  pricing: TypePricing
  limit?: number
  min?: number
  price:number
}
