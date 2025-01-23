import { Transaction } from "@components";
import { api, API, FixedSWRInfiniteKeyedMutator, update } from "@hooks";
import { Action, Icon, Keyboard } from "@raycast/api";
import { toast } from "@shared/utils";

type Props = Readonly<{
  mutate: FixedSWRInfiniteKeyedMutator<Array<API<Array<Transaction.Type>>>>;
  transaction: Transaction.Type;
}>;

export default function (props: Props) {
  const { mutate, transaction } = props;

  return (
    <Action
      title="Delete"
      icon={Icon.Trash}
      shortcut={Keyboard.Shortcut.Common.Remove}
      onAction={() => {
        toast(
          "delet",
          "Transaction",
          mutate(
            api<Transaction.Type>(`/transaction/${transaction.id}`, {
              method: "DELETE",
            }),
            {
              optimisticData(current) {
                return update(
                  current,
                  (r) => r.id === transaction.id,
                  () => [],
                );
              },
              populateCache({ id }, current) {
                return update(
                  current,
                  (r) => r.id === id,
                  () => [],
                );
              },
              revalidate: true, // revalidate as the cursor might have changed
              rollbackOnError: true,
            },
          ),
        );
      }}
    />
  );
}
