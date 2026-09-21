import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDb, teardown, makeUser } from './helpers.js';

describe('family invite codes & google auth', () => {
  let admin;
  let member;
  let familyId;

  before(async () => {
    await resetDb();
    admin = await makeUser();
    member = await makeUser();
    const fam = await request(app)
      .post('/api/v1/families')
      .set('Authorization', admin.bearer)
      .send({ name: 'The Codes' });
    familyId = fam.body.family.id;
  });
  after(teardown);

  let code;

  test('admin generates a 6-digit invite code', async () => {
    const res = await request(app)
      .post(`/api/v1/families/${familyId}/invite-code`)
      .set('Authorization', admin.bearer)
      .send({});
    assert.equal(res.status, 201);
    assert.match(res.body.code, /^\d{6}$/);
    assert.equal(res.body.emailed, false); // no SMTP configured in tests
    code = res.body.code;
  });

  test('non-admin cannot generate a code', async () => {
    const res = await request(app)
      .post(`/api/v1/families/${familyId}/invite-code`)
      .set('Authorization', member.bearer)
      .send({});
    assert.equal(res.status, 403);
  });

  test('member joins with the code and becomes active', async () => {
    const res = await request(app)
      .post('/api/v1/families/join')
      .set('Authorization', member.bearer)
      .send({ code });
    assert.equal(res.status, 200);
    assert.equal(res.body.family.id, familyId);

    const members = await request(app)
      .get(`/api/v1/families/${familyId}/members`)
      .set('Authorization', admin.bearer);
    const joined = members.body.members.find((m) => m.user_id === member.user.id);
    assert.equal(joined.status, 'active');
  });

  test('a used code cannot be reused', async () => {
    const other = await makeUser();
    const res = await request(app)
      .post('/api/v1/families/join')
      .set('Authorization', other.bearer)
      .send({ code });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'invalid_code');
  });

  test('a malformed code is rejected by validation', async () => {
    const res = await request(app)
      .post('/api/v1/families/join')
      .set('Authorization', member.bearer)
      .send({ code: 'abc' });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'validation_error');
  });

  test('google sign-in reports not-configured when no client ID is set', async () => {
    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'dummy' });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'google_not_configured');
  });
});
