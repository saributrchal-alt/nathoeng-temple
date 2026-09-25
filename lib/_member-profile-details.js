// Private member fields are only read with the server's service role key.
export async function getMemberProfileDetails(url, key, memberId) {
  const response = await fetch(`${url}/rest/v1/member_profile_details?member_id=eq.${encodeURIComponent(memberId)}&select=full_name_en,member_address&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store'
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (error.code === 'PGRST205' || error.code === '42P01')
      return { available: false, fullNameEn: '', memberAddress: '' };
    throw Error(`Member details lookup failed: ${error.code || response.status}`);
  }
  const [row] = await response.json();
  return { available: true, fullNameEn: row?.full_name_en || '', memberAddress: row?.member_address || '' };
}
