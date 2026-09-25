// Private member fields are only read with the server's service role key.
export async function getMemberProfileDetails(url, key, memberId) {
  const base = `${url}/rest/v1/member_profile_details?member_id=eq.${encodeURIComponent(memberId)}&select=`;
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const structured = 'full_name_en,member_address,address_house_no,address_village_no,address_extra,address_province_id,address_district_id,address_subdistrict_id';
  let response = await fetch(base + structured + '&limit=1', { headers, cache: 'no-store' });
  let error = response.ok ? null : await response.json().catch(() => ({}));
  if (error?.code === '42703' || error?.code === 'PGRST204') {
    response = await fetch(base + 'full_name_en,member_address&limit=1', { headers, cache: 'no-store' });
    error = response.ok ? null : await response.json().catch(() => ({}));
    if (response.ok) {
      const [row] = await response.json();
      return { available: true, structuredAvailable: false,
        fullNameEn: row?.full_name_en || '', memberAddress: row?.member_address || '' };
    }
  }
  if (!response.ok) {
    if (error?.code === 'PGRST205' || error?.code === '42P01')
      return { available: false, structuredAvailable: false, fullNameEn: '', memberAddress: '' };
    throw Error(`Member details lookup failed: ${error?.code || response.status}`);
  }
  const [row] = await response.json();
  return { available: true, structuredAvailable: true,
    fullNameEn: row?.full_name_en || '', memberAddress: row?.member_address || '',
    addressHouseNo: row?.address_house_no || '', addressVillageNo: row?.address_village_no || '',
    addressExtra: row?.address_extra || '', addressProvinceId: row?.address_province_id || null,
    addressDistrictId: row?.address_district_id || null,
    addressSubdistrictId: row?.address_subdistrict_id || null };
}
