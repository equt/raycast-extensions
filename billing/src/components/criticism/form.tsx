import { Action, ActionPanel, Form } from "@raycast/api";
import { Criticism } from "@components";
import { FormValidation, useForm } from "@raycast/utils";
import { isSome } from "@shared/utils";

type Props = Readonly<
  Partial<{
    initial: Partial<Criticism.Type>;
    onSubmit: (form: Form) => void;
  }>
>;

type Form = Readonly<{
  text: string;
  attitude: Criticism.Attitude;
}>;

export default function (props?: Props) {
  const { initial, onSubmit } = props ?? {};

  const { itemProps, handleSubmit } = useForm<{
    text: string;
    attitude: string;
  }>({
    initialValues: {
      text: initial?.text ?? "",
      attitude: initial?.attitude?.toString() ?? Criticism.Attitude.Negative.toString(),
    },
    onSubmit(form) {
      onSubmit?.({
        text: form.text,
        attitude: parseInt(form.attitude),
      });
    },
    validation: {
      attitude: FormValidation.Required,
      text: FormValidation.Required,
    },
  });

  return (
    <Form
      navigationTitle={isSome(initial?.id) ? `Edit Criticism` : "Create New Criticism"}
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea title="Text" {...itemProps.text} />
      <Form.Dropdown title="Attitude" {...itemProps.attitude}>
        <Form.Dropdown.Item title="Positive" value={Criticism.Attitude.Positive.toString()} />
        <Form.Dropdown.Item title="Negative" value={Criticism.Attitude.Negative.toString()} />
      </Form.Dropdown>
    </Form>
  );
}
