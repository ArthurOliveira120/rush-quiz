import styles from "./Card.module.css";

import { Button } from "./Button";
import { useNavigate } from "react-router-dom";
import type { Dispatch, SetStateAction } from "react";
import { supabase } from "../services/supabase";
import { useGames } from "../hooks/useGames";

type cardProps = {
  index: number;
  gameId: string;
  title: string;
  setLoadingGame: Dispatch<SetStateAction<boolean>>;
};

export function Card({ index, gameId, title, setLoadingGame }: cardProps) {
  const navigate = useNavigate();
  const { fetchGames } = useGames();

  async function handleStartGame() {
    setLoadingGame(true);
    const res = await fetch(
      "https://projeto-quiz-backend.onrender.com/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId,
        }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erro ao iniciar jogo");
      return;
    }

    setLoadingGame(false);
    navigate(`/host/${data.pin}`);
  }

  async function handleDeleteGame(gameId: string) {
    setLoadingGame(true);
    
    const { error } = await supabase.from("games").delete().eq("id", gameId);

    if (error) console.error(error.message);
    fetchGames()
    setLoadingGame(false);
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardInfos}>
        <h4>{index}</h4>
        <h4>{title}</h4>
      </div>
      <div className={styles.cardButtons}>
        <Button size="sm" onClick={handleStartGame}>
          Jogar
        </Button>
        <Button size="sm" onClick={() => {
          navigate(`/games/${gameId}/edit`)
        }}>Editar</Button>
        <Button size="sm" onClick={() => handleDeleteGame(gameId)}>Excluir</Button>
      </div>
    </div>
  );
}
