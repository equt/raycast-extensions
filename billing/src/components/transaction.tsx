import { Color, Icon, List, Form, ActionPanel, Action } from "@raycast/api";
import { FixedSWRInfiniteKeyedMutator, useAPI, usePaginationAPI } from "../hooks/useAPI";
import {
  Account,
  AccountType,
  API,
  Billing,
  Currency,
  SearchParams,
  Transaction,
  TransactionType,
} from "../shared/types";
import { group, date, renderDate, isSome, hasUnitPrice, parseQuantity } from "../shared/utils";
import { FormValidation, useForm } from "@raycast/utils";
import Decimal from "decimal.js";

type TransactionFormProps = Readonly<
  Partial<{
    billing: Partial<Billing>;
    initial: Partial<Transaction>;
    onSubmit: (form: Form) => void;
  }>
>;

type Form = Readonly<{
  account_id: string;
  type: TransactionType;
}>;

export function TransactionForm(props?: TransactionFormProps) {
  const { initial, billing, onSubmit = () => void 0 } = props ?? {};

  const { itemProps, handleSubmit } = useForm<Form>({
    initialValues: {
      account_id: initial?.account?.id ?? "",
      type: initial?.type ?? TransactionType.Credit,
    },
    onSubmit,
    validation: {
      account_id: FormValidation.Required,
      type: FormValidation.Required,
    },
  });

  const { data: accounts } = useAPI<Array<Account>>("/account");

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
      <Form.Dropdown title="Account" {...itemProps.account_id}>
        {(accounts ?? []).map((account) => (
          <Form.Dropdown.Item
            key={account.id}
            title={`${account.name} (${Currency[account.currency]})`}
            value={account.id}
          />
        ))}
      </Form.Dropdown>
    </Form>
  );
}

type TransactionListProps = Readonly<
  Partial<{
    by: "date" | "account";
    size: number;
    defaultTitle: string;
    params: SearchParams | null;
    listProps: Omit<List.Props, "throttle" | "pagination" | "isLoading">;
    itemProps: (
      transaction: Transaction,
      mutate: FixedSWRInfiniteKeyedMutator<Array<API<Array<Transaction>>>>,
    ) => Omit<List.Item.Props, "icon" | "title" | "subtitle">;
  }>
>;

function account(transaction: Transaction) {
  return transaction.account.id;
}

function renderAccount({ account }: Transaction) {
  return `${account.name} (${AccountType[account.type]})`;
}

export function TransactionList(props?: TransactionListProps) {
  const { by = "account", defaultTitle = "New Transaction", params, itemProps, size } = props ?? {};

  const { data, mutate, pagination, isLoading } = usePaginationAPI<Transaction>("/transaction", {
    params,
    size,
  });

  return (
    <List throttle pagination={pagination} isLoading={isLoading} {...props?.listProps}>
      {Object.values(group(data ?? [], { account, date }[by])).map((transactions, i) => (
        <List.Section key={i} title={{ date: renderDate, account: renderAccount }[by](transactions[0])}>
          {transactions.map((transaction) => {
            const props = itemProps?.(transaction, mutate) ?? {};

            return (
              <List.Item
                key={transaction.id}
                title={defaultTitle}
                {...props}
                accessories={[
                  ...(props.accessories ?? []),
                  ...(hasUnitPrice(transaction)
                    ? [
                        {
                          icon: Icon.Tag,
                          text: new Decimal(transaction.amount)
                            .div(parseQuantity(transaction.name!).quantity)
                            .toNumber()
                            .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                        },
                      ]
                    : []),
                  {
                    icon: {
                      source: {
                        [TransactionType.Credit]: Icon.Minus,
                        [TransactionType.Debit]: Icon.Plus,
                      }[transaction.type],
                      tintColor: {
                        [TransactionType.Credit]: Color.Green,
                        [TransactionType.Debit]: Color.Red,
                      }[transaction.type],
                    },
                    text: {
                      value: `${Currency[transaction.account.currency]} ${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      color: {
                        [TransactionType.Credit]: Color.Green,
                        [TransactionType.Debit]: Color.Red,
                      }[transaction.type],
                    },
                  },
                ]}
              />
            );
          })}
        </List.Section>
      ))}
    </List>
  );
}
