import { Action, ActionPanel, Icon, LaunchProps } from "@raycast/api";
import { Billing, Transaction, Criticism } from "@components";
import { useMemo, useState } from "react";
import { isSome } from "./shared/utils";
import { formatDate } from "date-fns";
import { CreateCriticism, CreateTransaction, DeleteCriticism, EditBilling, EditCriticism, CreateBilling, DeleteBilling } from "./actions";

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
            <ActionPanel.Section title="Transactions">
              <Action.Push
                title="View"
                icon={Icon.Eye}
                target={
                  <Transaction.List
                    params={{
                      billing_id: billing.id,
                    }}
                    listProps={(mutate) => ({
                      searchBarPlaceholder: `Search Transactions for ${billing.name ?? "New Billing"}`,
                      navigationTitle: `Transactions for ${billing.name ?? "New Billing"}`,
                      actions: (
                        <ActionPanel>
                          <CreateTransaction billing={billing} transactions={[]} mutate={mutate} />
                        </ActionPanel>
                      ),
                    })}
                    itemProps={(transaction, mutateTransactionList, transactions) => ({
                      accessories: [
                        transaction.time !== billing.time
                          ? {
                              text: formatDate(transaction.time, "LLL do, yyyy"),
                            }
                          : undefined,
                      ].filter(isSome),
                      actions: (
                        <ActionPanel>
                          <ActionPanel.Section title="Criticisms">
                            <Action.Push
                              title="View"
                              icon={Icon.Eye}
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
                                        <ActionPanel.Section title="Manage Criticisms">
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
                                        </ActionPanel.Section>
                                      </ActionPanel>
                                    ),
                                  })}
                                  transaction={transaction}
                                />
                              }
                            />
                          </ActionPanel.Section>
                          <ActionPanel.Section title="Transactions">
                            <CreateTransaction
                              billing={billing}
                              mutate={mutateTransactionList}
                              transactions={transactions}
                            />
                          </ActionPanel.Section>
                        </ActionPanel>
                      ),
                    })}
                    defaultTitle={billing.name ?? undefined}
                  />
                }
              />
            </ActionPanel.Section>
            <ActionPanel.Section title="Billings">
              <EditBilling billing={billing} mutate={mutate} />
              <CreateBilling mutate={mutate} />
              <DeleteBilling billing={billing} mutate={mutate} />
            </ActionPanel.Section>
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
