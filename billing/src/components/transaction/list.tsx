import { Color, Icon, List } from "@raycast/api";
import { Transaction } from '@components'
import { API, SearchParams, FixedSWRInfiniteKeyedMutator, usePaginationAPI } from "@hooks";
import { group, date, renderDate, hasUnitPrice, parseQuantity } from "@shared/utils";
import Decimal from "decimal.js";

type TransactionListProps = Readonly<
  Partial<{
    by: "date" | "account";
    size: number;
    defaultTitle: string;
    params: SearchParams | null;
    listProps: (
      mutate: FixedSWRInfiniteKeyedMutator<Array<API<Array<Transaction.Type>>>>,
    ) => Omit<List.Props, "throttle" | "pagination" | "isLoading">;
    itemProps: (
      transaction: Transaction.Type,
      mutate: FixedSWRInfiniteKeyedMutator<Array<API<Array<Transaction.Type>>>>,
    ) => Omit<List.Item.Props, "icon" | "title" | "subtitle">;
  }>
>;

function account(transaction: Transaction.Type) {
  return transaction.account.id;
}

function renderAccount({ account }: Transaction.Type) {
  return `${account.name} (${Transaction.AccountType[account.type]})`;
}

export default function TransactionList(props?: TransactionListProps) {
  const { by = "account", defaultTitle = "New Transaction", params, itemProps, size } = props ?? {};

  const { data, mutate, pagination, isLoading } = usePaginationAPI<Transaction.Type>("/transaction", {
    params,
    size,
  });

  return (
    <List throttle pagination={pagination} isLoading={isLoading} {...props?.listProps?.(mutate)}>
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
                  ...(transaction.criticism.positive
                    ? [
                        {
                          icon: Icon.ThumbsUp,
                          text: transaction.criticism.positive.toString(),
                        },
                      ]
                    : []),
                  ...(transaction.criticism.negative
                    ? [
                        {
                          icon: Icon.ThumbsDown,
                          text: transaction.criticism.negative.toString(),
                        },
                      ]
                    : []),
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
                        [Transaction.TransactionType.Credit]: Icon.Minus,
                        [Transaction.TransactionType.Debit]: Icon.Plus,
                      }[transaction.type],
                      tintColor: {
                        [Transaction.TransactionType.Credit]: Color.Green,
                        [Transaction.TransactionType.Debit]: Color.Red,
                      }[transaction.type],
                    },
                    text: {
                      value: `${Transaction.Currency[transaction.account.currency]} ${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      color: {
                        [Transaction.TransactionType.Credit]: Color.Green,
                        [Transaction.TransactionType.Debit]: Color.Red,
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
