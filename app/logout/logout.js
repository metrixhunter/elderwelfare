/**
 * Robust logout utility:
 * - Clears all user/session data from sessionStorage, localStorage, and cookies
 * - Redirects to homepage ("/")
 */
export const logout = () => {
  // Clear relevant localStorage keys (customize as needed)
  localStorage.removeItem('user');
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('authToken');
  localStorage.removeItem('chamcha.json');

  // Clear sessionStorage
  sessionStorage.clear();

  // Clear all cookies (cross-browser safe)
  if (typeof document !== 'undefined') {
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name.trim() + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    });
  }

  // Redirect to the homepage after logout
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};





  

  
  
  