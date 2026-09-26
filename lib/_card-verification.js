// This records an administrator's review of imported card data, not government authentication.
export function reviewedCardMatches(body, identityNumber, fullName, birthDate) {
  if (body.cardReviewed !== true || !body.cardEvidence) return false;
  const card = body.cardEvidence;
  const name = (value) => String(value || '').trim().replace(/\s+/g, ' ');
  return /^\d{13}$/.test(identityNumber) && card.citizenId === identityNumber
    && name(card.fullName) === name(fullName)
    && String(card.birthDate || '') === String(birthDate || '');
}
