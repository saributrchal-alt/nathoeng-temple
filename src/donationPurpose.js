export const KATHIN_2569 = 'kathin_2569';
export const KATHIN_2569_RECORD = 'ทำบุญในงานกฐิน 2569';

export function kathin2569Label(lang) {
  return lang === 'th' ? KATHIN_2569_RECORD : 'Kathina Offering 2026';
}

export function isKathin2569Donation(item) {
  return item?.purpose === 'custom' &&
    String(item?.custom_purpose || '').trim() === KATHIN_2569_RECORD;
}

export function purposeForForm(item) {
  return isKathin2569Donation(item) ? KATHIN_2569 : item?.purpose || 'general';
}

export function purposeForSave(purpose, customPurpose) {
  return {
    purpose: purpose === KATHIN_2569 ? 'custom' : purpose,
    customPurpose: purpose === KATHIN_2569
      ? KATHIN_2569_RECORD
      : purpose === 'custom' ? String(customPurpose || '').trim() : null
  };
}
