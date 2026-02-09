import styles from "./NewGame.module.css";

import { useState, useRef } from "react";

import { Button } from "../components/Button";
import { QuestionPage } from "../components/QuestionPage";
import { supabase } from "../services/supabase";

import { useSession } from "../hooks/useSession";

import { useNavigate } from "react-router-dom";

type Option = {
  id: number;
  text: string;
  is_correct: boolean;
};

type Question = {
  id: number;
  text: string;
  options: Option[];
};

export function NewGame() {
  const { session } = useSession();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(1);

  const gameNameInputRef = useRef<HTMLInputElement>(null);

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      text: "",
      options: [
        { id: 1, text: "", is_correct: false },
        { id: 2, text: "", is_correct: false },
        { id: 3, text: "", is_correct: false },
        { id: 4, text: "", is_correct: false },
      ],
    },
  ]);

  async function handleSaveGame() {
    if (!session) return;

    if (!gameNameInputRef.current?.value?.trim()) {
      alert("Insira o nome do jogo");
      return;
    }

    const hasEmptyFields = questions.some((q) => {
      if (!q.text.trim()) return true;

      return q.options.some((o) => !o.text.trim());
    });

    if (hasEmptyFields) {
      alert("Preencha todas as perguntas e opções.");
      return;
    }

    const hasNotCorrectOption = questions.some(
      (q) => !q.options.some((o) => o.is_correct),
    );

    if (hasNotCorrectOption) {
      alert("Cada questão deve ter uma alternativa correta.");
      return;
    }

    try {
      const { data: game, error } = await supabase
        .from("games")
        .insert({
          user_id: session.user.id,
          title: gameNameInputRef.current?.value,
          is_public: true,
        })
        .select("id")
        .single();

      if (error) throw error;

      const questionsToInsert = questions.map((q, index) => ({
        game_id: game.id,
        text: q.text,
        order: index + 1,
      }));

      const { data: insertedQuestions, error: questionsError } = await supabase
        .from("questions")
        .insert(questionsToInsert)
        .select("id, order");

      if (questionsError) throw questionsError;

      const optionsToInsert: any = [];

      for (const dbQuestion of insertedQuestions) {
        const originalQuestion = questions.find(
          (_, index) => index + 1 === dbQuestion.order,
        );

        if (!originalQuestion) continue;
        originalQuestion.options.forEach((opt, optIndex) => {
          optionsToInsert.push({
            question_id: dbQuestion.id,
            text: opt.text,
            is_correct: opt.is_correct,
            order: optIndex + 1,
          });
        });
      }

      const { error: optionsError } = await supabase
        .from("options")
        .insert(optionsToInsert);

      if (optionsError) throw optionsError;

      navigate("/");
    } catch (error: any) {
      console.error("Error: ", error.message);
    }
  }

  function handleNextPage() {
    if (currentQuestion === questions.length) {
      setQuestions((prev) => [
        ...prev,
        {
          id: questions.length + 1,
          text: "",
          options: [
            { id: 1, text: "", is_correct: false },
            { id: 2, text: "", is_correct: false },
            { id: 3, text: "", is_correct: false },
            { id: 4, text: "", is_correct: false },
          ],
        },
      ]);
    }

    setCurrentQuestion((prev) => prev + 1);
  }

  function handlePrevPage() {
    if (currentQuestion > 1) {
      setCurrentQuestion((prev) => prev - 1);
    }
  }

  function handleEditQuestion(updatedQuestion: Question) {
    setQuestions((prev) =>
      prev.map((o) =>
        o.id === updatedQuestion.id ? { ...updatedQuestion } : o,
      ),
    );
  }

  return (
    <>
      <div className={styles.mainContainer}>
        <Button
          variant="secondary"
          className={styles.pageButton}
          disabled={currentQuestion === 1}
          onClick={handlePrevPage}
        >
          Ant.
        </Button>
        <div className={styles.main}>
          <input
            type="text"
            className={styles.title}
            placeholder="Meu Jogo"
            ref={gameNameInputRef}
          ></input>
          <h5 className={styles.pageMarker}>
            Questão {currentQuestion}/{questions.length}
          </h5>
          <div className={styles.questionContainer}>
            <QuestionPage
              question={questions[currentQuestion - 1]}
              onChangeQuestion={handleEditQuestion}
            />
          </div>
          <br></br>
          <Button onClick={handleSaveGame}>Salvar</Button>
        </div>
        <Button
          variant="secondary"
          className={styles.pageButton}
          onClick={handleNextPage}
        >
          Próx.
        </Button>
      </div>
    </>
  );
}
