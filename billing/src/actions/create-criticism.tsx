import { Action, Icon, Keyboard, useNavigation } from "@raycast/api";
import { Criticism, Transaction } from "@components";
import { toast } from "@shared/utils";
import { API, FixedSWRInfiniteKeyedMutator, api, update } from "@hooks";

type Props = Readonly<{
  transaction: Transaction.Type;
  mutateCriticismList: FixedSWRInfiniteKeyedMutator<Array<API<Array<Criticism.Type>>>>;
  mutateTransactionList: FixedSWRInfiniteKeyedMutator<Array<API<Array<Transaction.Type>>>>;
}>;

export default function (props: Props) {
  const { mutateCriticismList, mutateTransactionList, transaction } = props;

  const { pop } = useNavigation();

  return (
    <Action.Push
      title="Create Criticism"
      icon={Icon.Plus}
      shortcut={Keyboard.Shortcut.Common.New}
      target={
        <Criticism.Form
          onSubmit={(form) => {
            pop();

            toast(
              "creat",
              "Criticism",
              mutateCriticismList?.(
                api<Criticism.Type>(`/transaction/${transaction.id}/criticism`, {
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
                      () => true,
                      (current) => [
                        {
                          id: "",
                          transaction_id: transaction.id,
                          ...form,
                          time: new Date().toISOString(),
                        },
                        current,
                      ],
                      {
                        id: "",
                        transaction_id: transaction.id,
                        ...form,
                        time: new Date().toISOString(),
                      },
                    );
                  },
                  populateCache(response, current) {
                    return update(
                      current,
                      () => true,
                      (next) => [response, next],
                      response,
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
                  (r) => r.id === transaction.id,
                  (r) => {
                    const clone = {
                      ...r,
                      criticism: { positive: r.criticism.positive, negative: r.criticism.negative },
                    };
                    switch (form.attitude) {
                      case Criticism.Attitude.Negative:
                        clone.criticism.negative += 1;
                        break;
                      case Criticism.Attitude.Positive:
                        clone.criticism.positive += 1;
                        break;
                    }
                    return clone;
                  },
                );
              },
              revalidate: true,
            });
          }}
        />
      }
    />
  );
}
