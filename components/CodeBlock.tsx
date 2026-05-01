interface CodeBlockProps {
  value: unknown;
  language?: string;
}

function formatValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value, null, 2);
}

export function CodeBlock({ value, language = "json" }: CodeBlockProps) {
  return (
    <div className="code-frame">
      <div className="code-label">{language}</div>
      <pre className="code-block">
        <code>{formatValue(value)}</code>
      </pre>
    </div>
  );
}
