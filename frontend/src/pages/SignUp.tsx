import { useState, type FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { Button } from "../components/Button";
import styles from "./SignUp.module.css";

export function SignUp() {
  const navigate = useNavigate();
  const {
    handleSignUp,
    session,
    sessionLoading,
    sessionError,
    sessionMessage,
  } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (session) {
      navigate("/games");
    }
  }, [session, navigate]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    handleSignUp(email, password, username);
  }

  return (
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Criar conta</h1>

        <input
          type="text"
          placeholder="Nome de usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {sessionError && <span className={styles.error}>{sessionError}</span>}

        {sessionMessage && (
          <span className={styles.success}>{sessionMessage}</span>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          loading={sessionLoading}
        >
          Criar conta
        </Button>

        <p className={styles.footer}>
          Já tem conta? <span onClick={() => navigate("/signin")}>Entrar</span>
        </p>
      </form>
  );
}
