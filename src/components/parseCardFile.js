export function parseCardFile(text) {
  if (text.length > 200000) throw Error('ไฟล์ข้อมูลบัตรใหญ่เกินกำหนด');
  const card = JSON.parse(text);
  if (card?.format !== 'saributr-card-v1') throw Error('กรุณาใช้ไฟล์ JSON จากแอปอ่านบัตรรุ่น 1.4 ขึ้นไป');
  const citizenId = String(card.citizen_id || '').trim();
  if (!/^\d{13}$/.test(citizenId)) throw Error('เลขบัตรต้องมี 13 หลัก');
  const part = (key, limit) => {
    if (typeof card[key] !== 'string' && card[key] != null) throw Error('ข้อมูลบัตรไม่ถูกต้อง');
    const value = String(card[key] || '').trim();
    if (value.length > limit) throw Error('ข้อมูลบัตรยาวเกินกำหนด');
    return value;
  };
  const birthDate = part('birth_date', 10);
  if (birthDate && (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) ||
      !Number.isFinite(Date.parse(birthDate)) || new Date(birthDate).toISOString().slice(0, 10) !== birthDate)) throw Error('วันเกิดไม่ถูกต้อง');
  const photo = part('avatar_image', 100000);
  if (photo && !/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]*={0,2}$/.test(photo)) throw Error('รูปจากบัตรไม่ถูกต้อง');
  return { citizenId, birthDate, photo, fullName: [part('name_title', 100), part('first_name', 200), part('last_name', 200)].filter(Boolean).join(' '),
    fullNameEn: part('full_name_en', 200), memberAddress: part('card_address', 500) };
}
