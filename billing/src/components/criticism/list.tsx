import {  Color, Icon, List } from "@raycast/api";
import { Transaction, Criticism } from '@components'
import {  API, SearchParams, FixedSWRInfiniteKeyedMutator, usePaginationAPI } from "@hooks";

type Props = Readonly<{
  transaction: Transaction.Type;
  params?: SearchParams | null;
  listProps?: (
    mutate: FixedSWRInfiniteKeyedMutator<Array<API<Array<Criticism.Type>>>>,
  ) => Omit<List.Props, "throttle" | "pagination" | "isLoading">;
  itemProps?: (
    criticism: Criticism.Type,
    mutate: FixedSWRInfiniteKeyedMutator<Array<API<Array<Criticism.Type>>>>,
  ) => Omit<List.Item.Props, "icon" | "title" | "subtitle">;
}>;

export default function (props: Props) {
  const { transaction, params, listProps, itemProps } = props;

  const { data, mutate, pagination, isLoading } = usePaginationAPI<Criticism.Type>(
    `/transaction/${transaction.id}/criticism`,
    {
      params,
    },
  );

  return (
    <List throttle pagination={pagination} isLoading={isLoading} {...listProps?.(mutate)}>
      {data?.map((criticism) => {
        const props = itemProps?.(criticism, mutate) ?? {};
        return (
          <List.Item
            key={criticism.id}
            title={criticism.text}
            icon={{
              source: {
                [Criticism.Attitude.Positive]: Icon.ThumbsUp,
                [Criticism.Attitude.Negative]: Icon.ThumbsDown,
              }[criticism.attitude],
              tintColor: {
                [Criticism.Attitude.Positive]: Color.Green,
                [Criticism.Attitude.Negative]: Color.Red,
              }[criticism.attitude],
            }}
            {...props}
            accessories={[
              ...(props.accessories ?? []),
              {
                date: new Date(criticism.time),
              },
            ]}
          />
        );
      })}
    </List>
  );
}
