import { Billing } from "@components";
import { api, API, FixedSWRInfiniteKeyedMutator } from "@hooks";
import { Action, Icon, Keyboard } from "@raycast/api";
import { toast } from "@shared/utils";

type Props = Readonly<{
  billing: Billing.Type;
  mutate: FixedSWRInfiniteKeyedMutator<Array<API<Array<Billing.Type>>>>;
}>;

export default function (props: Props) {
  const { billing, mutate } = props;

  return (
    <Action
      title="Delete"
      icon={Icon.Trash}
      shortcut={Keyboard.Shortcut.Common.Remove}
      onAction={() =>
        toast(
          "delet",
          billing.name ?? "New Billing",
          mutate(
            api<Billing.Type>(`/billing/${billing.id}`, {
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
  );
}
