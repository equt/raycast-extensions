import { Action, ActionPanel, Icon, LaunchProps, List } from "@raycast/api";
import { Billing, Transaction, Criticism } from "@components";
import { isSome } from "./shared/utils";
import { formatDate } from "date-fns";
import {
  CreateCriticism,
  CreateTransaction,
  DeleteCriticism,
  EditBilling,
  EditCriticism,
  CreateBilling,
  DeleteBilling,
  DeleteTransaction,
} from "./actions";
import EditTransaction from "./actions/edit-transaction";
import { useCachedState } from "@raycast/utils";

function BillingEntrypoint() {
  return (
    <Billing.List
      listProps={(mutate) => ({
        navigationTitle: "Manage Billings",
        searchBarPlaceholder: `Search Billings`,
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
                    by={{ type: "account", namespace: billing.id }}
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
                            <EditTransaction
                              transaction={transaction}
                              transactions={transactions}
                              billing={billing}
                              mutate={mutateTransactionList}
                            />
                            <CreateTransaction
                              billing={billing}
                              mutate={mutateTransactionList}
                              transactions={transactions}
                            />
                            <DeleteTransaction transaction={transaction} mutate={mutateTransactionList} />
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

function TransactionEntrypoint() {
  type TransactionFilter = {
    name: string;
    icon: Icon;
    params: string;
  };

  const [filters] = useCachedState<Array<TransactionFilter>>("TRANSACTION_FILTER", [
    {
      icon: Icon.List,
      name: "All",
      params: "{}",
    },
  ]);

  return (
    <Transaction.List
      listProps={() => ({
        navigationTitle: "Manage Transactions",
        searchBarPlaceholder: `Search Transactions`,
        searchBarAccessory: (
          <List.Dropdown tooltip="Search Filters">
            {filters.map((filter, i) => (
              <List.Dropdown.Item key={i} title={filter.name} icon={filter.icon} value={filter.params} />
            ))}
          </List.Dropdown>
        ),
      })}
      itemProps={(transaction, mutateTransactionList) => ({
        actions: (
          <ActionPanel>
            <ActionPanel.Section title="Criticisms">
              <Action.Push
                title="View"
                icon={Icon.Eye}
                target={
                  <Criticism.List
                    listProps={(mutateCriticismList) => ({
                      searchBarPlaceholder: `Search Criticisms for ${transaction.name ?? "New Transaction"}`,
                      navigationTitle: `Criticisms for ${transaction.name ?? "New Transaction"}`,
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
          </ActionPanel>
        ),
      })}
      params={{}}
    />
  );
}

export default function (props: LaunchProps<{ arguments: Arguments.Index }>) {
  switch (props.arguments.view) {
    case "billing":
      return <BillingEntrypoint />;
    case "transaction":
      return <TransactionEntrypoint />;
  }
}
