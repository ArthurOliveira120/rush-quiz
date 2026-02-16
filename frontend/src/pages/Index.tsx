import { Button } from "../components/Button";

import styles from "./Index.module.css";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useSession } from "../hooks/useSession";

export function Index() {
  const inputRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { session } = useSession();

  return (
    <>
      <div className={styles.container}>
        <h1>Rush Quiz</h1>

        {!session && (
          <input
            type="text"
            className={styles.inputName}
            placeholder="Seu nome"
            ref={nameRef}
          />
        )}

        <div className={styles.enterPin}>
          <input
            type="text"
            className={styles.inputRoomPin}
            placeholder="PIN da sala"
            ref={inputRef}
            maxLength={6}
          />
          <Button
          variant="secondary"
            className={styles.enterRoomButton}
            onClick={() => {
              if (
                !inputRef.current?.value ||
                inputRef.current.value.length !== 6
              ) {
                alert("Digite um PIN válido");
                return;
              }

              if (!session && !nameRef.current?.value) {
                alert("Digite seu nome");
                return;
              } else if (!session && nameRef.current?.value) {
                localStorage.setItem("player_name", nameRef.current.value);
              }

              if (session || nameRef.current?.value) {
                navigate(`/play/${inputRef.current?.value}`);
              }
            }}
          >
            Entrar na sala
          </Button>
        </div>
      </div>
    </>
  );
}
