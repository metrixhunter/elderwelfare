// /src/components/ui/button.jsx
export function Button({ children, onClick, className = "", ...props }) {
  return (
    <button
      onClick={onClick}
      className={`bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700 transition duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}