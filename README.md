# Rush Quiz

Plataforma de quiz multiplayer em tempo real, inspirada no Kahoot, desenvolvida em React, Node.js, Socket.IO e Supabase.

🔗 **Demo:** https://rush-quiz.vercel.app
🧪 **Modo teste:** entre em uma sala e jogue com amigos

## Funcionalidades

- Criação de jogos e salas com PIN
- Quiz multiplayer em tempo real
- Controle de perguntas e fluxo pelo Host
- Jogadores respondem pelo celular
- Ranking final com top 5
- Comunicação via WebSockets

## Tecnologias

### Frontend

- React + Typescript
- Vite
- CSS Modules
- Socket.IO Client

### Backend

- Node.js
- Express
- Socket.IO
- Supabase (PostgreSQL + Auth)

## Deploy

- Vercel
- Render

## Arquitetura 

- Frontend e backend separados
- Comunicação em tempo real via Socket.IO
- Estado do jogo gerenciado pelo servidor
- Persistência de dados com Supabase
- Arquitetura orientada a eventos

## Rodando localmente

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
```

Crie um .env com:

```env
VITE_BACKEND_URL=http://localhost:3001
```

Em seguida:

```bash
npm install
npm run dev
```

## Status do projeto

Em desenvolvimento ativo, com novas funcionalidades sendo adicionadas (melhorias visuais, tempo, pontuação, etc).

## Autores

Arthur Oliveira Marinho
💼 Estudante / Desenvolvedor Full Stack
🔗 Github: https://github.com/ArthurOliveira120

Matheus Araujo de Lima
💼 Estudante / Desenvolvedor Full Stack
🔗 Github: https://github.com/MatheusLima505

