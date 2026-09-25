// The full member UUID becomes a 39-digit decimal number. The mapping is
// reversible, so numbers never collide and remain stable after profile edits.
export function memberNumber(memberId) {
  const id = String(memberId || '').trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return '';
  return BigInt(`0x${id.replaceAll('-', '')}`).toString(10).padStart(39, '0');
}
