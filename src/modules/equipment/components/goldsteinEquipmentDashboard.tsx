import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { GoldsteinClientDashboard, GoldsteinDataProvider, useGoldsteinClientDataContext } from "goldstein-client-dashboard";

let SEVER_ENDPOINT = document.getElementById("root")?.dataset.goldsteinEndpoint ?? "";

function GoldsteinEquipmentDashboard() {
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

export default function GoldsteinEquipmentDashboardWrapper() {
  return (
    <GoldsteinDataProvider
      defaultData={{
        goldsteinFQDN: "",
        associationType: "",
        associationID: 0,
      }}
    >
      <GoldsteinEquipmentDashboard />
    </GoldsteinDataProvider>
  );
}
