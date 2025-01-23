import { Action, ActionPanel, Form} from "@raycast/api";
import { Billing } from "@components";
import { isSome } from "@shared/utils";
import { FormValidation, useForm } from "@raycast/utils";

type Props = Readonly<
  Partial<{
    initial: Partial<Billing.Type>;
    onSubmit: (form: Form) => void;
  }>
>;

type Form = Readonly<{
  name: string;
  note: string;
  time: Date | null;
}>;

export default function (props?: Props) {
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
