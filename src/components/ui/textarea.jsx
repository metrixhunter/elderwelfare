// /src/components/ui/textarea.jsx
export function Textarea({ value, onChange, placeholder = "", className = "", ...props }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full border rounded-xl p-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
      rows={4}
      {...props}
    />
  );
}
