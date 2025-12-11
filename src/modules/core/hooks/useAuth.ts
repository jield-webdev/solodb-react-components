import { useEffect, useRef, useState } from "react";
import { configureAxiosHeaders } from "@/modules/core/functions/configureAxiosHeaders";
import GetMe from "@/modules/core/api/getMe";
import { User } from "@/modules/core/interfaces/user";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Grab the token from the domContainer
    const domContainer = document.getElementById("root");
    const bearerToken = domContainer?.dataset.jwt ?? "";

    // Configure axios headers (if token is empty, it will clear auth header)
    configureAxiosHeaders(bearerToken);

    // If there is no token, we cannot fetch the user — stop loading early
    if (!bearerToken) {
      setIsLoadingUser(false);
      return;
    }

    // Prevent duplicate fetches (e.g., due to unexpected remounts)
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;

    GetMe()
      .then(setUser)
      .finally(() => setIsLoadingUser(false));
  }, []);

  return { user, setUser, isLoadingUser };
};
