import { Action, ActionPanel, Color, Form, Icon, List } from "@raycast/api";
import { FixedSWRInfiniteKeyedMutator, usePaginationAPI } from "../hooks/useAPI";
import { API, Billing, SearchParams } from "../shared/types";
import { formatDate } from "date-fns";
import { date, group, isSome, renderDate } from "../shared/utils";
import { FormValidation, useForm } from "@raycast/utils";

type BillingFormProps = Readonly<
  Partial<{
    initial: Partial<Billing>;
    onSubmit: (form: Form) => void;
  }>
>;

type Form = Readonly<{
  name: string;
  note: string;
  time: Date | null;
}>;

export function BillingForm(props?: BillingFormProps) {
  const { initial, onSubmit = () => void 0 } = props ?? {};

  const { itemProps, handleSubmit } = useForm<Form>({
    initialValues: {
      name: initial?.name ?? "",
      note: initial?.note ?? "",
      time: initial?.time ? new Date(initial.time) : null,
    },
    onSubmit,
    validation: {
      time: FormValidation.Required,
    },
  });

  return (
    <Form
      navigationTitle={isSome(initial?.id) ? `Edit ${initial?.name ?? "Billing"}` : "Create New Billing"}
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField title="Name" {...itemProps.name} />
      <Form.TextArea title="Note" {...itemProps.note} />
      <Form.DatePicker title="Time" {...itemProps.time} />
    </Form>
  );
}

type BillingListProps = Readonly<
  Partial<{
    size: number;
    listProps: Omit<List.Props, "throttle" | "pagination" | "isLoading">;
    itemProps: (
      billing: Billing,
      mutate: FixedSWRInfiniteKeyedMutator<Array<API<Array<Billing>>>>,
    ) => Omit<List.Item.Props, "icon" | "title" | "subtitle">;
    params: SearchParams | null;
    defaultTitle: string;
  }>
>;

export function BillingList(props?: BillingListProps) {
  const { params, size, listProps, itemProps, defaultTitle = "New Billing" } = props ?? {};

  const { data, mutate, pagination, isLoading } = usePaginationAPI<Billing>("/billing", {
    params,
    size,
  });

  return (
    <List throttle pagination={pagination} isLoading={isLoading} {...listProps}>
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
