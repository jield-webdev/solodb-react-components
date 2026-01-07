import React, { useEffect, useState } from "react";
import { SERVER_DNS } from "@/modules/admin/components/goldsteinClientsDashboard";

export default function UserAuthenticated({ user_id }: { user_id: number }) {
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const url = "https://" + SERVER_DNS + `/api/onelab/view/user/${user_id}`;

    const getUsername = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status} with body: ${await response.text()}`);
        }

        const data = await response.json();
        setUserName(data.full_name);
      } catch (error) {
        console.log(error);
      }
    };

    getUsername();
  }, []);

  return <span className="rounded p-2 bg-success">Clients has detected user: {userName || "loading..."}</span>;
}
