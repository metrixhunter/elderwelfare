/**
 * Universal bank selection/override function.
 * Checks sessionStorage for 'bank' (the user's currently linked bank id).
 * If user selects the bank that matches session one, it's correct.
 * If not, override session bank to user's selected bank.
 *
 * @param {string} selectedBankId - The bank id the user just chose/clicked
 * @returns {boolean} wasCorrect - True if user chose the bank matching session, false if overridden
 */
export function selectOrOverrideBank(selectedBankId) {
  // Save user's selection to localStorage (temp before linking)
  localStorage.setItem('selectedBank', selectedBankId);

  // Get current sessionStorage bank (if any)
  const sessionBank = sessionStorage.getItem('bank');

  // If correct, do nothing
  if (sessionBank && sessionBank.toLowerCase() === selectedBankId.toLowerCase()) {
    return true; // correct choice
  }

  // If not correct, override sessionStorage bank to user's selected bank
  sessionStorage.setItem('bank', selectedBankId);

  return false; // was overridden
}