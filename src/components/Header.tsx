import styles from "./Header.module.css";

import { Button } from "./Button";
import { useEffect } from "react";
import { useSocket } from "../hooks/useSocket";

export function Header() {
  const socket = useSocket();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Conectado:", socket.id);
    });

    return () => {
      socket.off("connect");
    };
  }, []);
  return (
    <div className={styles.header}>
      <div className={styles.buttons}>
        <Button variant="secondary">Criar</Button>
      </div>
    </div>
  );
}
