import * as z from "zod";
import {
  DeliveryType,
  InterStationOperation,
  OperationEnum,
  OrderType, PaymentType,
  RouteCoverage,
  RouteType,
  StaffRole,
  StationOperation,
  StationType,
  TypePricing,
  UserRole,
} from "./custom-types";


export const ngPhoneNumbersSchema = z
  .string()
  .regex(/^\+234\d{10}(\s+\+234\d{10})*$/, {
    message: "please input valid phone numbers",
  });
export const ngPhoneNumberSchema = z.string().regex(/^\+234\d{10}$/, {
  message: "please input a valid phone number",
});
export const firstNameSchema = z
  .string()
  .min(2, { message: "First name is required" });
export const lastNameSchema = z
  .string()
  .min(2, { message: "Last name is required" });
export const stateSchema = z
  .string()
  .min(2, { message: "Please select a state" });
// export const lgaSchema = z.string().min(2, { message: "Please select LGA" });
export const addressSchema = z
  .string()
  .min(10, { message: "Provide a detailed address" });
export const stationSchema = z
  .string()
  .min(2, { message: "Please select a station" });


// export const fullNameSchema = z
//   .string()
//   .min(5, { message: "Please provide name and surname" });
// export const genderSchema = z
//   .enum(["male", "female", ""])
//   .refine((val) => val !== "", {
//     message: "select a gender",
//   });

export const userNameSchema = z
  .string()
  .min(3, {
    message: "minimum of 3 characters (must start a letter)",
  })
  .regex(/^[a-zA-Z][a-zA-Z0-9]+$/, {
    message: "Can only contain alphanumeric characters starting with letters",
  })
  .trim()
  .refine((s) => !s.includes(" "), "Ensure No Spaces!");
export const emailSchema = z
  .string()
  .email({ message: "Please provide a valid Email" });
export const passwordSchema = z
  .string()
  .min(6, { message: "at least 6 characters" })
  .max(20, { message: "Not more than 20 characters" })
  .refine((password) => /[A-Z]/.test(password), {
    message: "Must contain at least 1 upper case letter",
  })
  .refine((password) => /[a-z]/.test(password), {
    message: "Must contain at least 1 lower case letter",
  })
  .refine((password) => /[0-9]/.test(password), {
    message: "Must contain at least 1 number",
  });

export const userRoleSchema = z.enum(Object.values(UserRole) as any);

export const userFormSchema = z.object({
  username: userNameSchema,
  email: emailSchema,
  role: userRoleSchema,
});
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, { message: "Old Password is required" }),
    newPassword: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm Password is required" }),
  })
  .superRefine(({ confirmPassword, newPassword }, ctx) => {
    if (newPassword !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });
export const pinSchema = z.object({
  oldPin: z.union([z.undefined(), z.string().length(4)]),
  newPin: z.string().length(4, { message: "Pin of 4 digits required" }),
  password: z.string().min(1, { message: "Password is required" }),
});
const floatRegex = /^[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?$/;
export const stationFormSchema = z.object({
  name: z.string(),
  code: z.string(),
  nickName: z.string().min(2, { message: "Nickname is required" }),
  stateId: z
    .string()
    .min(1, { message: "Please select a state" })
    .refine(
      (data) => !!data,
      { message: "Please select a state" }
    ),
  lgaId: z
    .string()
    .min(1, { message: "Please select a lga" })
    .refine(
      (data) => data,
      { message: "Please select a lga" }
    ),
  address: addressSchema,
  phoneNumbers: ngPhoneNumbersSchema,
  longitude: z
    .string()
    .refine(
      (data) => floatRegex.test(data),
      {
        message: "Longitude must be a number eg 0.00",
      }
    )
    .transform((arg) => parseFloat(arg)),
  latitude: z
    .string()
    .refine(
      (data) => floatRegex.test(data),
      { message: "Latitude must be a number eg 0.00" }
    )
    .transform((arg) => parseFloat(arg)),
  type: z.enum([StationType.LOCAL, StationType.REGIONAL]),
  regionalStationId: z.optional(
    z.string().min(1, { message: "Please select a regional station" })
  ),
});

// export const salaryInfoSchema = z.object({
//   bankName: z.string().min(3, { message: "Please input staff's bank name" }),
//   bankAccount: z
//     .string()
//     .regex(/^\d{10}$/, { message: "account number can only be 10 digits" }),
//   grossSalary: z.number(),
//   tax: z.number(),
//   pension: z.number(),
//   otherDeductions: z.number(),
// });

export const officeStaffSchema = z.object({
  stationId: stationSchema,
});

export const tripStaffSchema = z
  .object({
    currentStationId: z.string(),
    registeredRouteId: z.string().transform((x) => parseInt(x)),
    operation: z.enum(Object.values(OperationEnum) as any),
    routeCoverage: z.optional(z.enum(Object.values(RouteCoverage) as any)),
    routeType: z.optional(z.enum(Object.values(RouteType) as any))
  })
  .superRefine(({ operation, registeredRouteId }, ctx) => {
    if (operation === OperationEnum.INTERSTATION && !registeredRouteId)
      return ctx.addIssue({
        message: "Please select a route",
        path: ["registeredRouteId"],
        code: "custom",
      });
    if (operation === OperationEnum.LASTMAN && registeredRouteId)
      return ctx.addIssue({
        message: "Route is not necessary",
        path: ["registeredRouteId", "operation"],
        code: "custom",
      });
  });

export const newCustomerSchema = z.object({
  firstname: firstNameSchema,
  lastname: lastNameSchema,
  email: emailSchema,
  phoneNumber: ngPhoneNumberSchema,
  address: z.object({
    stateId: z
      .string()
      .min(1, { message: "Please select a state" })
      .transform((x) => parseInt(x)),
    address: addressSchema,
  }),
});

export const orderSchema = {
  shipmentInfoSchema: z
    .object({
      stationOperation: z.enum(Object.values(StationOperation) as any),
      interStationOperation: z.optional(
        z.enum(Object.values(InterStationOperation) as any)
      ),
      orderType: z.enum(Object.values(OrderType) as any),
      deliveryType: z.enum(Object.values(DeliveryType) as any),
      originStationId: stationSchema,
      originAddress: z.optional(addressSchema),
    })
    .superRefine((data, ctx) => {
      if (
        data.stationOperation === StationOperation.INTERSTATION &&
        !data.interStationOperation
      ) {
        return ctx.addIssue({
          path: ["stationOperation", "interStationOperation"],
          message: "Please Select an Inter station Coverage",
          code: "custom",
        });
      }
      if (
        (data.deliveryType === DeliveryType.PICKUP_TO_DOOR ||
          data.deliveryType === DeliveryType.PICKUP_TO_STATION) &&
        !data.originAddress
      ) {
        return ctx.addIssue({
          path: ["originAddress"],
          message: "Please provide an address",
          code: "custom",
        });
      }
    }),
  receiver: z.object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    phoneNumber: ngPhoneNumberSchema,
    address: z.object({
      stateId: stateSchema,
      address: addressSchema,
    }),
    destinationRegionStationId: z
      .optional(stationSchema)
      .transform((s) => (s ? s : undefined)),
    destinationStationId: z
      .optional(stationSchema)
      .transform((s) => (s ? s : undefined)),
  }),
  item: z.object({
    category: z.string().min(2, { message: "Select a category" }),
    type: z.string(),
    condition: z.string().min(2, { message: "Select appropriate condition" }),
    description: z
      .string()
      .min(10, { message: "Provide a detailed descriptions" }),
    quantity: z.number(),
    weight: z.optional(
      z.number().min(1, { message: "Weight must be 1kg or more" })
    ),
    length: z.optional(
        z.number().min(1, { message: "Please Provide length or leave blank" }).transform(x => x ? x : undefined)
    ),
    height: z.optional(
        z.number().min(1, { message: "Please provide height or leave blank" }).transform(x => x ? x : undefined)
    ),
    width: z.optional(
        z.number().min(1, { message: "Please provide width or leave blank" }).transform(x => x ? x : undefined)
    ),
  }).superRefine((data, ctx) => {
    if (!((!data.height && !data.length && !data.width) || (data.height && data.length && data.width))) return ctx.addIssue({path: [!data.length ? 'length': !data.width? 'width': 'height'], message: "Please provide valid dimensions", code: "custom"});
  }),
  additionalServices: z
    .array(
      z.object({
        charge: z.string().min(1, { message: "Please select a service" }),
        price: z.number().min(1, { message: "Value cannot be 0 or negative" }),
      })
    )
    .min(0),
  insurance: z
    .object({
      insured: z.boolean(),
      itemValue: z.optional(
        z.number().min(1, { message: "Value must be greater than 0" })
      ),
    })
    .superRefine((data, ctx) => {
      if (data.insured && (!data.itemValue || data.itemValue! <= 0))
        return ctx.addIssue({
          path: ["itemValue"],
          code: "custom",
          message: "Value must be greater than 0 custom",
        });
    }),
  charges: z.object({
    freightPrice: z.number(),
    totalAdditionalService: z.number(),
    VAT: z.number(),
    insurance: z.number(),
    subTotal: z.number(),
    Total: z.number(),
  }),
};

export const itemTypeSchema = z.object({
  name: z.string().min(2, { message: "Please provide a name" }),
  pricing: z.enum(Object.values(TypePricing) as any, {
    message: "Please select a pricing type",
  }),
  limit: z.optional(z.number().transform((x) => (x > 0 ? x : undefined))),
  min: z.optional(z.number().transform((x) => (x > 0 ? x : undefined))),
  price: z.number(),
});
export const itemCategorySchema = z.object({
  name: z.string().min(2, { message: "Please provide a name" }),
  priceFactor: z.number().transform((x) => (x ? x : 1)),
});
// export const remTypeSchema = z.object({
//   name: z.string().min(2, { message: "Please provide a name" }),
// });
// export const shipmentTypeSchema = z.object({
//   name: z.string().min(2, { message: "Please provide a name" }),
//   price: z.number(),
//   ppw: z.number(),
//   minWeight: z.number(),
//   maxWeight: z.number(),
// });

export const additionalChargeSchema = z.object({
  charge: z.string().min(2, { message: "Please provide a charge" }),
});
export const staffFormSchema = z.object({
  firstname: firstNameSchema,
  lastname: lastNameSchema,
  phoneNumber: ngPhoneNumbersSchema,
  role: z.enum(Object.values(StaffRole) as any),
});

export const routeFormSchema = z.object({
  code: z
    .string()
    .min(2, { message: "Please provide a code" })
    .max(20, { message: "code must be less than 20 characters" }),
  coverage: z.enum(Object.values(RouteCoverage) as any, {
    message: "Please select a route coverage",
  }),
  type: z.enum(Object.values(RouteType) as any, {
    message: "Please select a route type",
  }),
  stationIds: z
    .array(
      z.string().uuid({ message: "Please select a station or remove entry" })
    )
    .min(2, { message: "Please provide 2 or more stations" }),
});

export const vendorConfigSchema = z.object({
  expressFactor: z.number().min(0, { message: "Must be greater than 0" }),
  hqId: z.string().min(1, { message: "Please select a HQ" }),
  customerCareLine: ngPhoneNumbersSchema,
  vat: z.number().min(0, { message: "Must be greater than 0" }),
  insuranceFactor: z.number().min(0, { message: "Must be greater than 0" }),
  ecommerceFactor: z.number().min(0, { message: "Must be greater than 0" }),
  localFactor: z.number().min(0, { message: "Must be greater than 0" }),
  dim: z.number().min(0, { message: "Must be greater than 0" }),
  logo: z.optional(z.string()),
});
export const corporateCustomerSchema = z.object({
  user: userFormSchema,
  corporateInfo: z.object({
    businessName: z.string().min(3, {message: 'Must be 3 characters or more'}),
    businessAddress: z.object({
      stateId:  z
    .string()
    .min(1, { message: "Please select a state" })
    .transform((x) => parseInt(x)),
      address: addressSchema
    }),
    businessPhone: ngPhoneNumberSchema
  }),
})

export const paymentReceiptSchema = z.object({
  paymentType: z.enum([PaymentType.CARD, PaymentType.CASH, PaymentType.WALLET, PaymentType.TRANSFER]),
  receiptInfo: z.string().min(3, { message: "Please input receipt details" }),
  amount: z.number().min(1, { message: "Please enter a valid amount" }),
})
