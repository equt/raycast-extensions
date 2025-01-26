import { Action, ActionPanel, Alert, confirmAlert, Icon, Keyboard, LaunchProps, List } from "@raycast/api";
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
  CreateFilter,
} from "./actions";
import EditTransaction from "./actions/edit-transaction";
import { useCachedState, useLocalStorage } from "@raycast/utils";
import { useMemo } from "react";

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
  const { value: filters, setValue: setFilters } = useLocalStorage<Array<Transaction.Filter>>("TRANSACTION_FILTERS", [
    {
      icon: Icon.List,
      name: "All",
      aggregation: { type: Transaction.AggregationType.Sum },
      params: {},
    },
  ]);

  const [currentFilterName, setCurrentFilterName] = useCachedState<string>("TRANSACTION_CURRENT_FILTER", "All");

  const currentFilter = useMemo(
    () => filters?.find(({ name }) => name === currentFilterName),
    [currentFilterName, filters],
  );

  return (
    <Transaction.List
      listProps={() => ({
        navigationTitle: "Manage Transactions",
        searchBarPlaceholder: `Search Transactions`,
        searchBarAccessory: (
          <List.Dropdown value={currentFilterName} tooltip="Search Filters" onChange={setCurrentFilterName}>
            {filters?.map((filter, i) => (
              <List.Dropdown.Item key={i} title={filter.name} icon={filter.icon} value={filter.name} />
            ))}
          </List.Dropdown>
        ),
        actions: (
          <ActionPanel>
            <CreateFilter filters={filters ?? []} setFilters={setFilters} setCurrentFilterName={setCurrentFilterName} />
          </ActionPanel>
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
            <ActionPanel.Section title="Filters">
              <CreateFilter
                filters={filters ?? []}
                setFilters={setFilters}
                setCurrentFilterName={setCurrentFilterName}
              />
              {currentFilterName !== "All" && (
                <Action
                  title="Delete"
                  icon={Icon.Trash}
                  shortcut={Keyboard.Shortcut.Common.Remove}
                  onAction={async () => {
                    if (
                      await confirmAlert({
                        title: `Delete Filter`,
                        message: `Are you sure you want to delete the filter "${currentFilterName}"?`,
                        icon: Icon.Warning,
                        primaryAction: {
                          style: Alert.ActionStyle.Destructive,
                          title: "Delete",
                        },
                      })
                    ) {
                      setFilters(filters?.filter(({ name }) => name !== currentFilterName) ?? []);
                    }
                  }}
                />
              )}
            </ActionPanel.Section>
          </ActionPanel>
        ),
      })}
      params={{ ...currentFilter?.params }}
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
