import * as React from "react";
import { jwtDecode } from "jwt-decode";
import { axiosInstance } from "@/lib/axios";

export interface AuthContext {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  token: string | null;
}

const AuthContext = React.createContext<AuthContext | null>(null);

const key = "access_token";

export function getStoredUser() {
  const accessToken = getToken();
  if (!accessToken) return null;
  try {
    const user = jwtDecode(accessToken);
    if (!user || new Date() > new Date(user.exp! * 1000)) {
      setStoredToken(null);
      return null;
    }
    return user;
  } catch (error) {
    setStoredToken(null);
    return null;
  }
}
export function getToken() {
  return localStorage.getItem(key);
}
function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(key, token);
  } else {
    localStorage.removeItem(key);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<any | null>(getStoredUser());
  const [token, setToken] = React.useState<string | null>(getToken());
  const isAuthenticated = !!user;
  const logout = React.useCallback(async () => {
    setStoredToken(null);
    setUser(null);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await axiosInstance.post(
        `${import.meta.env.VITE_API}/vendor/auth/login`,
        {
          email,
          password,
        }
      );
      const { accessToken } = res.data;
      setStoredToken(accessToken);
      setUser(jwtDecode(accessToken));
    } catch (error) {
      setStoredToken(null);
      setUser(null);
    }
  };

  React.useEffect(() => {
    const user = getStoredUser();
    setUser(user);
    setToken(getToken());
  }, []);
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, setUser, token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export type AuthContextType = ReturnType<typeof useAuth>;
