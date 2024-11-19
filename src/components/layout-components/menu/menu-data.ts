import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons/lib";
import {
  MdAddBusiness,
  MdBusiness,
  MdDashboard,
  MdPerson4,
  MdPersonAdd,
  MdReceiptLong,
  MdRoute,
} from "react-icons/md";
import { FaRoute, FaShippingFast } from "react-icons/fa";
import { ImUserPlus } from "react-icons/im";

export type MenuItemType = {
  name: string;
  href: string;
  Icon: IconType | LucideIcon;
};
export const menuEntries: MenuItemType[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    Icon: MdDashboard,
  },
  {
    name: "Add Customer",
    href: "/customers/add",
    Icon: ImUserPlus,
  },
  {
    name: "New Waybill",
    href: "/orders/new",
    Icon: FaShippingFast,
  },
  {
    name: "Add Station",
    href: "/stations/add",
    Icon: MdAddBusiness,
  },
  {
    name: "Stations",
    href: "/stations",
    Icon: MdBusiness,
  },
  {
    name: "Payments",
    href: "/payments",
    Icon: MdReceiptLong,
  },
  {
    name: "Staff",
    href: "/staff",
    Icon: MdPerson4,
  },
  {
    name: "Add Staff",
    href: "/staff/add",
    Icon: MdPersonAdd,
  },
  {
    name: "Routes",
    href: "/routes",
    Icon: MdRoute,
  },
  {
    name: "Add Route",
    href: "/routes/add",
    Icon: FaRoute,
  },
];
