import { Color, Icon, List } from "@raycast/api";
import { Billing } from '@components'
import { API, SearchParams , FixedSWRInfiniteKeyedMutator, usePaginationAPI } from "@hooks";
import { formatDate } from "date-fns";
import { date, group, renderDate } from "@shared/utils";

type Props = Readonly<
  Partial<{
    size: number;
    listProps: (mutate: FixedSWRInfiniteKeyedMutator<Array<API<Array<Billing.Type>>>>) => Omit<List.Props, "throttle" | "pagination" | "isLoading">;
    itemProps: (
      billing: Billing.Type,
      mutate: FixedSWRInfiniteKeyedMutator<Array<API<Array<Billing.Type>>>>,
    ) => Omit<List.Item.Props, "icon" | "title" | "subtitle">;
    params: SearchParams | null;
    defaultTitle: string;
  }>
>;

export default function (props?: Props) {
  const { params, size, listProps, itemProps, defaultTitle = "New Billing" } = props ?? {};

  const { data, mutate, pagination, isLoading } = usePaginationAPI<Billing.Type>("/billing", {
    params,
    size,
  });

  return (
    <List throttle pagination={pagination} isLoading={isLoading} {...listProps?.(mutate)}>
      {Object.values(group(data ?? [], date)).map((billings, i) => (
        <List.Section key={i} title={renderDate(billings[0])}>
          {billings.map((billing) => {
            const props = itemProps?.(billing, mutate);

            return (
              <List.Item
                key={billing.id}
                icon={{
                  source: billing.valid ? Icon.Checkmark : Icon.Xmark,
                  tintColor: billing.valid ? Color.Green : Color.Red,
                }}
                title={billing.name ?? defaultTitle}
                subtitle={billing.note ?? undefined}
                {...props}
                accessories={[
                  ...(props?.accessories ?? []),
                  {
                    text: formatDate(new Date(billing.time), "HH:mm"),
                  },
                ]}
              />
            );
          })}
        </List.Section>
      ))}
    </List>
  );
}
