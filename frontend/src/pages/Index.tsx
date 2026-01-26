import { Button } from "../components/Button";

import styles from "./Index.module.css";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

export function Index() {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  return (
    <>
      <div className={styles.container}>
        <h1>Quiz</h1>

        <div className={styles.enterPin}>
          <input
            type="text"
            className={styles.inputRoomPin}
            placeholder="PIN da sala"
            ref={inputRef}
          />
          <Button
            className={styles.enterRoomButton}
            onClick={() => {
              navigate(`/play/${inputRef.current?.value}`);
            }}
          >
            Entrar na sala
          </Button>
        </div>
      </div>
    </>
  );
}
