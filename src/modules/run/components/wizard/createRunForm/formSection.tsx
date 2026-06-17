import { type ReactNode } from "react";

export default function FormSection({ title, children }: { title: string; isFirst?: boolean; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="fs-5 mb-0">{title}</legend>
      {children}
    </fieldset>
  );
}
