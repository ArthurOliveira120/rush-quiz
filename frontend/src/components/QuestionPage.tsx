import styles from "./QuestionPage.module.css";

import { Button } from "./Button";

type Option = {
  id: string;
  text: string;
  is_correct: boolean;
  order: number;
};

type Question = {
  id: string;
  text: string;
  order: number;
  options: Option[];
  persisted: boolean;
};

type QuestionProps = {
  question: Question;
  onChangeQuestion: (updatedQuestion: Question) => void;
  handleDeleteQuestion: (questionId: string) => void;
};

export function QuestionPage({ question, onChangeQuestion, handleDeleteQuestion }: QuestionProps) {

  function handleChangeQuestionText(text: string) {
    onChangeQuestion({
      ...question,
      text,
    });
  }

  function handleChangeOptionText(index: number, text: string) {
    const newOptions = question.options.map((opt, i) =>
      i === index ? { ...opt, text } : opt,
    );

    onChangeQuestion({
      ...question,
      options: newOptions,
    });
  }

  function handleSelectCorrectOption(index: number) {
    const newOptions = question.options.map((opt, i) => ({
      ...opt,
      is_correct: i === index,
    }));

    onChangeQuestion({
      ...question,
      options: newOptions,
    });
  }

  function handleRemoveOption(optionId: string) {
    const newOptions = question.options.filter((o) => o.id !== optionId);

    onChangeQuestion({
      ...question,
      options: newOptions,
    });
  }

  function handleAddOption() {
    if (question.options.length >= 6) return;
    onChangeQuestion({
      ...question,
      options: [
        ...question.options,
        {
          id: `temp-${crypto.randomUUID()}`,
          text: "",
          is_correct: false,
          order: question.options.length + 1,
        },
      ],
    });
  }

  return (
    <div className={styles.questionContainer}>
      <div className={styles.question}>
        <input
          type="text"
          className={styles.inputQuestion}
          placeholder="Faça sua pergunta!"
          value={question.text}
          onChange={(e) => handleChangeQuestionText(e.target.value)}
        ></input>
      </div>

      <div className={styles.options}>
        {question.options.map((opt, index) => (
          <div
            key={opt.id}
            className={`${styles.opt} ${opt.is_correct ? styles.selected : ""}`}
          >
            <label className={styles.radioWrapper}>
              <input
                type="radio"
                className={styles.radioButton}
                name={`correctOption-${question.id}`}
                checked={opt.is_correct}
                onChange={() => handleSelectCorrectOption(index)}
              />

              <span className={styles.customRadio}></span>

              <input
                type="text"
                className={styles.inputOpt}
                placeholder={`Opção ${index + 1}`}
                value={opt.text}
                onChange={(e) => handleChangeOptionText(index, e.target.value)}
              />
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRemoveOption(opt.id)}
            >
              🗑️
            </Button>
          </div>
        ))}
      </div>

      <div className={styles.buttons}>
        <Button
          variant="outline"
          className={styles.button}
          onClick={handleAddOption}
          disabled={question.options.length >= 6}
        >
          + Nova Opção
        </Button>

        <Button
          variant="outline"
          className={styles.button}
          onClick={() => handleDeleteQuestion(question.id)}
        >
          🗑️ Apagar
        </Button>
      </div>
    </div>
  );
}
