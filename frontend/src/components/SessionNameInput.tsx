import { useState } from "react";
import { useSession } from "../contexts/SessionContext";

export function SessionNameInput() {
  const { session, setName } = useSession();
  const [value, setValue] = useState(session.name ?? "");

  function handleSave() {
    if (!value.trim()) return;
    setName(value.trim());
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Seu nome"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button onClick={handleSave}>Salvar nome</button>

      {session.name && (
        <p>Nome atual: <strong>{session.name}</strong></p>
      )}
    </div>
  );
}