import { Card } from "../components/Card";
import styles from "./Host.module.css";

export function Host() {
  return (
    <>
      <div className={styles.question}>
        <h1>Qual o maior rio do mundo?</h1>
      </div>

      <div className={styles.options}>
        <div className={styles.opt}>Rio de Janeiro</div>
        <div className={styles.opt}>Rio Sem Peixe</div>
        <div className={styles.opt}>Rio Amazonas</div>
        <div className={styles.opt}>Rio Tietê</div>
      </div>

      <div className={styles.timer}>4</div>
    </>
  );
}
