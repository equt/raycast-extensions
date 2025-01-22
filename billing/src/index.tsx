import { Action, ActionPanel, Icon, Keyboard, LaunchProps, useNavigation } from "@raycast/api";
import { BillingForm, BillingList } from "./components/billing";
import { DeepLink } from "./components/actions";
import { useMemo, useState } from "react";
import { TransactionForm, TransactionList } from "./components/transaction";
import { isSome, toast } from "./shared/utils";
import { formatDate } from "date-fns";
import { api, update } from "./hooks/useAPI";
import { Billing } from "./shared/types";

type BillingEntrypointProps = {
  handler: string;
};

function BillingEntrypoint(props: BillingEntrypointProps) {
  const { handler } = props;

  const [searchText, setSearchText] = useState("");

  const { pop } = useNavigation();

  return (
    <BillingList
      params={{
        name: useMemo(() => (searchText.length > 0 ? searchText : undefined), [searchText]),
      }}
      listProps={{
        navigationTitle: "Manage Billings",
        searchBarPlaceholder: `Search Billings`,
        searchText,
        onSearchTextChange: setSearchText,
      }}
      itemProps={(billing, mutate) => ({
        actions: (
          <ActionPanel>
            <Action.Push
              title="View Transactions"
              icon={Icon.Eye}
              target={
                <TransactionList
                  params={{
                    billing_id: billing.id,
                  }}
                  listProps={{
                    searchBarPlaceholder: `Search Transactions for ${billing.name ?? "New Billing"}`,
                    navigationTitle: `Transactions for ${billing.name ?? "New Billing"}`,
                    actions: (
                      <ActionPanel>
                        <Action.Push
                          title="Create"
                          icon={Icon.Plus}
                          shortcut={Keyboard.Shortcut.Common.New}
                          target={<TransactionForm />}
                        />
                      </ActionPanel>
                    ),
                  }}
                  itemProps={(transaction) => ({
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
                          title="Create"
                          icon={Icon.Plus}
                          shortcut={Keyboard.Shortcut.Common.New}
                          target={<TransactionForm />}
                        />
                      </ActionPanel>
                    ),
                  })}
                  defaultTitle={billing.name ?? undefined}
                />
              }
            />
            <Action.Push
              title="Edit"
              icon={Icon.Pencil}
              shortcut={Keyboard.Shortcut.Common.Edit}
              target={
                <BillingForm
                  initial={{ ...billing }}
                  onSubmit={(form) => {
                    pop();

                    toast(
                      "updat",
                      billing.name ?? "New Billing",
                      mutate(
                        api<Billing>(`/billing/${billing.id}`, {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            ...form,
                          }),
                        }),
                        {
                          optimisticData(current) {
                            return update(
                              current,
                              (r) => r.id === billing.id,
                              (current) => ({
                                ...current,
                                ...form,
                                time: form.time!.toISOString(),
                              }),
                            );
                          },
                          populateCache(response, current) {
                            return update(
                              current,
                              (r) => r.id === billing.id,
                              () => ({
                                ...response,
                              }),
                            );
                          },
                          revalidate: false,
                          rollbackOnError: true,
                        },
                      ),
                    );
                  }}
                />
              }
            />
            <Action.Push
              title="Create"
              icon={Icon.Plus}
              shortcut={Keyboard.Shortcut.Common.New}
              target={
                <BillingForm
                  initial={{ time: new Date().toISOString() }}
                  onSubmit={(form) => {
                    pop();

                    toast(
                      "creat",
                      form.name ?? "New Billing",
                      mutate(
                        api<Billing>("/billing", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            ...form,
                          }),
                        }),
                        {
                          optimisticData(current) {
                            return update(
                              current,
                              (r) => r.time <= form.time!.toISOString(),
                              (billing) => [
                                { id: "NEW", valid: false, ...form, time: form.time!.toISOString() },
                                billing,
                              ],
                            );
                          },
                          populateCache(billing, current) {
                            return update(
                              current,
                              (r) => r.time <= form.time!.toISOString(),
                              (next) => [billing, next],
                            );
                          },
                          revalidate: true, // revalidate as the cursor might have changed
                          rollbackOnError: true,
                        },
                      ),
                    );
                  }}
                />
              }
            />
            <Action
              title="Delete"
              icon={Icon.Trash}
              shortcut={Keyboard.Shortcut.Common.Remove}
              onAction={() =>
                toast(
                  "delet",
                  billing.name ?? "New Billing",
                  mutate(
                    api<Billing>(`/billing/${billing.id}`, {
                      method: "DELETE",
                    }),
                    {
                      optimisticData(current) {
                        return (
                          current?.map((page) => {
                            if (page.succeeded) {
                              return {
                                ...page,
                                data: page.data.filter((r) => r.id !== billing.id),
                              };
                            } else {
                              return { ...page };
                            }
                          }) ?? []
                        );
                      },
                      populateCache({ id }, current) {
                        return (
                          current?.map((page) => {
                            if (page.succeeded) {
                              return {
                                ...page,
                                data: page.data.filter((r) => r.id !== id),
                              };
                            } else {
                              return { ...page };
                            }
                          }) ?? []
                        );
                      },
                      revalidate: true, // revalidate as the cursor might have changed
                      rollbackOnError: true,
                    },
                  ),
                )
              }
            />
            <DeepLink name="Search Billing" view={handler} />
          </ActionPanel>
        ),
      })}
    />
  );
}

export default function (props: LaunchProps<{ arguments: Arguments.Index }>) {
  switch (props.arguments.view) {
    case "billing":
      return <BillingEntrypoint handler="billing" />;
  }
}
