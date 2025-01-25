import { Color, Icon, List } from "@raycast/api";
import { Transaction } from "@components";
import { API, SearchParams, FixedSWRInfiniteKeyedMutator, usePaginationAPI } from "@hooks";
import { group, date, renderDate, hasUnitPrice, parseQuantity } from "@shared/utils";
import Decimal from "decimal.js";
import { useCachedState } from "@raycast/utils";
import { useMemo } from "react";

type Props = Readonly<
  Partial<{
    by: { type: "date" } | { type: "account"; namespace: string };
    size: number;
    defaultTitle: string;
    params: SearchParams | null;
    listProps: (
      mutate: FixedSWRInfiniteKeyedMutator<Array<API<Array<Transaction.Type>>>>,
    ) => Omit<List.Props, "throttle" | "pagination" | "isLoading">;
    itemProps: (
      transaction: Transaction.Type,
      mutate: FixedSWRInfiniteKeyedMutator<Array<API<Array<Transaction.Type>>>>,
      transactions: ReadonlyArray<Transaction.Type>,
    ) => Omit<List.Item.Props, "icon" | "title" | "subtitle">;
  }>
>;

function account(transaction: Transaction.Type) {
  return transaction.account.id;
}

function renderAccount({ account }: Transaction.Type) {
  return `${account.name} (${Transaction.AccountType[account.type]})`;
}

export default function (props?: Props) {
  const { by = { type: "date" }, defaultTitle = "New Transaction", params, itemProps, listProps, size } = props ?? {};

  const [searchText, setSearchText] = useCachedState("TRANSACTION_SEARCH", "", {
    cacheNamespace: by.type === "account" ? by.namespace : undefined,
  });

  const { data, mutate, pagination, isLoading } = usePaginationAPI<Transaction.Type>("/transaction", {
    params: useMemo(
      () => ({
        ...params,
        name: searchText.length > 0 ? searchText : undefined,
      }),
      [params, searchText],
    ),
    size,
  });

  return (
    <List
      throttle
      searchText={searchText}
      pagination={pagination}
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      {...listProps?.(mutate)}
    >
      {Object.values(group(data ?? [], { account, date }[by.type])).map((transactions, i) => (
        <List.Section key={i} title={{ date: renderDate, account: renderAccount }[by.type](transactions[0])}>
          {transactions.map((transaction) => {
            const props = itemProps?.(transaction, mutate, data ?? []) ?? {};

            return (
              <List.Item
                key={transaction.id}
                title={transaction.name ?? defaultTitle}
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
