import { AuthContext } from "@/modules/core/contexts/authContext";
import { useAuth } from "@/modules/core/hooks/useAuth";
import { ReactNode } from "react";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, setUser, isLoadingUser } = useAuth();

  if (isLoadingUser) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="text-center">
          <h2>Loading</h2>
          <p>Loading user…</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={{ user, setUser, isLoadingUser }}>{children}</AuthContext.Provider>;
};
