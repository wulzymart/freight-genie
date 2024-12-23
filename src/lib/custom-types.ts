export enum StaffRole {
  DIRECTOR = "Director",
  HR = "Hr",
  REGION_MANAGER = "Region manager",
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
  CARD = "CARD",
  CASH = "CASH",
  TRANSFER = "TRANSFER",
  WALLET = "WALLET",
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
};

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

export type AdditionalCharge = {
  id: number;
  charge: string;
};

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
  [key: string]: any;
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
};

export type Staff = {
  id: string;
  user: User;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  role: StaffRole;
  orderActions?: History;
  routeActions?: History;
  tripActions?: History;
  shipmentActions?: History;
  customerActions?: History;
  corporateCustomerActions?: History;
  vehicleActions?: History;
  officePersonnelInfo?: OfficePersonnel;
  vehicleAssistantInfo?: TripPersonnel;
  driverInfo?: TripPersonnel;
  createdAt: Date;
  updatedAt: Date;
};
export type OfficePersonnel = {
  id: string;
  staffInfo: Staff;
  station: Station;
  stationId: string;
  orders: Order[];
};

export enum TripPersonnelStatus {
  AVAILABLE = "Available",
  ASSIGNED = "Assigned",
}

export type TripPersonnel = {
  id: string;
  staffInfo: Staff;
  currentStation: Station;
  currentStationId: string;
  registeredIn: Station;
  registeredInId: string;
  status: TripPersonnelStatus;
  operation: OperationEnum;
  routeCoverage?: RouteCoverage;
  registeredRoute?: Route;
  routeType?: RouteType;
  registeredRouteId?: string;
  currentTrip?: Trip;
  currentTripId?: string;
  currentVehicle?: Vehicle;
  currentVehicleId?: string;
};

export type Route = {
  id: number;
  coverage: RouteCoverage;
  type: RouteType;
  code: string;
  stationIds: string[];
  routingInfo: any;
  vehicles: Vehicle[];
  drivers: TripPersonnel[];
  vehicleAssistants: TripPersonnel[];
  history?: History[];
};

export enum VehicleCoverage {
  LOCAL = "local",
  REGIONAL = "regional",
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

export enum VehicleStatus {
  AVAILABLE = "Available",
  DAMAGED = "Damaged",
  TRANSIT = "In-transit",
}

export type Vehicle = {
  id: string;
  registrationNumber: string;
  type: VehicleType;
  model: string;
  status: VehicleStatus;
  coverage: VehicleCoverage;
  registeredTo: Station;
  currentStation: Station;
  registeredToId: string;
  currentStationId: string;
  currentRoute?: Route; //update with route
  currentTrip?: Trip; // update with trips
  currentTripId?: string;
  history?: History[];
};

export enum TripCoverage {
  LASTMAN = "Last-man",
  REGIONAL = "Regional",
  INTRASTATE = "Intrastate",
  INTERSTATE = "Interstate",
}

export enum TripStatus {
  PLANNED = "Planned",
  ONGOING = "Ongoing",
  DELAYED = "Delayed",
  COMPLETED = "Completed",
}

export enum TripType {
  EXPRESS = "Express",
  REGULAR = "Regular",
}

export type Trip = {
  id: string;
  code: string;
  coverage: TripCoverage;
  type: TripType;
  status: TripStatus;
  vehicle: Vehicle;
  driver: TripPersonnel;
  vehicleAssistant?: TripPersonnel;
  vehicleId: string;
  driverId: string;
  vehicleAssistantId?: string;
  shipments: Shipment[];
  origin: Station;
  originId: string;
  destination: Station;
  destinationId: string;
  createdAt: Date;
  updatedAt: Date;
  route: Route;
  routeId: number;
  returnTrip: boolean;
  routingInfo?: any;
  currentStationId?: string;
  nextStationId?: string;
  history?: History[];
};

export enum ShipmentStatus {
  CREATED = "Created",
  LOADED = "Loaded",
  TRANSIT = "In-transit",
  DELAYED = "Delayed",
  INTERMEDIATE = "At Intermediate Station",
  DELIVERED = "Delivered",
}

export enum ShipmentType {
  DIRECT = "Direct",
  TRANSHIPMENT = "Transhipment",
}

export enum ShipmentCoverage {
  LOCAL = "Local",
  REGIONAL = "Regional",
  INTRASTATE = "Intrastate",
  INTERSTATE = "Interstate",
}

export type Shipment = {
  id: string;
  code: string;
  status: ShipmentStatus;
  coverage: ShipmentCoverage;
  type: ShipmentType;
  orders: Order[];
  trip?: Trip;
  tripId?: string;
  origin: Station;
  originId: string;
  destination: Station;
  destinationId: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface Customer {
  id: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  email: string;
  address: { stateId: number; address: string };
  customerType: CustomerType;
  corporateCustomer?: CorporateCustomer;
  history: History[];
  orders: Order[];
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
  history: History[];
  createdAt: Date;
  updatedAt: Date;
};

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
  history: History[];
  createdAt: Date;

  updatedAt: Date;
};

export type ItemType = {
  name: string;
  pricing: TypePricing;
  limit?: number;
  min?: number;
  price: number;
};
export type ItemCategory = {
  id: number;
  name: string;
  priceFactor: number;
};

export type ExpensePurpose = {
  id: number;
  name: string;
  maxValue: number;
};

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
};

export enum ReceiptType {
  ORDER_PAYMENT = "order payment",
  WALLET_REFILL = "wallet refill",
}

export type Receipt = {
  id: string;
  receiptType: ReceiptType;
  amount: number;
  receiptInfo: string;
  customerId: string;
  corporateCustomerId: string;
  orderId: string;
  processedBy: OfficePersonnel;
  createdAt: Date;
};

export type OrderPayment = {
  id: string;
  paymentType: PaymentType;
  order: Order;
  orderId: string;
  receiptId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WalletPayment = {
  id: string;
  corporateCustomerId: string;
  orderId: string;
  amount: number;
  processedBy: OfficePersonnel;
};

export type Station = {
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
  currentDrivers: TripPersonnel[];
  registeredDrivers: TripPersonnel[];
  currentVehicleAssistants: TripPersonnel[];
  registeredVehicleAssistants: TripPersonnel[];
  availableVehicles: Vehicle[];
  registeredVehicles: Vehicle[];
  generatedOrders: Order[];
  incomingOrders: Order[];
  phoneNumbers: string[];
  createdAt: Date;
  updatedAt: Date;
};

export enum OrderStatus {
  PENDING = "pending",
  ACCEPTED = "Accepted",
  SHIPPED = "Shipped",
  TRANSIT = "In Transit",
  DELAYED = "Delayed",
}

export type Coordinate = [long: number, lat: number];

export enum RoutingProfileType {
  OSRM = "osrm",
  ORS = "ors",
}
