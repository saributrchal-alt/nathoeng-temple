// The full member UUID becomes a 39-digit decimal number. The mapping is
// reversible, so numbers never collide and remain stable after profile edits.
export function memberNumber(memberId) {
  const id = String(memberId || '').trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return '';
  return BigInt(`0x${id.replaceAll('-', '')}`).toString(10).padStart(39, '0');
}

export function memberIdFromNumber(value) {
  const number = String(value || '').trim();
  if (!/^\d{39}$/.test(number)) return '';
  const decoded = BigInt(number);
  if (decoded >= (1n << 128n)) return '';
  const hex = decoded.toString(16).padStart(32, '0');
  const id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  return memberNumber(id) === number ? id : '';
}

export function completeShortMemberNumber(value) {
  const number = String(value || '').trim();
  if (!/^2\d{11,12}$/.test(number)) return '';
  let sum = 0;
  for (let index = 0; index < 12; index += 1)
    sum += Number(number[index]) * (index % 2 ? 3 : 1);
  const complete = number.slice(0, 12) + ((10 - sum % 10) % 10);
  return number.length === 12 || number === complete ? complete : '';
}

export function isValidShortMemberNumber(value) {
  const number = String(value || '').trim();
  return number.length === 13 && completeShortMemberNumber(number) === number;
}
