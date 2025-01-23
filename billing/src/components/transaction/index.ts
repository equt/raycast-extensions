export { default as List } from './list'
export { default as Form } from './form'

export enum AccountType {
  Assets,
  Capital,
  Expenses,
  Liabilities,
  Revenue,
}

export enum TransactionType {
  Debit,
  Credit,
}

export enum Currency {
  USD = "USD",
  CNY = "CNY",
  EUR = "EUR",
  JPY = "JPY",
}

export type Account = Readonly<{
  id: string;
  name: string;
  type: AccountType;
  currency: Currency;
}>;

export type Type = Readonly<{
  id: string;
  billing_id: string;
  type: TransactionType;
  amount: number;
  name: string | null;
  time: string;
  account: Account;
  criticism: Readonly<{
    positive: number;
    negative: number;
  }>
}>;
