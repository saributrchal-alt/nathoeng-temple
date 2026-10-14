import test from 'node:test';
import assert from 'node:assert/strict';
import { handleWalkinMemberRequest } from '../lib/_walkin-members.js';
import { createSessionToken } from '../lib/_auth.js';

const base = {action:'register',registrationDetails:true,fullName:'Synthetic Member',fullNameEn:'Synthetic English',
  citizenId:'1234567890123',birthDate:'2000-01-01',countryCode:'TH',picture:'',username:'synthetic.member',
  password:'synthetic password 123',memberAddress:'',addressHouseNo:'1/2',addressVillageNo:'1',addressExtra:'Test Lane',
  addressProvinceId:1,addressDistrictId:1001,addressSubdistrictId:100101};

test('full registration sends every field in one RPC; rejects invalid and unreviewed evidence before writing', async () => {
  const keys=['SUPABASE_URL','SUPABASE_SECRET_KEY','SESSION_SECRET','MEDIA_PRIVATE_ENABLED'];
  const previous=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
  Object.assign(process.env,{SUPABASE_URL:'https://synthetic.example',SUPABASE_SECRET_KEY:'test-only-key',
    SESSION_SECRET:'test-only-session-secret',MEDIA_PRIVATE_ENABLED:'false'});
  const oldFetch=globalThis.fetch; const calls=[]; let rpcError=null; let existingMemberCandidates=[];
  globalThis.fetch=async(url,options={})=>{
    calls.push({url:String(url),body:options.body?JSON.parse(options.body):null});
    if(String(url).includes('/rest/v1/members?birth_date='))
      return new Response(JSON.stringify(existingMemberCandidates));
    if(String(url).includes('/rest/v1/members?tax_id='))
      return new Response(JSON.stringify([]));
    if(rpcError && String(url).includes('/rpc/'))
      return new Response(JSON.stringify(rpcError),{status:404});
    return new Response(JSON.stringify('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'));
  };
  const token=createSessionToken({memberId:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',role:'admin'});
  async function submit(body,cookie=token) {
    const res={setHeader(){},status(n){this.statusCode=n;return this;},json(data){this.data=data;return this;}};
    await handleWalkinMemberRequest({method:'POST',url:'/api/donation-profile',headers:{cookie:cookie?`nathoeng_session=${cookie}`:''},body},res);
    return res;
  }
  try {
    const res=await submit(base); assert.equal(res.statusCode,201); assert.equal(calls.length,2);
    assert.ok(calls[1].url.endsWith('/rpc/register_walkin_member_full'));
    const p=calls[1].body.p_data;
    assert.equal(p.p_full_name_en,base.fullNameEn); assert.equal(p.p_address_house_no,'1/2');
    assert.equal(p.p_address_subdistrict_id,100101); assert.equal(p.p_country_code,'TH');
    assert.match(p.p_member_address,/1\/2/); assert.match(p.p_password_hash,/^[0-9a-f]{128}$/);
    assert.equal(calls[0].body.p_card_reviewed,false);
    calls.length=0;
    const evidence={citizenId:base.citizenId,fullName:base.fullName,birthDate:base.birthDate};
    assert.equal((await submit({...base,cardReviewed:true,cardEvidence:evidence})).statusCode,201);
    assert.equal(calls[1].body.p_card_reviewed,true);
    for(const patch of [{countryCode:'BAD'},{fullNameEn:'x'.repeat(201)},{addressDistrictId:9999},
      {birthDate:'2025-02-30'},{cardReviewed:true,cardEvidence:{...evidence,fullName:'Different Person'}}]) {
      calls.length=0; assert.equal((await submit({...base,...patch})).statusCode,400); assert.equal(calls.length,0);
    }
    calls.length=0; assert.equal((await submit(base,'')).statusCode,403); assert.equal(calls.length,0);
    // A card with a new citizen ID must not create an account when a previous
    // LINE account has the same normalized name and birth date.
    existingMemberCandidates=[{
      id:'dddddddd-dddd-dddd-dddd-dddddddddddd',
      full_name:'ด.ช. Synthetic Member',display_name:'Synthetic Member',
      membership_status:'active',line_uid:'line-synthetic',tax_id:null
    }];
    calls.length=0;
    const duplicate=await submit(base);
    assert.equal(duplicate.statusCode,409);
    assert.equal(duplicate.data.code,'EXISTING_MEMBER_REVIEW_REQUIRED');
    assert.ok(!calls.some(c=>c.url.includes('/rpc/')));
    calls.length=0;
    const cardLookup=await submit({...base,action:'lookup',fullName:base.fullName});
    assert.equal(cardLookup.statusCode,200);
    assert.equal(cardLookup.data.member,null);
    assert.equal(cardLookup.data.possibleMatches.length,1);
    existingMemberCandidates=[];
    calls.length=0;
    rpcError={code:'PGRST202',message:'missing function'};
    const unavailable=await submit(base); assert.equal(unavailable.statusCode,503); assert.match(unavailable.data.message,/walkin-member-full-registration.sql/);
    rpcError=null; calls.length=0;
    const foreign=await submit({...base,citizenId:'AB123456',countryCode:'GB',memberAddress:'London'});
    assert.equal(foreign.statusCode,201); assert.equal(calls[1].body.p_data.p_address_province_id,null);
    assert.equal(calls[1].body.p_data.p_citizen_id,'AB123456'); assert.equal(calls[1].body.p_data.p_member_address,'London');
    calls.length=0; const legacy={...base,registrationDetails:false};
    assert.equal((await submit(legacy)).statusCode,201); assert.ok(calls[1].url.endsWith('/rpc/register_walkin_member'));
  } finally {
    globalThis.fetch=oldFetch;
    for(const key of keys) if(previous[key]===undefined) delete process.env[key]; else process.env[key]=previous[key];
  }
});
