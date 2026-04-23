import { HubConnectionBuilder, HttpTransportType, LogLevel } from "@microsoft/signalr";
import { useEffect, useRef } from "react";

export function useProjectRealtime(projectId: string, onTasksChanged: () => void) {
  const onTasksChangedRef = useRef(onTasksChanged);
  onTasksChangedRef.current = onTasksChanged;

  useEffect(() => {
    if (!projectId) return;

    const conn = new HubConnectionBuilder()
      .withUrl("/hubs/projects", {
        // Viktigt: cookies (auth) måste skickas
        withCredentials: true,
        transport: HttpTransportType.WebSockets,
        // hoppar över longPolling (för att minskar strul)
        skipNegotiation: true,
      })
      .withAutomaticReconnect([0, 1000, 3000, 5000, 10000])
      .configureLogging(LogLevel.Information)
      .build();

    let t: any = null;
    const triggerReload = () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => onTasksChangedRef.current(), 150);
    };

    conn.on("tasksChanged", (msg: any) => {
      if (msg?.projectId === projectId) triggerReload();
    });

    const start = async () => {
      try {
        await conn.start();
        await conn.invoke("JoinProjectAsync", projectId);
      } catch (e) {
        console.error("SignalR connect failed:", e);
      }
    };

    start();

    // Om den reconnectar: joina gruppen igen
    conn.onreconnected(async () => {
      try {
        await conn.invoke("JoinProjectAsync", projectId);
      } catch { }
    });

    return () => {
      try {
        conn.invoke("LeaveProjectAsync", projectId).catch(() => { });
      } catch { }
      conn.stop().catch(() => { });
      if (t) clearTimeout(t);
    };
  }, [projectId]);
}
