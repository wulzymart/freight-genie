import { axiosInstance } from "./axios";

export const validatePin = async (pin: string) => {
  const { data } = await axiosInstance.post("/vendor/auth/validate-pin", {
    pin,
  });
  return data;
};
