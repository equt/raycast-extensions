import { Criticism, Transaction } from "@components";
import { api, API, FixedSWRInfiniteKeyedMutator, update } from "@hooks";
import { Action, Icon, Keyboard } from "@raycast/api";
import { toast } from "@shared/utils";

type Props = Readonly<{
  mutateTransactionList: FixedSWRInfiniteKeyedMutator<Array<API<Array<Transaction.Type>>>>;
  mutateCriticismList: FixedSWRInfiniteKeyedMutator<Array<API<Array<Criticism.Type>>>>;
  criticism: Criticism.Type;
}>;

export default function (props: Props) {
  const { mutateCriticismList, mutateTransactionList, criticism } = props;

  return (
    <Action
      title="Delete"
      icon={Icon.Trash}
      shortcut={Keyboard.Shortcut.Common.Remove}
      onAction={() => {
        toast(
          "delet",
          "Criticism",
          mutateCriticismList(
            api<Criticism.Type>(`/transaction/${criticism.transaction_id}/criticism/${criticism.id}`, {
              method: "DELETE",
            }),
            {
              optimisticData(current) {
                return update(
                  current,
                  (r) => r.id === criticism.id,
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

        mutateTransactionList(undefined, {
          optimisticData(current) {
            return update(
              current,
              (r) => r.id === criticism.transaction_id,
              (r) => {
                return {
                  ...r,
                  criticism: {
                    positive: r.criticism.positive - (criticism.attitude === Criticism.Attitude.Positive ? 1 : 0),
                    negative: r.criticism.negative - (criticism.attitude === Criticism.Attitude.Negative ? 1 : 0),
                  },
                };
              },
            );
          },
          populateCache(_, current) {
            return update(
              current,
              (r) => r.id === criticism.transaction_id,
              (r) => {
                return {
                  ...r,
                  criticism: {
                    positive: r.criticism.positive - (criticism.attitude === Criticism.Attitude.Positive ? 1 : 0),
                    negative: r.criticism.negative - (criticism.attitude === Criticism.Attitude.Negative ? 1 : 0),
                  },
                };
              },
            );
          },
          revalidate: false,
        });
      }}
    />
  );
}
