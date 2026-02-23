import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useSocket } from "../hooks/useSocket";
import { useSession } from "../hooks/useSession";

import styles from "./Host.module.css";
import { Button } from "../components/Button";

import type { Question } from "../types/game";
import { Timer } from "../components/Timer";

type QuestionResult = {
  correctOptionId: string;
  resultsEndTime: number;
};

export function Host() {
  const { pin } = useParams<{ pin: string }>();
  const { session } = useSession();
  const socket = useSocket();
  const navigate = useNavigate();

  const [players, setPlayers] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);

  const [question, setQuestion] = useState<Question | null>(null);

  const [results, setResults] = useState<QuestionResult | null>(null);
  const [ranking, setRanking] = useState<{ name: string; score: number }[]>([]);

  function handleStartGame() {
    if (!pin) {
      console.log("pin inválido");
      return;
    }

    if (!socket.connected) {
      console.log("Socket não conectado");
      return;
    }

    console.log("emitindo o start game");
    socket.emit("start_game", { pin });
  }

  function handleNextQuestion() {
    socket.emit("next_question", { pin });
  }

  function handleFinishQuestion() {
    if (!pin) return;
    socket.emit("finish_question", { pin });
  }

  useEffect(() => {
    if (!pin || !session) return;

    socket.emit("host_join", { pin });

    socket.on("players_update", setPlayers);

    socket.on("game_started", () => {
      setGameStarted(true);
      socket.emit("next_question", { pin });
    });

    socket.on("question", (question: Question) => {
      setResults(null);
      setQuestion(question);
    });

    socket.on("join_error", (err) => {
      alert(err.message);
      navigate("/");
    });

    socket.on(
      "question_result",
      ({ correctOptionId, resultsEndTime }: QuestionResult) => {
        setResults({ correctOptionId, resultsEndTime });
      },
    );

    socket.on("game_finished", () => socket.emit("show_ranking", { pin }));

    socket.on("ranking", setRanking);

    return () => {
      socket.off("host_joined");
      socket.off("players_update");
      socket.off("game_started");
      socket.off("question");
      socket.off("join_error");
      socket.off("question_results");
      socket.off("game_finished");
      socket.off("ranking");
    };
  }, [pin, session, socket]);

  return (
    <div className={styles.container}>
      <h1>Host — Sala {pin}</h1>

      <div className={styles.players}>
        <h2>Jogadores ({players.length})</h2>

        {players.length === 0 && <p>Nenhum jogador conectado</p>}

        <ul>
          {players.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>
      </div>

      <div className={styles.controls}>
        {!gameStarted && (
          <Button
            variant="primary"
            size="lg"
            disabled={players.length === 0}
            onClick={handleStartGame}
          >
            Iniciar Jogo
          </Button>
        )}
      </div>

      {question && (
        <div className={styles.question}>
          <h2>{question.text}</h2>

          <div className={styles.options}>
            {question.options.map((opt) => (
              <div key={opt.id} className={styles.option}>
                {opt.text}
              </div>
            ))}
          </div>

          {!results && (
            <div className={styles.bar}>
              <Timer
                endTime={question.endTime}
                duration={15000}
                onFinish={handleFinishQuestion}
              ></Timer>
            </div>
          )}
        </div>
      )}

      {results && (
        <div className={styles.bar}>
          <Timer
            endTime={results.resultsEndTime}
            duration={10000}
            onFinish={handleNextQuestion}
          ></Timer>
        </div>
      )}

      {ranking.length > 0 && (
        <div className={styles.ranking}>
          <h2>🏆 Ranking Final</h2>
          <ol>
            {ranking.map((p, i) => (
              <li key={i}>
                {p.name} — {p.score} pts
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
