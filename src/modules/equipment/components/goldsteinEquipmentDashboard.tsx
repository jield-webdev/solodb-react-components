import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { GoldsteinClientDashboard, useGoldsteinClientDataContext } from "goldstein-client-dashboard";

let SEVER_ENDPOINT = document.getElementById("root")?.dataset.goldsteinEndpoint ?? "";

export default function GoldsteinEquipmentDashboard() {
  const { id } = useParams();
  const { setGoldsteinData } = useGoldsteinClientDataContext();

  useEffect(() => {
    SEVER_ENDPOINT = document.getElementById("root")?.dataset.goldsteinEndpoint ?? "";
  }, []);

  useEffect(() => {
    async function setData() {
      let endpoint = "";
      if (SEVER_ENDPOINT === "") {
        endpoint = document.getElementById("root")?.dataset.goldsteinEndpoint ?? "";
      } else {
        endpoint = SEVER_ENDPOINT;
      }

      setGoldsteinData({
        goldsteinFQDN: endpoint ? endpoint : "",
        associationType: "equipment",
        associationID: Number(id),
      });
    }

    setData();
  }, [id, setGoldsteinData]);

  return <GoldsteinClientDashboard />;
}
