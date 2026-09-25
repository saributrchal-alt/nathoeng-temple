import React from 'react';
import { provinceOptions, districtOptions, subdistrictOptions } from '../lib/thaiAddress.js';

export default function ThaiAddressFields({ value, onChange, lang = 'th', legacyAddress = '', disabled = false }) {
  const th = lang === 'th';
  const provinceId = Number(value.addressProvinceId) || 0;
  const districtId = Number(value.addressDistrictId) || 0;
  const subdistrictId = Number(value.addressSubdistrictId) || 0;
  const field = { display: 'grid', gap: 6, fontWeight: 700, fontSize: 14 };
  const input = { width: '100%', minHeight: 44, boxSizing: 'border-box', border: '1px solid #d8c9b5',
    borderRadius: 9, padding: '8px 11px', font: 'inherit', background: '#fff' };
  return <section aria-label={th ? 'ที่อยู่ในประเทศไทย' : 'Thai address'} style={{ display: 'grid', gap: 12, margin: '12px 0' }}>
    {legacyAddress && !provinceId && <p role="note" style={{ margin: 0, padding: 10, background: '#f7efe1', borderRadius: 8 }}>
      {th ? 'ที่อยู่เดิม (กรุณาเลือกพื้นที่ให้ครบก่อนบันทึกที่อยู่ใหม่): ' : 'Previous address (select areas to update): '}
      {legacyAddress}
    </p>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
      <label style={field}>{th ? 'บ้านเลขที่' : 'House number'}
        <input style={input} maxLength={40} value={value.addressHouseNo || ''} disabled={disabled}
          onChange={(e) => onChange({ addressHouseNo: e.target.value })} />
      </label>
      <label style={field}>{th ? 'หมู่ที่' : 'Village number'}
        <input style={input} maxLength={20} inputMode="numeric" value={value.addressVillageNo || ''} disabled={disabled}
          onChange={(e) => onChange({ addressVillageNo: e.target.value })} />
      </label>
    </div>
    <label style={field}>{th ? 'จังหวัด' : 'Province'}
      <select style={input} value={provinceId} disabled={disabled}
        onChange={(e) => onChange({ addressProvinceId: Number(e.target.value) || null,
          addressDistrictId: null, addressSubdistrictId: null })}>
        <option value="0">{th ? '— เลือกจังหวัด —' : '— Select province —'}</option>
        {provinceOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
      </select>
    </label>
    <label style={field}>{th ? 'อำเภอ / เขต' : 'District'}
      <select style={input} value={districtId} disabled={disabled || !provinceId}
        onChange={(e) => onChange({ addressDistrictId: Number(e.target.value) || null, addressSubdistrictId: null })}>
        <option value="0">{th ? '— เลือกอำเภอ / เขต —' : '— Select district —'}</option>
        {districtOptions(provinceId).map(([id, , name]) => <option key={id} value={id}>{name}</option>)}
      </select>
    </label>
    <label style={field}>{th ? 'ตำบล / แขวง' : 'Subdistrict'}
      <select style={input} value={subdistrictId} disabled={disabled || !districtId}
        onChange={(e) => onChange({ addressSubdistrictId: Number(e.target.value) || null })}>
        <option value="0">{th ? '— เลือกตำบล / แขวง —' : '— Select subdistrict —'}</option>
        {subdistrictOptions(districtId).map(([id, , name]) => <option key={id} value={id}>{name}</option>)}
      </select>
    </label>
    <label style={field}>{th ? 'รายละเอียดเพิ่มเติม เช่น หมู่บ้าน ซอย ถนน' : 'Village, lane or road (optional)'}
      <input style={input} maxLength={200} value={value.addressExtra || ''} disabled={disabled}
        onChange={(e) => onChange({ addressExtra: e.target.value })} />
    </label>
  </section>;
}
