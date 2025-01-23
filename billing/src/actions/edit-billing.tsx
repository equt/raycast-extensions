import { Billing } from "@components";
import { api, API, FixedSWRInfiniteKeyedMutator, update } from "@hooks";
import { Action, Icon, Keyboard, useNavigation } from "@raycast/api";
import { toast } from "@shared/utils";

type Props = Readonly<{
  billing: Billing.Type;
  mutate: FixedSWRInfiniteKeyedMutator<Array<API<Array<Billing.Type>>>>;
}>;

export default function EditBilling(props: Props) {
  const { billing, mutate } = props;

  const { pop } = useNavigation();

  return (
    <Action.Push
      title="Edit"
      icon={Icon.Pencil}
      shortcut={Keyboard.Shortcut.Common.Edit}
      target={
        <Billing.Form
          initial={{ ...billing }}
          onSubmit={(form) => {
            pop();

            toast(
              "updat",
              billing.name ?? "New Billing",
              mutate(
                api<Billing.Type>(`/billing/${billing.id}`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    id: billing.id,
                    name: form.name !== billing.name ? form.name : undefined,
                    time: form.time!.toISOString() !== billing.time ? form.time : undefined,
                    note: form.note !== billing.note ? form.note : undefined,
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
  );
}
