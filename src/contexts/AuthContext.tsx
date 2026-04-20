import { mobileApi } from "@/src/lib/api";
import { authStorage } from "@/src/lib/storage";
import type { AppUser } from "@/src/types/api";
import { createContext, useContext, useEffect, useState } from "react";

type AuthContextValue = {
  user: AppUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginWithPassword: (email: string, password: string) => Promise<AppUser>;
  bootstrapProfile: () => Promise<void>;
  setSession: (next: { accessToken: string; refreshToken: string; user: AppUser }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const [storedUser, storedAccess, storedRefresh] = await Promise.all([
          authStorage.getUser(),
          authStorage.getAccessToken(),
          authStorage.getRefreshToken(),
        ]);

        if (storedUser && storedAccess && storedRefresh) {
          setUser(storedUser);
          setAccessToken(storedAccess);
          setRefreshToken(storedRefresh);
          try {
            const profile = await mobileApi.getMyProfile();
            setUser(profile.data.user);
            await authStorage.setSession(storedAccess, storedRefresh, profile.data.user);
          } catch {
            // Keep stored session if live profile fetch fails.
          }
        }
      } finally {
        setLoading(false);
      }
    };

    void restore();
  }, []);

  const setSession = async (next: { accessToken: string; refreshToken: string; user: AppUser }) => {
    setUser(next.user);
    setAccessToken(next.accessToken);
    setRefreshToken(next.refreshToken);
    await authStorage.setSession(next.accessToken, next.refreshToken, next.user);
  };

  const bootstrapProfile = async () => {
    const [storedAccess, storedRefresh] = await Promise.all([
      authStorage.getAccessToken(),
      authStorage.getRefreshToken(),
    ]);

    if (!storedAccess || !storedRefresh) return;
    const profile = await mobileApi.getMyProfile();
    await setSession({
      accessToken: storedAccess,
      refreshToken: storedRefresh,
      user: profile.data.user,
    });
  };

  const loginWithPassword = async (email: string, password: string) => {
    const payload = await mobileApi.login({ email, password });
    await setSession(payload.data);
    return payload.data.user;
  };

  const logout = async () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    await authStorage.clearSession();
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    isAuthenticated: Boolean(user && accessToken),
    loginWithPassword,
    bootstrapProfile,
    setSession,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
};
