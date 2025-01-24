import { Billing, Transaction } from "@components";
import { api, API, FixedSWRInfiniteKeyedMutator } from "@hooks";
import { Action, Icon, Keyboard, useNavigation } from "@raycast/api";

type Props = Readonly<{
  billing: Billing.Type;
  transaction: Transaction.Type;
  transactions?: ReadonlyArray<Transaction.Type>;
  mutate: FixedSWRInfiniteKeyedMutator<Array<API<Array<Transaction.Type>>>>;
}>;

export default function (props: Props) {
  const { billing, transaction, transactions, mutate } = props;

  const { pop } = useNavigation();

  return (
    <Action.Push
      title="Edit"
      icon={Icon.Pencil}
      shortcut={Keyboard.Shortcut.Common.Edit}
      target={
        <Transaction.Form
          transactions={transactions}
          billing={billing}
          initial={{ ...transaction }}
          onSubmit={async ({ account, ...form }) => {
            pop();

            await api<Transaction.Type>(`/transaction/${transaction.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                billing_id: billing.id,
                type: transaction.type !== form.type ? form.type : undefined,
                amount: transaction.amount !== form.amount ? form.amount : undefined,
                name: transaction.name !== form.name && form.name !== billing.name ? form.name : undefined,
                account_id: transaction.account.id !== account.id ? account.id : undefined,
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
