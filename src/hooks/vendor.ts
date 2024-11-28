import axios from "axios";
import {Vendor} from "@/lib/custom-types.ts";

const useVendor = () => {
  const host = window.location.host;
  const loadVendor = async () => {
    const storedVendor = localStorage.getItem("vendor");
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
      try {

          const res = await axios
              .get(`${import.meta.env.VITE_API}/admin/vendors?url=${host}`)

              if (res.status > 300) {
                  console.log('not found')}
              const vendor = res.data.vendor as Vendor;
          localStorage.setItem("vendor", JSON.stringify({vendor, timestamp: new Date()}),);
          return vendor as Vendor;
      }
      catch (error) {
          console.log(error);
      }
  }
  return {
    loadVendor,
    reloadVendor
  };
};
export default useVendor;
export type VendorContextType = ReturnType<typeof useVendor>;
