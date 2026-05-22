import type { AdminNavSection } from "@/lib/admin/content";

interface TextFieldProps {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}

interface TextAreaFieldProps extends TextFieldProps {
  rows?: number;
  monospace?: boolean;
}

export function AdminTextField({ label, name, defaultValue, required, placeholder }: TextFieldProps) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input name={name} defaultValue={defaultValue} required={required} placeholder={placeholder} />
    </label>
  );
}

export function AdminTextAreaField({
  label,
  name,
  defaultValue,
  required,
  placeholder,
  rows = 8,
  monospace = false,
}: TextAreaFieldProps) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <textarea
        className={monospace ? "admin-textarea-mono" : undefined}
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        rows={rows}
      />
    </label>
  );
}

export function SectionSelect({
  sections,
  name = "sectionId",
  label = "Navigation section",
}: {
  sections: AdminNavSection[];
  name?: string;
  label?: string;
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <select name={name} required>
        {sections.map((section) => (
          <option value={section.id} key={section.id}>
            {"- ".repeat(section.depth)}
            {section.label}
          </option>
        ))}
      </select>
    </label>
  );
}
