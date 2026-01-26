import { useState, type FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { Button } from "../components/Button";
import styles from "./SignIn.module.css";

export function SignIn() {
  const navigate = useNavigate();
  const { handleSignIn, session, sessionLoading, sessionError } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (session) {
      navigate("/games");
    }
  }, [session, navigate]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    handleSignIn(email, password);
  }

  return (
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Entrar</h1>

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

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          loading={sessionLoading}
        >
          Entrar
        </Button>

        <p className={styles.footer}>
          Não tem conta?{" "}
          <span onClick={() => navigate("/signup")}>Criar conta</span>
        </p>
      </form>
  );
}
