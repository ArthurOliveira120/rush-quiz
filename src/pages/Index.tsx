import { Header } from "../components/Header";
import { Button } from "../components/Button";

import styles from "./Index.module.css";
import { useSession } from "../contexts/SessionContext";


export function Index() {
const { session } = useSession();

  return (
    <>
      <Header></Header>
      <div className={styles.container}>
        <h1>Quiz</h1>

        <div className={styles.enterPin}>
            <input
              type="text"
              className={styles.inputRoomPin}
              placeholder="PIN da sala"
            ></input>
            <Button className={styles.enterRoomButton}>Entrar na sala</Button>
          </div>
          <div>
            {session?.id}
          </div>
      </div>
    </>
  );
}
