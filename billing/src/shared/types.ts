export type NonEmptyArray<T> = [T, ...T[]];

export type API<Data> = Readonly<
  { succeeded: true; data: Data; cursor?: string } | { succeeded: false; message: string }
>;

type Primitive = string | number | boolean | undefined | null;

export type SearchParams = Record<string, Primitive | Array<Primitive>>;

export type Nullable<T> = T | null | undefined;

export enum Attitude {
  Negative,
  Positive,
}

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

export enum SubscriptionPeriod {
  Monthly,
  Yearly,
}

export type Billing = Readonly<{
  id: string;
  time: string;
  name: string | null;
  note: string | null;
  valid: boolean;
}>;

export type Account = Readonly<{
  id: string;
  name: string;
  type: AccountType;
  currency: Currency;
}>;

export type Transaction = Readonly<{
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
