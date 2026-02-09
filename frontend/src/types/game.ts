export type Game = {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    is_public: boolean;
}

export type Question = {
  id: string;
  game_id: string;
  order: number;
  text: string;
  options?: Option[];
};

export type Option = {
  id: string;
  question_id: string;
  order: number;
  text: string;
  is_correct: boolean;
};