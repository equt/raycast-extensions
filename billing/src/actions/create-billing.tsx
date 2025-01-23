import { Billing } from "@components";
import { api, API, FixedSWRInfiniteKeyedMutator, update } from "@hooks";
import { Action, Icon, Keyboard, useNavigation } from "@raycast/api";
import { toast } from "@shared/utils";

type Props = {
  mutate: FixedSWRInfiniteKeyedMutator<Array<API<Array<Billing.Type>>>>;
};

export default function (props: Props) {
  const { mutate } = props;

  const { pop } = useNavigation();

  return (
    <Action.Push
      title="Create"
      icon={Icon.Plus}
      shortcut={Keyboard.Shortcut.Common.New}
      target={
        <Billing.Form
          initial={{ time: new Date().toISOString() }}
          onSubmit={(form) => {
            pop();

            toast(
              "creat",
              form.name ?? "New Billing",
              mutate(
                api<Billing.Type>("/billing", {
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
                      (billing) => [{ id: "NEW", valid: false, ...form, time: form.time!.toISOString() }, billing],
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
  );
}
