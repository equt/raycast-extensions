import { Transaction } from "@components";
import { useAPI } from "@hooks";
import { Action, ActionPanel, Form, Icon } from "@raycast/api";
import { FormValidation, useForm } from "@raycast/utils";
import { isNone, isSome } from "@shared/utils";

type Props = Readonly<
  Partial<{
    filters: ReadonlyArray<Transaction.Filter>;
    initial: Partial<Form>;
    onSubmit: (form: Form) => void;
  }>
>;

type Form = Readonly<{
  icon: string;
  name: string;
  aggregation: Transaction.Aggregation;
  account_id?: Array<string>;
  peer_account_id?: Array<string>;
  "not:account_id"?: Array<string>;
  "not:peer_account_id"?: Array<string>;
  start?: Date;
  end?: Date;
}>;

export default function (props?: Props) {
  const { filters, initial, onSubmit } = props ?? {};

  const { data: accounts } = useAPI<Array<Transaction.Account>>("/account");

  const { itemProps, handleSubmit } = useForm<{
    icon: string;
    name: string;
    aggregation_type: string;
    account_id?: Array<string>;
    peer_account_id?: Array<string>;
    "not:account_id"?: Array<string>;
    "not:peer_account_id"?: Array<string>;
    start: Date | null;
    end: Date | null;
  }>({
    initialValues: {
      ...initial,
    },
    onSubmit: ({ aggregation_type, ...form }) => {
      onSubmit?.({
        ...form,
        account_id: form.account_id?.length === 0 ? undefined : form.account_id,
        peer_account_id: form.peer_account_id?.length === 0 ? undefined : form.peer_account_id,
        "not:account_id": form["not:account_id"]?.length === 0 ? undefined : form["not:account_id"],
        "not:peer_account_id": form["not:peer_account_id"]?.length === 0 ? undefined : form["not:peer_account_id"],
        aggregation: {
          type: aggregation_type as Transaction.AggregationType,
        },
        start: form.start ?? undefined,
        end: form.end ?? undefined,
      });
    },
    validation: {
      icon: FormValidation.Required,
      name(value) {
        if (isNone(value)) return 'The item is required'
        if (filters?.some(({ name }) => name === value)) return 'The item already exists'
      },
    },
  });

  return (
    <Form
      navigationTitle={isSome(initial?.name) ? `Edit ${initial.name}` : "Create Filter"}
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description title="General" text="Describe transactions filter for future reference" />
      <Form.Dropdown title="Icon" {...itemProps.icon}>
        {Object.entries(Icon).map(([name, key], i) => (
          <Form.Dropdown.Item key={i} title={name} icon={String(key)} value={key} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown title="Aggregation" {...itemProps.aggregation_type}>
        <Form.Dropdown.Item icon={Icon.Plus} title="Sum" value={Transaction.AggregationType.Sum} />
        <Form.Dropdown.Item icon={Icon.Tag} title="Unit Price" value={Transaction.AggregationType.UnitPrice} />
      </Form.Dropdown>
      <Form.TextField title="Name" {...itemProps.name} />
      <Form.Separator />
      <Form.Description title="Accounts" text="Filter transactions according to their accounts" />
      <Form.TagPicker title="Include Accounts" {...itemProps.account_id}>
        {(accounts ?? []).map((account) => (
          <Form.TagPicker.Item
            key={account.id}
            title={`${account.name}(${Transaction.Currency[account.currency]})`}
            value={account.id}
          />
        ))}
      </Form.TagPicker>
      <Form.TagPicker title="Include Peer Accounts" {...itemProps.peer_account_id}>
        {(accounts ?? []).map((account) => (
          <Form.TagPicker.Item
            key={account.id}
            title={`${account.name}(${Transaction.Currency[account.currency]})`}
            value={account.id}
          />
        ))}
      </Form.TagPicker>
      <Form.TagPicker title="Exclude Accounts" {...itemProps["not:account_id"]}>
        {(accounts ?? []).map((account) => (
          <Form.TagPicker.Item
            key={account.id}
            title={`${account.name}(${Transaction.Currency[account.currency]})`}
            value={account.id}
          />
        ))}
      </Form.TagPicker>
      <Form.TagPicker title="Exclude Peer Accounts" {...itemProps["not:peer_account_id"]}>
        {(accounts ?? []).map((account) => (
          <Form.TagPicker.Item
            key={account.id}
            title={`${account.name}(${Transaction.Currency[account.currency]})`}
            value={account.id}
          />
        ))}
      </Form.TagPicker>
      <Form.Separator />
      <Form.Description title="Time" text="Filter transactions according to their time" />
      <Form.DatePicker title="Start" {...itemProps.start} />
      <Form.DatePicker title="End" {...itemProps.end} />
    </Form>
  );
}
