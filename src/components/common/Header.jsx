export default function Header({ role, onLogout, user }) {
  return (
    <header className="flex justify-between items-center p-4 bg-blue-600 text-white">
      <div>{role === 'elder' ? 'Elder Dashboard' : 'Youth Dashboard'}</div>
      <div>
        <span className="mr-4">{user?.username || 'User'}</span>
        <button onClick={onLogout} className="underline hover:text-gray-300">
          Logout
        </button>
      </div>
    </header>
  );
}
