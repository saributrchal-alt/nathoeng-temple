import test from 'node:test';
import assert from 'node:assert/strict';
import { uploadPublicImage } from '../lib/_media-upload.js';
const env = { MEDIA_UPLOAD_URL: 'https://media.nathoeng.com/upload.php', MEDIA_UPLOAD_KEY: 'x'.repeat(32) };
const input = { bytes: Buffer.from('test'), mime: 'image/jpeg' };
for (const project of ['temple', 'nathoeng', 'gears', 'library']) {
  test(`routes ${project} and validates returned URL`, async () => {
    const url = `https://media.nathoeng.com/uploads/${project}/2026/09/${'a'.repeat(32)}.webp`;
    const result = await uploadPublicImage({ ...input, project }, { env, fetchImpl: async (endpoint, options) => {
      assert.equal(endpoint, env.MEDIA_UPLOAD_URL);
      assert.equal(options.redirect, 'error');
      assert.equal(options.body.get('folder'), project);
      assert.equal(options.headers['X-Upload-Key'], env.MEDIA_UPLOAD_KEY);
      return { ok: true, json: async () => ({ ok: true, url, bytes: 20 }) };
    } });
    assert.equal(result.url, url);
  });
}
test('rejects untrusted destination before sending credentials', async () => {
  await assert.rejects(uploadPublicImage(input, { env: { ...env, MEDIA_UPLOAD_URL: 'https://example.com' }, fetchImpl: () => assert.fail() }));
});
test('rejects cross-project response and service failures', async () => {
  for (const url of ['https://example.com/image.webp', `https://media.nathoeng.com/uploads/gears/2026/09/${'a'.repeat(32)}.webp`]) {
    await assert.rejects(uploadPublicImage(input, { env, fetchImpl: async () => ({ ok: true, json: async () => ({ ok: true, url, bytes: 20 }) }) }));
  }
  await assert.rejects(uploadPublicImage(input, { env, fetchImpl: async () => { throw new Error('network'); } }), /Media service unavailable/);
});
test('rejects traversal, unsupported formats and oversized images', async () => {
  for (const change of [{ project: '../temple' }, { mime: 'text/html' }, { bytes: Buffer.alloc(2097153) }]) {
    await assert.rejects(uploadPublicImage({ ...input, ...change }, { env, fetchImpl: () => assert.fail() }));
  }
});
