export enum StaffRole {
  DIRECTOR = 'Director',
  HR = 'Hr',
  MANAGER = 'Manager',
  STATION_OFFICER = 'Station officer',
  VEHICLE_ASSISTANT = 'Vehicle assistant',
  DRIVER = 'Driver',
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
export type VendorConfig = {
  expressFactor: number;
  hqId: string;
  customerCareLine: string;
  vat: number;
  insuranceFactor: number;
  ecommerceFactor: number;
  localFactor: number;
  dim: number;
  vendor: Vendor;
  vendorId: string;
}

export type Vendor = {
  id: string;
  companyName: string;
  address: string;
  phoneNumber: string;
  email: string;
  domainName: string;
  logo: string | null;
  active: boolean;
  registration: { registrationBody: string; registrationNumber: string };
  config?: VendorConfig;
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
export type AdditionalCharge ={
  id: number;
  charge: string;
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
  latitude: number;
  longitude: number;
  lgas: Lga[];
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
export type User = {
  id: string;
  email: string;
  username: string;
  password: string;
  pin: string;
  role: UserRole;
  staff: Staff;
  customer: CorporateCustomer;
  createdAt: Date;
  updatedAt: Date;
}

export type Staff = {
  id: string;
  user: User;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  role: StaffRole;
  officePersonnelInfo?: OfficePersonnel;
  vehicleAssistantInfo?: TripPersonnel;
  driverInfo?: TripPersonnel
  createdAt: Date;
  updatedAt: Date;
}
export type OfficePersonnel ={
  id: string;
  staffInfo: Staff;
  station: Station;
  stationId: string;
  orders: Order[];
}
export type TripPersonnel = {
  id: string;
  staffInfo: Staff;
  currentStation: Station;
  currentStationId: string;
  operation: OperationEnum;
  routeCoverage?: RouteCoverage;
  registeredRoute: Route;
  registeredRouteId: string;
}

export type Route = {
  id: number;
  coverage: RouteCoverage;
  type: RouteType;
  code: string;
  stationIds: string[];
  vehicles: Vehicle
  drivers: TripPersonnel[];
  vehicleAssistants: TripPersonnel[];
}
export enum VehicleCoverage {
  LOCAL = "local",
  INTRASTATE = "intrastate",
  INTERSTATE = "interstate",
}
export enum VehicleType {
  BICYCLE = "bicycle",
  SCOOTER = "scooter",
  MOTORCYCLE = "motorcycle",
  TRICYCLE = "tricycle",
  CAR = "car",
  BUS = "bus",
  VAN = "van",
  TRUCK = "truck",
}

export type Vehicle = {
  id: string;
  registrationNumber: string;
  type: VehicleType;
  model: string;
  coverage: VehicleCoverage;
  registeredTo: Station;
  currentStation: Station;
  currentRoute?: Route; //update with route
  currentTrip?: Trip; // update with trips
}
export enum TripCoverage {
  LASTMAN = "last-man",
  INTRASTATE = "intrastate",
  INTERSTATE = "interstate",
}

export type Trip = {
  id: string;
  coverage: TripCoverage;
  vehicle: Vehicle;
  driver: TripPersonnel;
  vehicleAssistant?: TripPersonnel;
  shipments: Shipment[];
  createdAt: Date;
  updatedAt: Date;
  route: Route;
}
export type Shipment = {
  id: string;
  name: string;
  orders: Order[];
  trip: Trip;
  createdAt: Date;
  updatedAt: Date;
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
export type CorporateCustomer = {
  id: string;
  userInfo: User;
  customerInfo: Customer;
  walletBalance: number;
  businessName: string;
  businessAddress: { stateId: number; address: string };
  businessPhone: string;
  histories: History[];
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



export type Order = {
  id: string;
  trackingNumber: string;
  customerId: string;
  customer: Customer;
  orderType: OrderType;
  originStationId: string;
  stationOperation: StationOperation;
  interStationOperation: InterStationOperation;
  deliveryType: DeliveryType;
  originStation: Station;
  destinationStation: Station;
  destinationStationId: string;
  destinationRegionStationId: string;
  status: OrderStatus;
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
    width?: number;
    length?: number;
    type: string;
    category: string;
    condition: string;
    description: string;
  };
  insurance: { insured: boolean; itemValue?: number };
  additionalCharges: { charge: string; price: number }[];
  price: {
    freightPrice: number;
    totalAdditionalCharges: number;
    vat: number;
    insurance?: number;
    subTotal: number;
    Total: number;
  };
  payOnDelivery: boolean;
  paymentInfo?: OrderPayment;

  processedBy: OfficePersonnel;
  shipment?: Shipment;
  histories: History[];
  createdAt: Date;

  updatedAt: Date;
}


export type ItemType = {
  name: string
  pricing: TypePricing
  limit?: number
  min?: number
  price:number
}
export type ItemCategory = {
  id: number;
  name: string;
  priceFactor: number;
}


export type ExpensePurpose = {
  id: number;
  name: string;
  maxValue: number;
}

export enum ExpenseStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export type Expense = {
  id: string;
  purpose: string;
  orderId: string;
  amount: number;
  status: ExpenseStatus;
  requestedBy: Staff;
  respondedToBy: Staff;
  createdAt: Date;
  updatedAt: Date;
}



export enum ReceiptType {
  ORDER_PAYMENT = "order payment",
  WALLET_REFILL = "wallet refill",
}

export type Receipt = {
  id: string;
  receiptType: ReceiptType;
  amount: number;
  receiptInfo: string
  customerId: string;
  corporateCustomerId: string;
  orderId: string;
  processedBy: OfficePersonnel;
  createdAt: Date;
}

export type OrderPayment = {
  id: string;
  paymentType: PaymentType;
  order: Order;
  orderId: string;
  receiptId: string;
  createdAt: Date;
  updatedAt: Date;
}


export type WalletPayment = {
  id: string;
  corporateCustomerId: string;
  orderId: string;
  processedBy: OfficePersonnel;
}

export type Station ={
  id: string;
  name: string;
  nickName: string;
  code: string;
  latitude: number;
  longitude: number;
  stateId: number;
  state: State;
  lgaId: number;
  lga: Lga;
  address: string;
  type: StationType;
  localStations: Station[];
  regionalStation?: Station;
  regionalStationId: string;
  officePersonnel: OfficePersonnel[];
  drivers: TripPersonnel[];
  vehicleAssistants: TripPersonnel;
  availableVehicles: Vehicle[];
  registeredVehicles: Vehicle[];
  generatedOrders: Order[];
  incomingOrders: Order[];
  phoneNumbers: string[];
  createdAt: Date;
  updatedAt: Date;
}
export enum OrderStatus {
  PENDING = "pending",
  ACCEPTED= "Accepted",
  SHIPPED = "Shipped",
  TRANSIT = "In Transit",
  DELAYED = "Delayed",
}
