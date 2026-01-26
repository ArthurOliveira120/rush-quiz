import styles from "./Header.module.css";

import { Button } from "./Button";
import { Link, useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";

export function Header() {
  const navigate = useNavigate();
  const { session, handleSignOut } = useSession();

  const username = session?.user.user_metadata.username;

  return (
    <div className={styles.header}>
      <div className={styles.buttons}>
        <div className={styles.mainTitle}>
          <Link to="/" className={styles.link}>
            <img src="/logo maior.png" width="100px" height="100px"/>
          </Link>

          {session && (
            <span className={styles.username}>
              Olá, <strong>{username}</strong>!
            </span>
          )}
        </div>

        <div className={styles.headerButtons}>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate("/games")}
          >
            Meus Jogos
          </Button>

          {!session ? (
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate("/signin")}
            >
              Login
            </Button>
          ) : (
              <Button variant="secondary" size="md" onClick={handleSignOut}>
                Logout
              </Button>
          )}
        </div>
      </div>
    </div>
  );
}
