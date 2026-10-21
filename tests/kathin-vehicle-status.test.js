import assert from 'node:assert/strict';
import { test } from 'node:test';
import handler from '../api/my-bookings.js';
import { createSessionToken } from '../lib/_auth.js';
const open='11111111-1111-4111-8111-111111111111';
const closed='22222222-2222-4222-8222-222222222222';
async function run({role='admin',dbRole=role,method='GET',route='kathin-trip',body={},fail=false,acting=false}={}) {
 const keys=['SESSION_SECRET','SUPABASE_URL','SUPABASE_SECRET_KEY'];
 const saved=Object.fromEntries(keys.map(k=>[k,process.env[k]])); const original=global.fetch;
 Object.assign(process.env,{SESSION_SECRET:'synthetic-test-secret',SUPABASE_URL:'https://example.test',SUPABASE_SECRET_KEY:'synthetic'});
 const calls=[];
 global.fetch=async(url,options={})=>{
  calls.push({url,options});let data=[];let status=200;
  if(url.includes('/members?id=eq.')) data=[{id:'actor',role:dbRole,membership_status:'active'}];
  else if(url.includes('/members?')) data=[{id:'actor',full_name:'Hidden passenger'}];
  else if(url.includes('/kathin_trip_vans?')) {
   data=[{id:open,van_number:1,seat_count:13,active:true},{id:closed,van_number:2,seat_count:4,active:false}];
   if(url.includes('active=eq.true')) data=data.filter(v=>v.active);
   if(url.includes('id=eq.')) data=data.filter(v=>v.id===new URL(url).searchParams.get('id').slice(3));
   if(options.method==='PATCH') {data=data.map(v=>({...v,...JSON.parse(options.body)}));if(fail)status=503;}
  }else if(url.includes('/kathin_trip_bookings?')) data=[{member_id:'actor',van_id:closed,seat_number:1,booking_mode:'member'}];
  return {ok:status===200,status,text:async()=>JSON.stringify(data)};
 };
 const res={statusCode:200,setHeader(){},status(c){this.statusCode=c;return this;},json(b){this.body=b;return this;}};
 try {
  const token=createSessionToken({memberId:'actor',role,actingAdminId:acting?'other':null});
  await handler({method,query:{route},body,headers:{cookie:'nathoeng_session='+token},url:'/api/my-bookings'},res);
  return {res,calls};
 }finally{global.fetch=original;for(const k of keys)if(saved[k]===undefined)delete process.env[k];else process.env[k]=saved[k];}
}
test('member and demoted admin cannot see closed vehicles, occupants or their own hidden seat',async()=>{
 for(const opts of [{role:'member'},{role:'admin',dbRole:'member'}]){
  const {res,calls}=await run(opts);assert.equal(res.statusCode,200);
  assert.deepEqual(res.body.vans.map(v=>v.id),[open]);assert.deepEqual(res.body.occupied,[]);assert.equal(res.body.mine,null);
  assert.ok(!calls.some(c=>c.url.includes('/members?id=in.')));
 }
});
test('admin sees open and closed vehicles with retained bookings',async()=>{
 const {res}=await run();assert.equal(res.body.vans.length,2);assert.equal(res.body.vans[1].active,false);assert.equal(res.body.occupied.length,1);
});
test('only current admin can toggle, and boolean status is required',async()=>{
 const base={method:'POST',route:'kathin-trip-admin',body:{action:'set-vehicle-active',van_id:closed,active:true}};
 for(const opts of [{role:'member'},{dbRole:'member'},{acting:true}]){
  const {res,calls}=await run({...base,...opts});assert.equal(res.statusCode,403);assert.ok(!calls.some(c=>c.options.method==='PATCH'));
 }
 assert.equal((await run({...base,body:{...base.body,active:'false'}})).res.statusCode,400);
});
test('open and close writes modify only vehicle status and preserve bookings',async()=>{
 for(const active of [true,false]){
  const {res,calls}=await run({method:'POST',route:'kathin-trip-admin',body:{action:'set-vehicle-active',van_id:closed,active}});
  assert.equal(res.statusCode,200);assert.equal(res.body.vehicle.active,active);
  const writes=calls.filter(c=>c.options.method==='PATCH');assert.equal(writes.length,1);
  assert.match(writes[0].url,/kathin_trip_vans/);assert.deepEqual(JSON.parse(writes[0].options.body),{active});
 }
});
test('failed update is not reported as success',async()=>{
 const {res}=await run({method:'POST',route:'kathin-trip-admin',fail:true,body:{action:'set-vehicle-active',van_id:closed,active:true}});assert.equal(res.statusCode,503);
});
test('admin cancellation rejects closed vehicle before changing bookings',async()=>{
 const {res,calls}=await run({method:'POST',route:'kathin-trip-admin',body:{action:'cancel',van_id:closed,seat_number:1}});
 assert.equal(res.statusCode,409);assert.ok(!calls.some(c=>c.options.method==='PATCH'));
});
test('member cancellation is restricted to open vehicles',async()=>{
 const {calls}=await run({role:'member',method:'POST',body:{action:'cancel'}});
 const write=calls.find(c=>c.options.method==='PATCH');assert.ok(write.url.includes(open));assert.ok(!write.url.includes(closed));
});
