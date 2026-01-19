import { Header } from "../components/Header";
import { Button } from "../components/Button";
import { SessionNameInput } from "../components/SessionNameInput";

import styles from "./Index.module.css";
import { useSession } from "../contexts/SessionContext";

export function Index() {
  const { session } = useSession();

  return (
    <>
      <Header />

      <div className={styles.container}>
        <h1>Quiz</h1>

        <SessionNameInput />

        <div className={styles.enterPin}>
          <input
            type="text"
            className={styles.inputRoomPin}
            placeholder="PIN da sala"
          />
          <Button className={styles.enterRoomButton}>
            Entrar na sala
          </Button>
        </div>

        <div>
          <strong>Session Name:</strong> {session.id}
        </div>
      </div>
    </>
  );
}
