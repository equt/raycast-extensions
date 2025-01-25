import { Transaction } from "@components";
import { Action, Icon, Keyboard } from "@raycast/api";

type Props = {
  filters: ReadonlyArray<Transaction.Filter>;
  setFilters: (filters: Array<Transaction.Filter>) => void;
};

export default function (props: Props) {
  const { filters, setFilters } = props;

  return (
    <Action.Push
      title="Create"
      icon={Icon.Plus}
      shortcut={Keyboard.Shortcut.Common.New}
      target={
        <Transaction.Filter
          filters={filters}
          onSubmit={({ name, icon, aggregation, ...params }) => {
            setFilters([
              ...filters,
              {
                name: name,
                icon: icon as Icon,
                aggregation: aggregation,
                params: {
                  ...params,
                  start: params.start?.toISOString(),
                  end: params.end?.toISOString(),
                },
              },
            ]);
          }}
        />
      }
    />
  );
}
