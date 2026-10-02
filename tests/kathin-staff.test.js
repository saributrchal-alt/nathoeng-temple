import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { test } from 'node:test';
import adminBookings from '../api/admin-bookings.js';
import lineLogin from '../api/line-login.js';
import { createSessionToken } from '../lib/_auth.js';

async function run({ role='admin', actorRole=role, actorStatus='active', targetStatus='active', targetExists=true,
  active=true, department='kathin', method='POST', route='assign-department', failWrite=false, staff=true, acting=false, body={} }={}) {
  const keys=['SESSION_SECRET','SUPABASE_URL','SUPABASE_SECRET_KEY','ACCOUNT_BRIDGE_KEY'];
  const saved=Object.fromEntries(keys.map(key=>[key,process.env[key]]));const original=global.fetch;
  Object.assign(process.env,{SESSION_SECRET:'test-temple-secret',SUPABASE_URL:'https://example.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_test',ACCOUNT_BRIDGE_KEY:'test-account-secret'});
  const calls=[];
  global.fetch=async(url,options={})=>{
    calls.push({url,options});let rows=[];
    if(url.includes('account.nathoeng.com')) rows={success:true,item:{member_id:'target'}};
    else if(url.includes('/members?')) rows=url.includes('id=eq.actor') ? [{id:'actor',role:actorRole,membership_status:actorStatus}]
      : url.includes('id=eq.target') ? (targetExists ? [{id:'target',full_name:'สมาชิกทดสอบ',membership_status:targetStatus}] : [])
      : [{id:'target',full_name:'สมาชิกทดสอบ',tax_id:'synthetic-private'}];
    else if(url.includes('kathin_drink_staff')) rows=staff ? [{member_id:route==='kathin-access'?'actor':'target'}] : [];
    const ok=!(failWrite && ['POST','PATCH'].includes(options.method));
    return {ok,status:ok?200:503,text:async()=>JSON.stringify(rows),json:async()=>rows};
  };
  const res={headers:{},statusCode:200,setHeader(key,value){this.headers[key]=value;},status(code){this.statusCode=code;return this;},json(value){this.body=value;return this;},end(){return this;}};
  try {
    const token=createSessionToken({memberId:'actor',role,actingAdminId:acting?'admin':undefined});
    await (route==='kathin-access'?lineLogin:adminBookings)({method,query:{route,memberId:'target'},body:{memberId:'target',department,active,...body},headers:{cookie:'nathoeng_session='+token},url:'/api/'+(route==='kathin-access'?'line-login':'admin-bookings')+'?route='+route},res);
    return {res,calls};
  } finally {global.fetch=original;for(const key of keys)if(saved[key]===undefined)delete process.env[key];else process.env[key]=saved[key];}
}

test('only a currently active admin may assign Kathin Staff',async()=>{
  const member=await run({role:'member'});assert.equal(member.res.statusCode,403);assert.equal(member.calls.length,0);
  for(const options of [{actorRole:'member'},{actorStatus:'cancelled'}]){
    const {res,calls}=await run(options);assert.equal(res.statusCode,403);assert.ok(!calls.some(call=>call.options.method==='POST'));
  }
});
test('assignment is an idempotent staff upsert attributed to the signed admin',async()=>{
  const {res,calls}=await run({body:{assigned_by:'forged',actorId:'forged',role:'admin'}});
  assert.equal(res.statusCode,200);assert.equal(res.body.staff.active,true);
  const write=calls.find(call=>call.options.method==='POST');
  assert.match(write.url,/kathin_drink_staff\?on_conflict=member_id$/);
  assert.deepEqual(JSON.parse(write.options.body),{member_id:'target',assigned_by:'actor',active:true});
  assert.equal(write.options.headers.Authorization,undefined);
  assert.ok(!calls.some(call=>call.options.method==='PATCH' && call.url.includes('/members?')));
});
test('revocation affects only the selected staff record and reports write failures',async()=>{
  const {res,calls}=await run({active:false});assert.equal(res.statusCode,200);assert.equal(res.body.staff.active,false);
  const patch=calls.find(call=>call.options.method==='PATCH');assert.match(patch.url,/kathin_drink_staff\?member_id=eq.target$/);
  assert.deepEqual(JSON.parse(patch.options.body),{active:false});
  assert.equal((await run({failWrite:true})).res.statusCode,503);
});
test('invalid, missing and cancelled targets cannot receive staff authority',async()=>{
  assert.equal((await run({method:'GET'})).res.statusCode,405);
  assert.equal((await run({active:'true'})).res.statusCode,400);
  assert.equal((await run({body:{memberId:'target&active=eq.true'}})).res.statusCode,400);
  assert.equal((await run({targetExists:false})).res.statusCode,404);
  assert.equal((await run({targetStatus:'cancelled'})).res.statusCode,409);
  assert.equal((await run({targetStatus:'cancelled',active:false})).res.statusCode,200);
});
test('member lists show assigned staff without exposing the identity number',async()=>{
  const {res}=await run({method:'GET',route:'members'});assert.equal(res.statusCode,200);
  assert.equal(res.body.members[0].kathin_staff,true);assert.equal(res.body.members[0].tax_id,undefined);
});
test('staff access uses the signed member, ignores supplied target IDs and rejects acting sessions',async()=>{
  const {res,calls}=await run({role:'member',method:'GET',route:'kathin-access'});
  assert.equal(res.statusCode,200);assert.equal(res.body.staff,true);assert.equal(res.body.admin,false);
  assert.ok(calls.every(call=>!call.url.includes('id=eq.target')));
  assert.equal((await run({role:'member',method:'GET',route:'kathin-access',staff:false})).res.body.staff,false);
  assert.equal((await run({role:'member',method:'GET',route:'kathin-access',actorStatus:'cancelled'})).res.statusCode,403);
  assert.equal((await run({role:'member',method:'GET',route:'kathin-access',acting:true})).res.statusCode,401);
});
test('Accounting assignment retains its signed import and preparer/reviewer roles',async()=>{
  const {res,calls}=await run({department:'account',body:{canPrepare:false,canReview:true}});assert.equal(res.statusCode,200);
  const relay=calls.find(call=>call.url.includes('account.nathoeng.com'));
  assert.deepEqual(JSON.parse(relay.options.body),{member_id:'target',member_name:'สมาชิกทดสอบ',can_prepare:false,can_review:true});
  assert.equal(relay.options.headers['X-Account-Signature'],crypto.createHmac('sha256','test-account-secret').update(relay.options.body).digest('hex'));
});
