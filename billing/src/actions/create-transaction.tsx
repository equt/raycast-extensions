import { Billing, Transaction } from "@components";
import { api, API, FixedSWRInfiniteKeyedMutator } from "@hooks";
import { Action, Icon, Keyboard, useNavigation } from "@raycast/api";

type Props = Readonly<{
  billing: Billing.Type;
  transactions?: ReadonlyArray<Transaction.Type>;
  mutate: FixedSWRInfiniteKeyedMutator<Array<API<Array<Transaction.Type>>>>;
}>;

export default function (props: Props) {
  const { billing, transactions, mutate } = props;

  const { pop } = useNavigation();

  return (
    <Action.Push
      title="Create"
      icon={Icon.Pencil}
      shortcut={Keyboard.Shortcut.Common.New}
      target={
        <Transaction.Form
          transactions={transactions}
          billing={billing}
          onSubmit={async ({ account, ...form }) => {
            pop();

            await api<Transaction.Type>("/transaction", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                billing_id: billing.id,
                ...form,
                account_id: account.id,
                time: form.time?.toISOString() !== billing.time ? form.time?.toISOString() : undefined,
              }),
            });

            mutate();
          }}
        />
      }
    />
  );
}
