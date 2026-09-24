export function normalizeIdentityNumber(value) {
  return String(value || '').trim().toUpperCase().replace(/[\s-]+/g, '');
}

export function isValidIdentityNumber(value) {
  if (/^\d{13}$/.test(value)) return true;
  return /^[A-Z0-9]{5,20}$/.test(value);
}

export function hasCompleteDonationIdentity(member) {
  // Card registrations already have these fields, even without the legacy
  // donation_profile_completed_at timestamp from the first-donation form.
  return Boolean(
    String(member?.full_name || '').trim() &&
    isValidIdentityNumber(normalizeIdentityNumber(member?.tax_id))
  );
}
