import { createContext } from "react";
import { User } from "solodb-typescript-core";

interface AuthContext {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoadingUser: boolean;
}

export const AuthContext = createContext<AuthContext>({
  user: null,
  setUser: () => {},
  isLoadingUser: true,
});
