import { GoldsteinDataProvider, useGoldsteinClientDataContext } from "@/modules/admin/context/goldstein/DataContext";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getWebSocket, dataListener, WSPackage, ClientToServerMessage, sendWsMessage, UpdateListeningData, ReadData } from "../../admin/api/goldstein/wsHelper";
import { getClientsStatus, Status } from "../../admin/functions/goldstein/notifications";
import EquipmentUsable from "@/modules/equipment/components/goldsteinEquipmentDashboard/states/equipmentUsable";
import NoUserInCard from "@/modules/equipment/components/goldsteinEquipmentDashboard/states/noUserInCard";
import NullNotifications from "@/modules/equipment/components/goldsteinEquipmentDashboard/states/nullNotifications";
import ServerError from "@/modules/equipment/components/goldsteinEquipmentDashboard/states/serverError";
import UserNotAuthorized from "@/modules/equipment/components/goldsteinEquipmentDashboard/states/userNotAuthorized";
import WaitingCardDetection from "@/modules/equipment/components/goldsteinEquipmentDashboard/states/waitingCardDetection";

const MOCK_API_TOKEN = "mock-token";
const NOTIFICATION_TTL = 10;
const LOGIN_TTL = 30;

let SEVER_ENDPOINT = document.getElementById("root")?.dataset.goldsteinEndpoint ?? "";

enum RenderingEnum {
  SERVER_ERROR = 0,
  NULL_NOTIFICATIONS = 1,
  WAITING_CARD_DETECTION = 2,
  CARD_READ = 3,
  USER_NOT_AUTHORIZED = 4,
  EQUIPMENT_USABLE = 5,
}

type RenderingStatus = {
  status: RenderingEnum;
  association: string;
  badgeUUID: string;
  userName: string;
  userID: number;
};

function getUsername(userID: number, serverEndpoint: string): Promise<string> {
  const url = "https://" + serverEndpoint + `/api/onelab/view/user/${userID}`;

  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status} with body: ${await response.text()}`);
        }
        const data = await response.json();
        resolve(data.full_name);
      } catch (error) {
        reject(error);
      }
    })();
  });
}

function GoldsteinEquipmentDashboardContent() {
  const { goldsteinData } = useGoldsteinClientDataContext();
  const wsRef = useRef<WebSocket | null>(null);
  const [renderingState, setRenderingState] = useState<RenderingStatus>({
    status: RenderingEnum.NULL_NOTIFICATIONS,
    association: "",
    badgeUUID: "",
    userName: "",
    userID: 0,
  });
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setServerError = () => {
    setRenderingState({
      status: RenderingEnum.SERVER_ERROR,
      association: "",
      badgeUUID: "",
      userName: "",
      userID: 0,
    });
  };

  function stopTimer() {
    if (timeoutRef.current) {
      clearInterval(timeoutRef.current);
    }
  }

  function startTimer(time: number) {
    stopTimer();
    setTimeLeft(time);
    timeoutRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          const pkg: WSPackage = {
            package_type: ClientToServerMessage.GET_DATA,
            payload: "",
          };
          sendWsMessage(wsRef.current, pkg);
          clearInterval(timeoutRef.current as NodeJS.Timeout);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleReadedData(readedData: ReadData) {
    const clientMap = getClientsStatus(readedData.notifications_list, new Date(), NOTIFICATION_TTL, LOGIN_TTL);

    if (clientMap.size == 0) {
      return setRenderingState({
        status: RenderingEnum.NULL_NOTIFICATIONS,
        association: "",
        badgeUUID: "",
        userName: "",
        userID: 0,
      });
    }

    const key = `${goldsteinData.associationType}:${goldsteinData.associationID}`;
    const clientStatus = clientMap.get(key);

    if (!clientStatus) {
      setServerError();
      return;
    }

    const baseStatus = {
      status: RenderingEnum.WAITING_CARD_DETECTION,
      association: key,
      badgeUUID: clientStatus.message.badgeUUID,
      userName: "",
      userID: clientStatus.message.userID,
    };

    if (clientStatus.status === Status.CARD_READED) {
      baseStatus.status = RenderingEnum.CARD_READ;
      return setRenderingState(baseStatus);
    }

    if (clientStatus.status === Status.USER_AUTHENTICATED) {
      const userName = await getUsername(clientStatus.message.userID, goldsteinData.goldsteinFQDN);
      baseStatus.userName = userName;
      if (clientStatus.message.usable) {
        baseStatus.status = RenderingEnum.EQUIPMENT_USABLE;
        const elapsed = (new Date().getTime() - new Date(clientStatus.timestamp).getTime()) / 1000;
        startTimer(Math.round(LOGIN_TTL - elapsed));
        return setRenderingState(baseStatus);
      } else {
        baseStatus.status = RenderingEnum.USER_NOT_AUTHORIZED;
        return setRenderingState(baseStatus);
      }
    }

    if (clientStatus.status === Status.CLIENT_CONNECTED) {
      baseStatus.status = RenderingEnum.WAITING_CARD_DETECTION;
      return setRenderingState(baseStatus);
    }

    setServerError();
  }

  async function setAssociationLisening() {
    const sqlStatement = `SELECT * FROM notifications 
                                WHERE association_item = "${goldsteinData.associationType}" 
                                AND association_id = ${goldsteinData.associationID}`;

    const updateListeningData: UpdateListeningData = {
      listening_association: `${goldsteinData.associationType}:${goldsteinData.associationID}`,
      sql_statement: sqlStatement,
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

  const connectWs = () => {
    getWebSocket("wss://" + goldsteinData.goldsteinFQDN + "/ws", MOCK_API_TOKEN)
      .then((ws) => {
        if (wsRef.current !== null) {
          wsRef.current.close();
        }
        ws.onmessage = (event) => {
          dataListener(event, handleReadedData);
        };
        ws.onclose = () => {
          setTimeout(() => {
            if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
              connectWs();
            }
          }, 1000);
        };
        ws.onerror = () => setServerError();
        wsRef.current = ws;
        setAssociationLisening();
      })
      .catch(() => setServerError());
  };

  useEffect(() => {
    if (goldsteinData.goldsteinFQDN !== "") {
      connectWs();
    }
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [goldsteinData.goldsteinFQDN]);

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className="card shadow">
            <div className="card-body">
              {renderingState.status === RenderingEnum.SERVER_ERROR && <ServerError />}
              {renderingState.status === RenderingEnum.NULL_NOTIFICATIONS && <NullNotifications />}
              {renderingState.status === RenderingEnum.WAITING_CARD_DETECTION && <WaitingCardDetection />}
              {renderingState.status === RenderingEnum.CARD_READ && <NoUserInCard badgeUID={renderingState.badgeUUID} />}
              {renderingState.status === RenderingEnum.USER_NOT_AUTHORIZED && (
                <UserNotAuthorized badgeUUID={renderingState.badgeUUID} userName={renderingState.userName} />
              )}
              {renderingState.status === RenderingEnum.EQUIPMENT_USABLE && (
                <EquipmentUsable
                  badgeUUID={renderingState.badgeUUID}
                  userName={renderingState.userName}
                  userID={renderingState.userID}
                  clientAssociation={renderingState.association}
                  timeLeft={timeLeft}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoldsteinEquipmentDashboard() {
  const { id } = useParams();
  const { setGoldsteinData } = useGoldsteinClientDataContext();

  useEffect(() => {
    SEVER_ENDPOINT = document.getElementById("root")?.dataset.goldsteinEndpoint ?? "";
  }, []);

  useEffect(() => {
    const endpoint = SEVER_ENDPOINT || document.getElementById("root")?.dataset.goldsteinEndpoint || "";
    setGoldsteinData({
      goldsteinFQDN: endpoint,
      associationType: "equipment",
      associationID: Number(id),
    });
  }, [id, setGoldsteinData]);

  return <GoldsteinEquipmentDashboardContent />;
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
