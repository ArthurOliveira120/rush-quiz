import styles from "./Play.module.css";
import { useEffect, useRef, useState } from "react";
import { useSession } from "../hooks/useSession";

import { Timer } from "../components/Timer";

import { useRoom } from "../hooks/useRoom";

export function Play() {
  const { session } = useSession();
  const { pin, question, result, ranking, roomState, emitPlayerJoin, emitSubmitAnswer } = useRoom();

  const joinedRef = useRef(false);
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  const playerName = session
    ? session.user.user_metadata.username
    : localStorage.getItem("player_name");

  useEffect(() => {
    if (session) {
      setPlayerId(session.user.id);
    } else {
      setPlayerId(null);
    }
  }, [session]);

  useEffect(() => {
  setSelectedOption(null);
}, [question?.id]);

  useEffect(() => {
    if (!pin || joinedRef.current) return;

    emitPlayerJoin(playerName);
    joinedRef.current = true;
  }, [pin]);

  function handleAnswer(optionId: string) {
    if (!question || !pin || selectedOption || roomState !== "question") return;

    setSelectedOption(optionId);

    emitSubmitAnswer({ playerId, playerName, optionId });
  }

  return (
    <div className={styles.container}>
      {ranking.length > 0 ? (
        <div className={styles.container}>
          <h1 className={styles.rankingTitle}>🏆 Ranking Final</h1>

          <ul className={styles.ranking}>
            {ranking.map((p, i) => (
              <li
                key={i}
                className={`${styles.rankingItem} ${
                  i === 0
                    ? styles.first
                    : i === 1
                      ? styles.second
                      : i === 2
                        ? styles.third
                        : ""
                }`}
              >
                <span className={styles.position}>{i + 1}º</span>
                <span className={styles.playerName}>{p.name}</span>
                <span className={styles.score}>{p.score} pts</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!question ? (
        <div className={styles.waiting}>
          <h1>Sala {pin}</h1>
          <p>Aguardando o host iniciar o jogo…</p>
        </div>
      ) : (
        <>
          <div className={styles.question}>
            <h1>{question.text}</h1>
          </div>

          {result ? (
            <>
              <div className={styles.result}>
                {result.correctOptionId === selectedOption ? (
                  <p className={styles.correct}>✅ Você acertou!</p>
                ) : (
                  <p className={styles.wrong}>❌ Você errou</p>
                )}
              </div>
              {result.resultsEndTime && (
                <div className={styles.bar}>
                  <Timer
                    endTime={result.resultsEndTime}
                    duration={10000}
                  ></Timer>
                </div>
              )}
            </>
          ) : (
            <>
              <div className={styles.options}>
                {question.options.map((opt) => {
                  const isSelected = selectedOption === opt.id;

                  return (
                    <button
                      key={opt.id}
                      className={`${styles.opt} ${
                        isSelected ? styles.selected : ""
                      }`}
                      onClick={() => handleAnswer(opt.id)}
                      disabled={!!selectedOption || roomState !== "question"}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
              <div className={styles.bar}>
                <Timer
                  endTime={question.endTime}
                  duration={15000}
                ></Timer>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
