import { Billing, Transaction } from "@components";
import { api, API, FixedSWRInfiniteKeyedMutator, update } from "@hooks";
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
          onSubmit={(form) => {
            pop();

            mutate(
              api<Transaction.Type>("/transaction", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  billing_id: billing.id,
                  ...form,
                  time: form.time?.toISOString() !== billing.time ? form.time?.toISOString() : undefined,
                }),
              }),
              {
                optimisticData(current) {
                  return update(
                    current,
                    (r) =>
                      r.time <=
                      (form.time && form.time?.toISOString() !== billing.time ? form.time.toISOString() : billing.time),
                    (current) => [
                      {
                        id: "",
                        billing_id: billing.id,
                        ...form,
                        time: form.time?.toISOString() ?? billing.time,
                        name: form.name ?? billing.name,
                        criticism: {
                          negative: 0,
                          positive: 0,
                        },
                      },
                      current,
                    ],
                    {
                      id: "",
                      billing_id: billing.id,
                      ...form,
                      time: form.time?.toISOString() ?? billing.time,
                      name: form.name ?? billing.name,
                      criticism: {
                        negative: 0,
                        positive: 0,
                      },
                    },
                  );
                },
                populateCache(response, current) {
                  return update(
                    current,
                    (r) =>
                      r.time <=
                        (form.time && form.time?.toISOString() !== billing.time
                          ? form.time.toISOString()
                          : billing.time) && r.id <= response.id,
                    (current) => [response, current],
                    response
                  );
                },
                revalidate: true,
              },
            );
          }}
        />
      }
    />
  );
}
