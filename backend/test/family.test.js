import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDb, teardown, makeUser } from './helpers.js';

describe('families & access requests', () => {
  let admin;
  let member;

  before(async () => {
    await resetDb();
    admin = await makeUser();
    member = await makeUser();
  });
  after(teardown);

  let familyId;

  test('creates a family with the creator as family_admin', async () => {
    const res = await request(app)
      .post('/api/v1/families')
      .set('Authorization', admin.bearer)
      .send({ name: 'The Smiths' });
    assert.equal(res.status, 201);
    familyId = res.body.family.id;

    const list = await request(app)
      .get('/api/v1/families')
      .set('Authorization', admin.bearer);
    assert.equal(list.body.families[0].my_role, 'family_admin');
  });

  test('invites a member who then accepts', async () => {
    const invite = await request(app)
      .post(`/api/v1/families/${familyId}/invite`)
      .set('Authorization', admin.bearer)
      .send({ email: member.email });
    assert.equal(invite.status, 201);
    assert.equal(invite.body.member.status, 'invited');

    const accept = await request(app)
      .post(`/api/v1/families/${familyId}/members/${member.user.id}/approve`)
      .set('Authorization', member.bearer);
    assert.equal(accept.status, 200);
    assert.equal(accept.body.member.status, 'active');
  });

  test('non-admin cannot invite', async () => {
    const third = await makeUser();
    const res = await request(app)
      .post(`/api/v1/families/${familyId}/invite`)
      .set('Authorization', member.bearer)
      .send({ email: third.email });
    assert.equal(res.status, 403);
  });

  test('access request flow grants a share on approval', async () => {
    // admin owns an item
    const item = await request(app)
      .post('/api/v1/items')
      .set('Authorization', admin.bearer)
      .send({ type: 'secure_note', title: 'WiFi', secret: { pw: 'home-wifi' } });
    const itemId = item.body.item.id;

    const reqRes = await request(app)
      .post('/api/v1/access-requests')
      .set('Authorization', member.bearer)
      .send({ itemId });
    assert.equal(reqRes.status, 201);
    const requestId = reqRes.body.request.id;

    // member cannot see it yet
    const before = await request(app)
      .get(`/api/v1/items/${itemId}`)
      .set('Authorization', member.bearer);
    assert.equal(before.status, 404);

    // admin sees it in incoming and approves
    const incoming = await request(app)
      .get('/api/v1/access-requests/incoming')
      .set('Authorization', admin.bearer);
    assert.equal(incoming.body.requests.length, 1);

    const approve = await request(app)
      .post(`/api/v1/access-requests/${requestId}/approve`)
      .set('Authorization', admin.bearer);
    assert.equal(approve.status, 200);

    // now member can view
    const after = await request(app)
      .get(`/api/v1/items/${itemId}`)
      .set('Authorization', member.bearer);
    assert.equal(after.status, 200);
  });
});
