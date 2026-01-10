import React, { useEffect, useRef, useState } from "react";
import CardRead from "@jield/solodb-react-components/modules/admin/components/goldsteinClientsDashboard/cardReadedValue";
import UserAuthenticated from "@jield/solodb-react-components/modules/admin/components/goldsteinClientsDashboard/userAuthenticated";
import EquipmentConnected from "@jield/solodb-react-components/modules/admin/components/goldsteinClientsDashboard/equipmentConnected";
import { Table } from "react-bootstrap";
import { ClientStatus, getClientsStatus, Status } from "@jield/solodb-react-components/modules/admin/functions/goldstein/notifications";
import { ClientToServerMessage, dataListener, getWebSocket, ReadData, sendWsMessage, UpdateListeningData, WSPackage } from "@jield/solodb-react-components/modules/admin/api/goldstein/wsHelper";

const clientTypes = ["all", "equipment", "not_set"];

export const SERVER_DNS = document.getElementById("root")?.dataset.goldsteinEndpoint ?? "";

const MOCK_API_TOKEN = "mock-token";

const NOTIFICATION_TTL = 10;

const LOGIN_TTL = 15;

async function editAssociation(assoc: string) {
  const url = "https://" + SERVER_DNS + "/api/update/client-association";
  const newName = prompt("Select the new association for the client:", assoc);

  if (newName === null) {
    alert("Please enter a not null value");
    return;
  }

  const [item, idStr] = newName.split(":");
  const id = Number(idStr);

  if (!item || isNaN(id) || id === 0) {
    alert("Please follow the correct format: $item:$id");
    return;
  }

  if (!clientTypes.slice(1).includes(item)) {
    alert("Please select a valid $item: (equipment, not_set)");
    return;
  }

  const response = await fetch(url, {
    method: "PATCH",
    body: JSON.stringify({
      previous_association: assoc,
      new_association: newName,
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });

  if (!response.ok) {
    throw new Error(`Response status: ${response.status} with body: ${await response.text()}`);
  }

  const respText = await response.text();
  alert(respText);
}

export default function GoldsteinClientsDashboard() {
  const wsRef = useRef<WebSocket | null>(null);

  const [clientsMap, setClientsMap] = useState<Map<string, ClientStatus>>(new Map());

  async function handleReadData(readedData: ReadData) {
    const clientMap = getClientsStatus(readedData.notifications_list, new Date(), NOTIFICATION_TTL, LOGIN_TTL);

    setClientsMap(clientMap);
  }

  function setSqlQuery() {
    const whereClause = listeningItem === "all" ? "" : `WHERE association_item = "${listeningItem}"`;
    const query = `
      SELECT * FROM notifications
      ${whereClause}
    `.trim();

    const updateListeningData: UpdateListeningData = {
      listening_association: `${listeningItem}:*`,
      sql_statement: query,
    };

    let pkg: WSPackage = {
      package_type: ClientToServerMessage.UPDATE_LISTENING_DATA,
      payload: JSON.stringify(updateListeningData),
    };
    sendWsMessage(wsRef.current, pkg);

    pkg = {
      package_type: ClientToServerMessage.GET_DATA,
      payload: "",
    };
    sendWsMessage(wsRef.current, pkg);
  }

  const tryReconnect = () => {
    setTimeout(() => {
      if (
        wsRef.current === null ||
        wsRef.current.readyState === WebSocket.CLOSED ||
        wsRef.current.readyState === WebSocket.CLOSING
      ) {
        connectWs();
      }
    }, 1000);
  };

  const connectWs = () => {
    getWebSocket("wss://" + SERVER_DNS + "/ws", MOCK_API_TOKEN)
      .then((ws) => {
        if (wsRef.current !== null) {
          wsRef.current.close();
        }
        ws.onmessage = (event) => {
          dataListener(event, handleReadData);
        };
        ws.onclose = () => {
          console.log("WebSocket closed");
          tryReconnect();
        };
        ws.onerror = (e) => {
          console.error("WebSocket error", e);
          tryReconnect();
        };

        wsRef.current = ws;
        console.log("WebSocket connected");

        setSqlQuery();

        const pkg: WSPackage = {
          package_type: ClientToServerMessage.GET_DATA,
          payload: "",
        };
        sendWsMessage(ws, pkg);
      })
      .catch((error) => {
        console.error("WebSocket connection failed", error);
        tryReconnect();
      });
  };

  // initialize de ws and manages its life clicle
  useEffect(() => {
    connectWs();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        console.log("Web socket disconnected");
      }
    };
  }, []);

  const [listeningItem, setListeningItem] = useState<string>(clientTypes[0]);

  useEffect(() => {
    setSqlQuery();
  }, [listeningItem]);

  return (
    <div>
      <h1>Goldstein Clients</h1>

      <div>
        <label htmlFor="typeFilter">Filter by type:</label>
        <select
          className="form-control"
          id="typeFilter"
          value={listeningItem}
          onChange={(e) => setListeningItem(e.target.value)}
        >
          {clientTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <Table size="sm" striped bordered hover>
        <thead>
          <tr>
            <th>Client</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(clientsMap.entries()).map(([assoc, clientStatus]) => (
            <tr key={assoc}>
              <td>{assoc}</td>
              <td>
                {clientStatus.status === Status.CLIENT_CONNECTED && <EquipmentConnected />}
                {clientStatus.status === Status.CARD_READED && <CardRead badge_uuid={clientStatus.message.badgeUUID} />}
                {clientStatus.status === Status.USER_AUTHENTICATED && (
                  <UserAuthenticated user_id={clientStatus.message.userID} />
                )}
              </td>
              <td>
                <button className="btn btn-primary" onClick={() => editAssociation(assoc)}>
                  Edit association
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
