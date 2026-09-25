import { thaiAdministrativeAreas } from '../data/thaiAdministrativeAreas.js';

const { provinces, districts, subdistricts } = thaiAdministrativeAreas;
export const provinceOptions = provinces;
export function districtOptions(provinceId) { return districts.filter(([, parent]) => parent === Number(provinceId)); }
export function subdistrictOptions(districtId) { return subdistricts.filter(([, parent]) => parent === Number(districtId)); }
const provinceById = new Map(provinces.map(([id, name]) => [id, name]));
const districtById = new Map(districts.map(([id, parent, name]) => [id, { parent, name }]));
const subdistrictById = new Map(subdistricts.map(([id, parent, name]) => [id, { parent, name }]));

export const emptyThaiAddress = {
  addressHouseNo: '', addressVillageNo: '', addressExtra: '',
  addressProvinceId: null, addressDistrictId: null, addressSubdistrictId: null
};
export function structuredAddress(value = {}) {
  return {
    addressHouseNo: String(value.addressHouseNo || '').trim(),
    addressVillageNo: String(value.addressVillageNo || '').trim()
      .replace(/^(?:หมู่(?:ที่)?|ม\.)\s*/, '')
      .replace(/[๐-๙]/g, (digit) => String('๐๑๒๓๔๕๖๗๘๙'.indexOf(digit))),
    addressExtra: String(value.addressExtra || '').trim(),
    addressProvinceId: Number(value.addressProvinceId) || null,
    addressDistrictId: Number(value.addressDistrictId) || null,
    addressSubdistrictId: Number(value.addressSubdistrictId) || null
  };
}
export function validateThaiAddress(value = {}) {
  const a = structuredAddress(value);
  if (a.addressHouseNo.length > 40 || a.addressVillageNo.length > 20 || a.addressExtra.length > 200 ||
    (a.addressVillageNo && !/^[0-9]{1,3}$/.test(a.addressVillageNo)) ||
    /[\u0000-\u001f]/.test(a.addressHouseNo + a.addressVillageNo + a.addressExtra))
    throw Error('ข้อมูลที่อยู่ยาวเกินกำหนดหรือมีอักขระไม่ถูกต้อง');
  const supplied = Object.values(a).some(Boolean);
  if (!supplied) return a;
  if (!a.addressHouseNo || !a.addressProvinceId || !a.addressDistrictId || !a.addressSubdistrictId ||
    districtById.get(a.addressDistrictId)?.parent !== a.addressProvinceId ||
    subdistrictById.get(a.addressSubdistrictId)?.parent !== a.addressDistrictId)
    throw Error('กรุณาระบุบ้านเลขที่และเลือกจังหวัด อำเภอ ตำบลให้ครบและตรงกัน');
  return a;
}
export function formatThaiAddress(value = {}) {
  const a = validateThaiAddress(value);
  if (!a.addressProvinceId) return '';
  const bangkok = a.addressProvinceId === 1;
  return [a.addressHouseNo, a.addressVillageNo ? 'หมู่ ' + a.addressVillageNo : '',
    a.addressExtra, (bangkok ? 'แขวง' : 'ตำบล') + subdistrictById.get(a.addressSubdistrictId).name,
    (bangkok ? '' : 'อำเภอ') + districtById.get(a.addressDistrictId).name,
    provinceById.get(a.addressProvinceId)].filter(Boolean).join(' ');
}
const strip = (value, kind) => String(value || '').trim().replace(
  kind === 'province' ? /^(?:จังหวัด|จ\.)\s*/ :
  kind === 'district' ? /^(?:อำเภอ|อ\.|เขต)\s*/ :
  /^(?:ตำบล|ต\.|แขวง)\s*/, ''
).trim();
export function resolveThaiAreas(province, district, subdistrict) {
  const p = provinces.find(([, name]) => name === strip(province, 'province') ||
    (name === 'กรุงเทพมหานคร' && /^(กรุงเทพฯ|กทม\.)$/.test(strip(province, 'province'))));
  if (!p) return null;
  const d = districtOptions(p[0]).find(([, , name]) => strip(name, 'district') === strip(district, 'district'));
  if (!d) return null;
  const s = subdistrictOptions(d[0]).find(([, , name]) => strip(name, 'subdistrict') === strip(subdistrict, 'subdistrict'));
  return s ? { addressProvinceId: p[0], addressDistrictId: d[0], addressSubdistrictId: s[0] } : null;
}
function rawParts(raw) {
  const parts = raw.split('#').map((x) => x.trim());
  if (parts.length >= 8) return {
    houseNo: parts[0], villageNo: parts[1], extra: parts.slice(2, 5).filter(Boolean).join(' '),
    subdistrict: parts[5], district: parts[6], province: parts[7]
  };
  // Older card-reader apps flattened '#'. Match the three geographic names
  // from the end; return null for uncertain addresses instead of guessing.
  let rest = raw.trim();
  const take = (options, kind) => {
    const hits = options.filter((entry) => {
      const name = strip(entry[entry.length - 1], kind);
      return rest === name || rest === entry[entry.length - 1] ||
        rest.endsWith(' ' + name) || rest.endsWith(' ' + entry[entry.length - 1]) ||
        rest.endsWith(' ' + (kind === 'district' ? 'อำเภอ' : kind === 'subdistrict' ? 'ตำบล' : 'จังหวัด') + name);
    }).sort((a, b) => b[b.length - 1].length - a[a.length - 1].length);
    if (hits.length !== 1) return null;
    const name = hits[0][hits[0].length - 1];
    const index = rest.lastIndexOf(name);
    rest = rest.slice(0, index).trim().replace(/(?:จังหวัด|จ\.|อำเภอ|อ\.|ตำบล|ต\.|เขต|แขวง)$/, '').trim();
    return hits[0];
  };
  const p = take(provinces, 'province');
  if (!p) return null;
  const d = take(districtOptions(p[0]), 'district');
  if (!d) return null;
  const s = take(subdistrictOptions(d[0]), 'subdistrict');
  if (!s) return null;
  const match = rest.match(/^([^\s]+)(?:\s+(?:(?:หมู่(?:ที่)?|ม\.)\s*)?(\d{1,3}))?(?:\s+(.*))?$/);
  if (!match) return null;
  return { houseNo: match[1], villageNo: match[2] || '', extra: match[3] || '',
    province: p[1], district: d[2], subdistrict: s[2] };
}
export function addressFromCard(card) {
  const raw = String(card.card_address || '').trim();
  const explicit = ['address_house_no', 'address_village_no', 'address_subdistrict',
    'address_district', 'address_province'].some((key) => card[key]);
  const parts = explicit ? {
    houseNo: card.address_house_no, villageNo: card.address_village_no,
    extra: card.address_extra, subdistrict: card.address_subdistrict,
    district: card.address_district, province: card.address_province
  } : rawParts(raw);
  if (!parts) return { ...emptyThaiAddress, memberAddress: raw, addressNeedsReview: Boolean(raw) };
  const areas = resolveThaiAreas(parts.province, parts.district, parts.subdistrict);
  if (!areas) return { ...emptyThaiAddress, memberAddress: raw, addressNeedsReview: Boolean(raw) };
  const address = validateThaiAddress({ ...areas, addressHouseNo: parts.houseNo,
    addressVillageNo: parts.villageNo, addressExtra: parts.extra });
  return { ...address, memberAddress: raw || formatThaiAddress(address), addressNeedsReview: false };
}
