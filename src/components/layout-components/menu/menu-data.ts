import {Building2Icon, Frame, LifeBuoy, LucideIcon, Map, PieChart, Send} from "lucide-react";
import {IconType} from "react-icons/lib";

import {FaChargingStation, FaRoute, FaShippingFast, FaTripadvisor} from "react-icons/fa";
import {StaffRole} from "@/lib/custom-types.ts";

export type SubMenuItem = {
  title: string
  url: string
  permitted?: StaffRole[]
} 

export type MenuItem= {
  title: string
  url: string
  icon: LucideIcon | IconType
  isActive?: boolean
  permitted?: StaffRole[]
  items?: SubMenuItem[]
}
export type SecondaryMenuItem = {
  title: string,
  url:  string,
  icon: LucideIcon | IconType,
}
export type ToolMenuItem = {
  name: string ,
  url:  string,
  icon: LucideIcon | IconType,
}

export const menuData: {
  navMain: MenuItem[], navSecondary: SecondaryMenuItem[], projects: ToolMenuItem[]
} = {
  navMain: [
    {
      title: "Waybill Management",
      url: "#",
      icon: FaShippingFast,
      isActive: true,
      items: [
        {
          title: "New Waybill",
          url: "/orders/new",
          permitted: [StaffRole.MANAGER, StaffRole.STATION_OFFICER, StaffRole.DIRECTOR]
        },
        {
          title: "Outbound",
          url: "#",
        },
        {
          title: "Inbound",
          url: "#",
        },
      ],
    },
    {
      title: "Trip Management",
      url: "#",
      icon: FaTripadvisor,
      items: [
        {
          title: "New Trip",
          url: "#",
          permitted: [StaffRole.MANAGER, StaffRole.DIRECTOR]
        },
        {
          title: "View Trips",
          url: "#",
        },
        {
          title: "New Shipment",
          url: "#",
        },
        {
          title: "View Shipments",
          url: "#",
        }
      ],
    },
    {
      title: "Station Operations",
      url: "#",
      icon: FaChargingStation,
      permitted: [StaffRole.MANAGER, StaffRole.DIRECTOR],
      items: [
        {
          title: "Add Expense",
          url: "#",
        },
        {
          title: "View Expenses",
          url: "#",
        },
        {
          title: "Orders",
          url: "#",
        },
      ],
    },
    {
      title: "Route Planning",
      url: "#",
      icon: FaRoute,
      permitted: [StaffRole.MANAGER, StaffRole.DIRECTOR],
      items: [
        {
          title: "Add Route",
          url: "/routes/add",
        },
        {
          title: "Manage Routes",
          url: "/routes",
        },
      ],
    },
    {
      title: "Management",
      url: "#",
      icon: Building2Icon,
      permitted: [StaffRole.DIRECTOR],
      items: [
        {
          title: "Add Staff",
          url: "/staff/add",
        },
        {
          title: "Manage Staff",
          url: "/staff",
        },
        {
          title: "Add Station",
          url: "/stations/add",
        },
        {
          title: "Manage Stations",
          url: "/stations",
        },
        {
          title: "Add Vehicle",
          url: "/vehicles/add",
        },
        {
          title: "Manage Vehicles",
          url: "/vehicles",
        },

      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}
