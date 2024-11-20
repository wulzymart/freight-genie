import axios from "axios";
import {Vendor} from "@/lib/custom-types.ts";

const useVendor = () => {
  const host = window.location.host;
  const loadVendor = async () => {
    const storedVendor = localStorage.getItem("vendor");
      console.log(storedVendor);
    if (storedVendor) {
        const data = JSON.parse(storedVendor);
        if (new  Date().getTime() - new Date(data.timestamp).getTime() > 24 * 60 * 60 * 1000 ) return reloadVendor()
      return data.vendor as Vendor;
    }
    return await axios
      .get(`${import.meta.env.VITE_API}/admin/vendors?url=${host}`)
      .then((response) => {
        localStorage.setItem("vendor", JSON.stringify({vendor: response.data.vendor, timestamp: new Date()}),);
        return response.data.vendor as Vendor
      });
  };
  const reloadVendor = async () => {
    const {data: {vendor}} = await axios
        .get(`${import.meta.env.VITE_API}/admin/vendors?url=${host}`)
        .then((response) => {
          return response.data.vendor;
        });
    localStorage.setItem("vendor", JSON.stringify({vendor, timestamp: new Date()}),);
    return vendor as Vendor;
  }
  return {
    loadVendor,
    reloadVendor
  };
};
export default useVendor;
export type VendorContextType = ReturnType<typeof useVendor>;
