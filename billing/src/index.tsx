import { Action, ActionPanel, Icon, Keyboard, LaunchProps } from "@raycast/api";
import { Billing, Transaction, Criticism } from "@components";
import { useMemo, useState } from "react";
import { isSome } from "./shared/utils";
import { formatDate } from "date-fns";
import { CreateCriticism, DeleteCriticism, EditBilling, EditCriticism } from "./actions";
import CreateBilling from "./actions/create-billing";
import DeleteBilling from "./actions/delete-billing";

function BillingEntrypoint() {
  const [searchText, setSearchText] = useState("");

  return (
    <Billing.List
      params={{
        name: useMemo(() => (searchText.length > 0 ? searchText : undefined), [searchText]),
      }}
      listProps={(mutate) => ({
        navigationTitle: "Manage Billings",
        searchBarPlaceholder: `Search Billings`,
        searchText,
        onSearchTextChange: setSearchText,
        actions: (
          <ActionPanel>
            <CreateBilling mutate={mutate} />
          </ActionPanel>
        ),
      })}
      itemProps={(billing, mutate) => ({
        actions: (
          <ActionPanel>
            <Action.Push
              title="View Transactions"
              icon={Icon.Eye}
              target={
                <Transaction.List
                  params={{
                    billing_id: billing.id,
                  }}
                  listProps={() => ({
                    searchBarPlaceholder: `Search Transactions for ${billing.name ?? "New Billing"}`,
                    navigationTitle: `Transactions for ${billing.name ?? "New Billing"}`,
                    actions: (
                      <ActionPanel>
                        <Action.Push
                          title="Create"
                          icon={Icon.Plus}
                          shortcut={Keyboard.Shortcut.Common.New}
                          target={<Transaction.Form />}
                        />
                      </ActionPanel>
                    ),
                  })}
                  itemProps={(transaction, mutateTransactionList) => ({
                    accessories: [
                      transaction.time !== billing.time
                        ? {
                            text: formatDate(transaction.time, "LLL do, yyyy"),
                          }
                        : undefined,
                    ].filter(isSome),
                    actions: (
                      <ActionPanel>
                        <Action.Push
                          title="View Criticisms"
                          target={
                            <Criticism.List
                              listProps={(mutateCriticismList) => ({
                                searchBarPlaceholder: `Search Criticisms for ${transaction.name ?? billing.name ?? "New Transaction"}`,
                                navigationTitle: `Criticisms for ${transaction.name ?? billing.name ?? "New Transaction"}`,
                                actions: (
                                  <ActionPanel>
                                    <CreateCriticism
                                      mutateCriticismList={mutateCriticismList}
                                      mutateTransactionList={mutateTransactionList}
                                      transaction={transaction}
                                    />
                                  </ActionPanel>
                                ),
                              })}
                              itemProps={(criticism, mutateCriticismList) => ({
                                actions: (
                                  <ActionPanel>
                                    <Action.Push
                                      title="Edit Criticism"
                                      icon={Icon.Pencil}
                                      shortcut={Keyboard.Shortcut.Common.Edit}
                                      target={<Criticism.Form initial={{ ...criticism }} />}
                                    />
                                    <CreateCriticism
                                      mutateCriticismList={mutateCriticismList}
                                      mutateTransactionList={mutateTransactionList}
                                      transaction={transaction}
                                    />
                                    <EditCriticism
                                      mutateCriticismList={mutateCriticismList}
                                      mutateTransactionList={mutateTransactionList}
                                      criticism={criticism}
                                      transaction={transaction}
                                    />
                                    <DeleteCriticism
                                      mutateCriticismList={mutateCriticismList}
                                      mutateTransactionList={mutateTransactionList}
                                      criticism={criticism}
                                    />
                                  </ActionPanel>
                                ),
                              })}
                              transaction={transaction}
                            />
                          }
                        />
                        <Action.Push
                          title="Create"
                          icon={Icon.Plus}
                          shortcut={Keyboard.Shortcut.Common.New}
                          target={<Transaction.Form />}
                        />
                      </ActionPanel>
                    ),
                  })}
                  defaultTitle={billing.name ?? undefined}
                />
              }
            />
            <EditBilling billing={billing} mutate={mutate} />
            <CreateBilling mutate={mutate} />
            <DeleteBilling billing={billing} mutate={mutate} />
          </ActionPanel>
        ),
      })}
    />
  );
}

export default function (props: LaunchProps<{ arguments: Arguments.Index }>) {
  switch (props.arguments.view) {
    case "billing":
      return <BillingEntrypoint />;
  }
}
