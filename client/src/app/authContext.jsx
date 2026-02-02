import React, { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./auth.context";
import { authApi } from "../services/auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = authApi.getToken();

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        if (!token) {
          if (!cancelled) setUser(null);
          return;
        }
        const me = await authApi.me();
        const normalized = me?._id && !me.id ? { ...me, id: me._id } : me;
        if (!cancelled) setUser(normalized);
      } catch {
        authApi.clearToken();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,

      login: async (email, password) => {
        const { user: u } = await authApi.login(email, password);
        const normalized = u?._id && !u.id ? { ...u, id: u._id } : u;
        setUser(normalized);
      },

      register: async (name, email, password) => {
        const { user: u } = await authApi.register(name, email, password);
        const normalized = u?._id && !u.id ? { ...u, id: u._id } : u;
        setUser(normalized);
      },

      logout: () => {
        authApi.clearToken();
        setUser(null);
      },

      refreshMe: async () => {
        const me = await authApi.me();
        const normalized = me?._id && !me.id ? { ...me, id: me._id } : me;
        setUser(normalized);
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
