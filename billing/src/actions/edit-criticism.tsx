import { Action, Icon, Keyboard, useNavigation } from "@raycast/api";
import { Criticism, Transaction } from "@components";
import { toast } from "@shared/utils";
import { API, FixedSWRInfiniteKeyedMutator, api, update } from "@hooks";

type Props = Readonly<{
  criticism: Criticism.Type;
  transaction: Transaction.Type;
  mutateCriticismList: FixedSWRInfiniteKeyedMutator<Array<API<Array<Criticism.Type>>>>;
  mutateTransactionList: FixedSWRInfiniteKeyedMutator<Array<API<Array<Transaction.Type>>>>;
}>;

export default function (props: Props) {
  const { mutateCriticismList, mutateTransactionList, transaction, criticism } = props;

  const { pop } = useNavigation();

  return (
    <Action.Push
      title="Create Criticism"
      icon={Icon.Plus}
      shortcut={Keyboard.Shortcut.Common.New}
      target={
        <Criticism.Form
          initial={{ ...criticism }}
          onSubmit={(form) => {
            pop();

            toast(
              "updat",
              "Criticism",
              mutateCriticismList?.(
                api<Criticism.Type>(`/transaction/${transaction.id}/criticism/${criticism.id}`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    text: form.text !== criticism.text ? form.text : undefined,
                    attitude: form.attitude !== criticism.attitude ? form.attitude : undefined,
                  }),
                }),
                {
                  optimisticData(current) {
                    return update(
                      current,
                      (r) => r.id === criticism.id,
                      (r) => ({ ...r, ...form }),
                    );
                  },
                  populateCache(response, current) {
                    return update(
                      current,
                      (r) => r.id === criticism.id,
                      (r) => ({ ...r, ...response }),
                    );
                  },
                  revalidate: false,
                  rollbackOnError: true,
                },
              ),
            );

            if (form.attitude !== criticism.attitude) {
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
                          clone.criticism.positive -= 1;
                          break;
                        case Criticism.Attitude.Positive:
                          clone.criticism.positive += 1;
                          clone.criticism.negative -= 1;
                          break;
                      }
                      return clone;
                    },
                  );
                },
                revalidate: true,
              });
            }
          }}
        />
      }
    />
  );
}
