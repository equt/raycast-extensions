import { Form, ActionPanel, Action } from "@raycast/api";
import { Transaction, Billing } from '@components'
import { useAPI } from "@hooks";
import { isSome } from "@shared/utils";
import { FormValidation, useForm } from "@raycast/utils";

type TransactionFormProps = Readonly<
  Partial<{
    billing: Partial<Billing.Type>;
    initial: Partial<Transaction.Type>;
    onSubmit: (form: Form) => void;
  }>
>;

type Form = Readonly<{
  account_id: string;
  type: Transaction.TransactionType;
}>;

export default function TransactionForm(props?: TransactionFormProps) {
  const { initial, billing, onSubmit = () => void 0 } = props ?? {};

  const { itemProps, handleSubmit } = useForm<Form>({
    initialValues: {
      account_id: initial?.account?.id ?? "",
      type: initial?.type ?? Transaction.TransactionType.Credit,
    },
    onSubmit,
    validation: {
      account_id: FormValidation.Required,
      type: FormValidation.Required,
    },
  });

  const { data: accounts } = useAPI<Array<Transaction.Account>>("/account");

  return (
    <Form
      navigationTitle={
        isSome(initial?.id)
          ? `Edit ${initial?.name ?? "Transaction"} for ${billing?.name ?? "New Billing"}`
          : `Create New Transaction for ${billing?.name ?? "New Billing"}`
      }
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Dropdown title="Account" {...itemProps.account_id}>
        {(accounts ?? []).map((account) => (
          <Form.Dropdown.Item
            key={account.id}
            title={`${account.name} (${Transaction.Currency[account.currency]})`}
            value={account.id}
          />
        ))}
      </Form.Dropdown>
    </Form>
  );
}
