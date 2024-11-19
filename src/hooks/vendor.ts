import axios from "axios";
import { useEffect, useState } from "react";

const useVendor = () => {
  const host = window.location.host;
  const [vendor, setVendor] = useState<any>({});
  useEffect(() => {}, []);
  const loadVendor = async () => {
    const storedVendor = localStorage.getItem("vendor");
    if (storedVendor) {
      return JSON.parse(storedVendor);
    }
    return await axios
      .get(`${import.meta.env.VITE_API}/admin/vendors?url=${host}`)
      .then((response) => {
        localStorage.setItem("vendor", JSON.stringify(response.data.vendor));
        return response.data.vendor;
      });
  };

  // const vendor = await axios.get(`${import.meta.env.VITE_API}/v1/vendor?url=${host}`);
  return {
    loadVendor,
  };
};
export default useVendor;
export type VendorContextType = ReturnType<typeof useVendor>;
