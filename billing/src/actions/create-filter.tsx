import { Transaction } from "@components";
import { Action, Icon, Keyboard, useNavigation } from "@raycast/api";

type Props = {
  filters: ReadonlyArray<Transaction.Filter>;
  setFilters: (filters: Array<Transaction.Filter>) => void;
  setCurrentFilterName: (name: string) => void;
};

export default function (props: Props) {
  const { filters, setFilters, setCurrentFilterName } = props;

  const { pop } = useNavigation();

  return (
    <Action.Push
      title="Create"
      icon={Icon.Plus}
      shortcut={Keyboard.Shortcut.Common.New}
      target={
        <Transaction.Filter
          filters={filters}
          onSubmit={({ name, icon, aggregation, ...params }) => {
            pop();

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
            setCurrentFilterName(name);
          }}
        />
      }
    />
  );
}
