export { default as List } from "./list";
export { default as Form } from "./form";

export enum Attitude {
  Negative,
  Positive,
}

export type Type = Readonly<{
  id: string;
  transaction_id: string;
  attitude: Attitude;
  text: string;
  time: string;
}>;
