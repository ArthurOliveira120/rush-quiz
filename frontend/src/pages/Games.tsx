import styles from "./Games.module.css";

import { Card } from "../components/Card";
import { Header } from "../components/Header";
import { Button } from "../components/Button";

export function Games() {
  return (
    <>
      <Header></Header>
      <div className={styles.gamesContainer}>
        <h4>Jogos salvos</h4>
        <div className={styles.gameList}>
          <Card id={1} title="teste1"></Card>
          <Card id={2} title="teste2"></Card>
          <Card id={3} title="teste3"></Card>

          <Button size="md" variant="outline"> + Novo jogo</Button>
        </div>
      </div>
    </>
  );
}
