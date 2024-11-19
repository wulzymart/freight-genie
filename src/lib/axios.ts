import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API,
  headers: {
    "Content-Type": "application/json",

    Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
  },
});
axiosInstance.interceptors.request.use((config): any => {
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
      "x-vendor-id": localStorage.getItem("vendor")
        ? JSON.parse(localStorage.getItem("vendor")!).id
        : "",
    },
  };
});
