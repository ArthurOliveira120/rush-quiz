import { useContext } from "react";
import { RoomContext } from "../contexts/RoomContext";

export function useRoom() {
    const context = useContext(RoomContext);

    if (!context) {
        throw new Error("useRoom deve ser usado dentro de um <RoomProvider>.");
    }

    return context;
}