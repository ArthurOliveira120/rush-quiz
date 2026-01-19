import { useEffect } from "react";
import { socket } from "../services/socket";

export function useSocket() {
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("🟢 Conectado ao socket:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Desconectado do socket");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

  return socket;
}
