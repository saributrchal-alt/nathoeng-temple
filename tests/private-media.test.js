import test from 'node:test';
import assert from 'node:assert/strict';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.SUPABASE_URL = 'https://database.example';
process.env.SUPABASE_SECRET_KEY = 'test-db-key';
process.env.MEDIA_UPLOAD_URL = 'https://media.nathoeng.com/upload.php';
process.env.MEDIA_UPLOAD_KEY = 'x'.repeat(32);
const { createSessionToken } = await import('../lib/_auth.js');
const { default: memberPhoto } = await import('../lib/_member-photo.js');
const { default: studentPhoto } = await import('../lib/student-api/student-photo.js');
const { default: studentProfile } = await import('../lib/student-api/student-profile.js');
const { storeMemberPicture, readPrivateImage, memberPhotoUrl } = await import('../lib/_private-media.js');
const id = 'a'.repeat(32);
const webp = Buffer.from('RIFF0000WEBPtest');
function req(user, query = { media: id }, method = 'GET', body) {
  return { method, query, body, url: '/api/donation-profile', headers: {
    cookie: user ? 'nathoeng_session=' + createSessionToken(user) : '',
  } };
}
function res() {
  return { code: 200, headers: {}, status(c) { this.code=c; return this; }, setHeader(k,v) { this.headers[k]=v; },
    end(body) { this.body=body; return this; }, send(body) { this.body=body; return this; }, json(body) { this.body=body; return this; } };
}
const own = { memberId: 'member-a', role: 'member' };
const admin = { memberId: 'admin-a', role: 'admin' };
const student = { studentId: 'student-a', role: 'temple_student' };
function response(data) { return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } }); }
test('unauthenticated and invalid media requests never call upstream', async t => {
  t.mock.method(globalThis, 'fetch', () => assert.fail('Unexpected request'));
  const r=res(); await memberPhoto(req(null),r); assert.equal(r.code,401);
  const bad=res(); await memberPhoto(req(own,{media:'../secret'}),bad); assert.equal(bad.code,400);
});
test('member cannot read another member photo', async t => {
  let calls=0;
  t.mock.method(globalThis,'fetch',async url => {
    calls++; assert.match(url,/&id=eq.member-a&/); return response([]);
  });
  const r=res(); await memberPhoto(req(own),r); assert.equal(r.code,404); assert.equal(calls,1);
});
for (const user of [own, admin]) test(`${user.role} can read a linked photo without public caching`, async t => {
  let calls=0;
  t.mock.method(globalThis,'fetch',async (url,options) => {
    calls++;
    if (calls===1) {
      assert.ok(url.includes(encodeURIComponent(memberPhotoUrl(id))));
      assert.equal(url.includes('&id=eq.'), user.role !== 'admin');
      return response([{id:'member-a'}]);
    }
    assert.equal(url,'https://media.nathoeng.com/private-media.php');
    assert.equal(options.body.get('id'),id); assert.equal(options.redirect,'error');
    return new Response(webp,{headers:{'Content-Type':'image/webp'}});
  });
  const r=res(); await memberPhoto(req(user),r); assert.equal(r.code,200);
  assert.deepEqual(r.body,webp); assert.equal(r.headers['Cache-Control'],'private, no-store');
});
test('health only accessible by administrator', async t => {
  t.mock.method(globalThis,'fetch',()=>assert.fail());
  const r=res(); await memberPhoto(req(own,{media:'health'}),r); assert.equal(r.code,403);
});
test('enabled upload stores a proxy URL and fails closed if media unavailable', async t => {
  process.env.MEDIA_PRIVATE_ENABLED='true';
  const mock=t.mock.method(globalThis,'fetch',async (url,options) => {
    assert.equal(options.body.get('project'),'temple');
    assert.equal(options.body.get('operation'),'upload');
    return response({ok:true,id,bytes:123,mime:'image/webp'});
  });
  assert.equal(await storeMemberPicture('data:image/jpeg;base64,/9j/'), memberPhotoUrl(id));
  mock.mock.mockImplementation(async()=>new Response('Unavailable',{status:503}));
  await assert.rejects(storeMemberPicture('data:image/jpeg;base64,/9j/'),{code:'MEDIA_UNAVAILABLE'});
  delete process.env.MEDIA_PRIVATE_ENABLED;
});
test('configuration cannot redirect private credentials and returned content must be WebP',async t=>{
  t.mock.method(globalThis,'fetch',async()=>new Response('html',{headers:{'Content-Type':'text/html'}}));
  await assert.rejects(readPrivateImage(id),{code:'MEDIA_UNAVAILABLE'});
  process.env.MEDIA_UPLOAD_URL='https://example.com/upload.php';
  await assert.rejects(readPrivateImage(id),{code:'MEDIA_UNAVAILABLE'});
  process.env.MEDIA_UPLOAD_URL='https://media.nathoeng.com/upload.php';
});
test('student cannot request another student photo',async t=>{
  t.mock.method(globalThis,'fetch',()=>assert.fail());
  const r=res(); await studentPhoto(req(student,{studentId:'student-b'}),r); assert.equal(r.code,403);
});
test('student private photo is read from media after ownership check',async t=>{
  t.mock.method(globalThis,'fetch',async url=>url.startsWith('https://database.example')
    ? response([{id:'student-a',profile_photo_path:'media:'+id}])
    : new Response(webp,{headers:{'Content-Type':'image/webp'}}));
  const r=res(); await studentPhoto(req(student,{studentId:'student-a'}),r);
  assert.equal(r.code,200); assert.deepEqual(r.body,webp);
});
test('enabled student upload patches only media reference, not image bytes',async t=>{
  process.env.MEDIA_PRIVATE_ENABLED='true';
  let writes=0;
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    if(url==='https://media.nathoeng.com/private-media.php') return response({ok:true,id,bytes:123,mime:'image/webp'});
    assert.ok(!url.includes('/storage/'));
    if(options.method==='PATCH') {
      writes++; assert.deepEqual(JSON.parse(options.body),{profile_photo_path:'media:'+id}); return new Response('',{status:200});
    }
    return response([{id:'student-a',profile_photo_path:'media:'+id}]);
  });
  const r=res(); await studentProfile(req(student,{},'POST',{imageData:'data:image/jpeg;base64,/9j/'}),r);
  assert.equal(r.code,200); assert.equal(writes,1); delete process.env.MEDIA_PRIVATE_ENABLED;
});
