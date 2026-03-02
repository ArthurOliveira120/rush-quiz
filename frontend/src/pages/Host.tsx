import styles from "./Host.module.css";
import { Button } from "../components/Button";

import { Timer } from "../components/Timer";
import { useRoom } from "../hooks/useRoom";
import { useEffect } from "react";

export function Host() {
  const { pin, players, roomState, question, result, ranking, emitHostJoin, emitStartGame } = useRoom();

  useEffect(() => {
    emitHostJoin();
  }, [pin]);

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
        {roomState !== "question" && (
          <Button
            variant="primary"
            size="lg"
            disabled={players.length === 0}
            onClick={emitStartGame}
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

          {!result && (
            <div className={styles.bar}>
              <Timer
                endTime={question.endTime}
                duration={15000}
              ></Timer>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className={styles.bar}>
          <Timer
            endTime={result.resultsEndTime}
            duration={10000}
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
