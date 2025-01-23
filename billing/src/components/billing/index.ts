export { default as List } from './list'
export { default as Form } from './form'

export type Type = Readonly<{
  id: string;
  time: string;
  name: string | null;
  note: string | null;
  valid: boolean;
}>;
