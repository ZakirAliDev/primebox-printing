"use client";

type ConfirmSubmitProps = {
  label: string;
  message: string;
  className?: string;
  name?: string;
  value?: string;
  form?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
};

export function ConfirmSubmit({
  label,
  message,
  className,
  name,
  value,
  form,
  formAction,
}: ConfirmSubmitProps) {
  return (
    <button
      type="submit"
      form={form}
      name={name}
      value={value}
      formAction={formAction}
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
