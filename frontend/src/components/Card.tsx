import styles from "./Card.module.css";

import { Button } from "./Button";

type cardProps = {
    id: number,
    title: string,
}

export function Card({ id, title }: cardProps) {
    return (
        <div className={styles.card}>
            <div className={styles.cardInfos}>
                <h4>{id}</h4>
                <h4>{title}</h4>
            </div>
            <div className={styles.cardButtons}>
                <Button size="sm">Jogar</Button>
                <Button size="sm">Editar</Button>
                <Button size="sm">Excluir</Button>
            </div>
        </div>
    )
}