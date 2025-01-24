import { Form, ActionPanel, Action } from "@raycast/api";
import { Transaction, Billing } from "@components";
import { useAPI } from "@hooks";
import { isNone, isSome } from "@shared/utils";
import { FormValidation, useForm } from "@raycast/utils";
import { Nullable } from "@shared/types";
import { useMemo } from "react";
import Decimal from "decimal.js";
import { pattern } from "@equt/pattern";

const addP = pattern`${["lhs", /\d+(\.\d+)?/, { parse: parseFloat }]}\s*\+\s*${["rhs", /\d+(\.\d+)?/, { parse: parseFloat }]}`;
const subP = pattern`${["lhs", /\d+(\.\d+)?/, { parse: parseFloat }]}\s*-\s*${["rhs", /\d+(\.\d+)?/, { parse: parseFloat }]}`;
const mulP = pattern`${["lhs", /\d+(\.\d+)?/, { parse: parseFloat }]}\s*\*\s*${["rhs", /\d+(\.\d+)?/, { parse: parseFloat }]}`;
const divP = pattern`${["lhs", /\d+(\.\d+)?/, { parse: parseFloat }]}\s*\/\s*${["rhs", /\d+(\.\d+)?/, { parse: parseFloat }]}`;

function tryEvaluate(value: string): Nullable<number> {
  try {
    const { lhs, rhs } = addP(value);
    return new Decimal(lhs).add(rhs).toNumber();
  } catch {
    //
  }

  try {
    const { lhs, rhs } = subP(value);
    return new Decimal(lhs).sub(rhs).toNumber();
  } catch {
    //
  }

  try {
    const { lhs, rhs } = mulP(value);
    return new Decimal(lhs).mul(rhs).toNumber();
  } catch {
    //
  }

  try {
    const { lhs, rhs } = divP(value);
    return parseFloat(new Decimal(lhs).div(rhs).toFixed(2));
  } catch {
    //
  }
}

type Props = Readonly<
  Partial<{
    billing: Partial<Billing.Type>;
    transactions: ReadonlyArray<Transaction.Type>;
    initial: Partial<Transaction.Type>;
    onSubmit: (form: Form) => void;
  }>
>;

type Form = Readonly<{
  account: Transaction.Account;
  type: Transaction.TransactionType;
  amount: number;
  time: Date | null;
  name: string | undefined;
}>;

export default function (props?: Props) {
  const { initial, billing, transactions, onSubmit } = props ?? {};

  const debit = useMemo(
      () =>
        transactions
          ?.filter((transaction) => transaction.type === Transaction.TransactionType.Debit)
          .reduce((total, transaction) => total.add(transaction.amount), new Decimal(0)),
      [transactions],
    ),
    credit = useMemo(
      () =>
        transactions
          ?.filter((transaction) => transaction.type === Transaction.TransactionType.Credit)
          .reduce((total, transaction) => total.add(transaction.amount), new Decimal(0)),
      [transactions],
    );

  const { itemProps, setValue, handleSubmit } = useForm<{
    amount: string;
    account_id: string;
    type: string;
    time: Date | null;
    name: string;
  }>({
    initialValues: {
      amount:
        initial?.amount?.toString() ??
        debit
          ?.minus(credit ?? 0)
          .abs()
          .toString() ??
        undefined,
      account_id: initial?.account?.id ?? "",
      type: (
        initial?.type ??
        (isSome(credit) && isSome(debit)
          ? credit > debit
            ? Transaction.TransactionType.Debit
            : Transaction.TransactionType.Credit
          : Transaction.TransactionType.Credit)
      ).toString(),
      name: initial?.name ?? billing?.name ?? undefined,
      time: initial?.time ? new Date(initial.time) : billing?.time ? new Date(billing.time) : null,
    },
    onSubmit(form) {
      onSubmit?.({
        amount: parseFloat(form.amount),
        account: accounts!.find((account) => account.id === form.account_id)!,
        type: parseInt(form.type),
        time: form.time,
        name: form.name,
      });
    },
    validation: {
      account_id: FormValidation.Required,
      type: FormValidation.Required,
      amount: FormValidation.Required,
    },
  });

  const { data: accounts } = useAPI<Array<Transaction.Account>>("/account");

  return (
    <Form
      navigationTitle={
        isSome(initial?.id)
          ? `Edit ${initial?.name ?? "Transaction"} for ${billing?.name ?? "New Billing"}`
          : `Create New Transaction for ${billing?.name ?? "New Billing"}`
      }
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        title="Amount"
        {...itemProps.amount}
        onBlur={({ target }) => {
          if (isNone(target.value)) return;
          const evaluated = tryEvaluate(target.value)?.toString();
          if (isSome(evaluated)) setValue("amount", evaluated);
        }}
      />
      <Form.Dropdown title="Account" {...itemProps.account_id}>
        {(accounts ?? []).map((account) => (
          <Form.Dropdown.Item
            key={account.id}
            title={`${account.name} (${Transaction.Currency[account.currency]})`}
            value={account.id}
          />
        ))}
      </Form.Dropdown>
      <Form.Dropdown title="Type" {...itemProps.type}>
        <Form.Dropdown.Item title="Debit" value={Transaction.TransactionType.Debit.toString()} />
        <Form.Dropdown.Item title="Credit" value={Transaction.TransactionType.Credit.toString()} />
      </Form.Dropdown>
      <Form.DatePicker
        title="Time"
        {...itemProps.time}
        info="When transaction time is missing, billing's time it belonged will be used"
      />
      <Form.TextField
        title="Name"
        {...itemProps.name}
        info="When transaction name is missing, billing's name it belonged will be used"
      />
    </Form>
  );
}
