export default function BottomNav({ role, onLogout }) {
  return (
    <nav className="fixed bottom-0 w-full bg-blue-600 text-white p-3 text-center">
      {role === 'elder' ? 'Elder Navigation' : 'Youth Navigation'}
    </nav>
  );
}
