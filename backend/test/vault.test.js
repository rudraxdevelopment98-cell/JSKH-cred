import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDb, teardown, makeUser } from './helpers.js';

describe('vault items & sharing', () => {
  let owner;
  let other;

  before(async () => {
    await resetDb();
    owner = await makeUser();
    other = await makeUser();
  });
  after(teardown);

  let itemId;

  test('creates an encrypted credential item', async () => {
    const res = await request(app)
      .post('/api/v1/items')
      .set('Authorization', owner.bearer)
      .send({
        type: 'password',
        title: 'Bank Login',
        tags: ['finance'],
        secret: { username: 'alice', password: 's3cret!' },
      });
    assert.equal(res.status, 201);
    assert.equal(res.body.item.title, 'Bank Login');
    assert.equal(res.body.item.hasSecret, true);
    // The secret is never echoed back on create.
    assert.equal(res.body.item.secret, undefined);
    itemId = res.body.item.id;
  });

  test('reveal returns the decrypted secret for the owner', async () => {
    const res = await request(app)
      .get(`/api/v1/items/${itemId}/reveal`)
      .set('Authorization', owner.bearer);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.item.secret, { username: 'alice', password: 's3cret!' });
  });

  test('a non-owner cannot see the item', async () => {
    const res = await request(app)
      .get(`/api/v1/items/${itemId}`)
      .set('Authorization', other.bearer);
    assert.equal(res.status, 404); // existence hidden
  });

  test('owner lists only their items', async () => {
    const res = await request(app).get('/api/v1/items').set('Authorization', owner.bearer);
    assert.equal(res.status, 200);
    assert.equal(res.body.items.length, 1);

    const empty = await request(app).get('/api/v1/items').set('Authorization', other.bearer);
    assert.equal(empty.body.items.length, 0);
  });

  test('owner shares the item; grantee can view but not edit', async () => {
    const share = await request(app)
      .post(`/api/v1/items/${itemId}/shares`)
      .set('Authorization', owner.bearer)
      .send({ granteeId: other.user.id, permission: 'view_only' });
    assert.equal(share.status, 201);

    const view = await request(app)
      .get(`/api/v1/items/${itemId}`)
      .set('Authorization', other.bearer);
    assert.equal(view.status, 200);
    assert.equal(view.body.item.permission, 'view_only');

    const edit = await request(app)
      .put(`/api/v1/items/${itemId}`)
      .set('Authorization', other.bearer)
      .send({ title: 'Hacked' });
    assert.equal(edit.status, 403);
  });

  test('shared item appears in shared-with-me', async () => {
    const res = await request(app)
      .get('/api/v1/items/shared-with-me')
      .set('Authorization', other.bearer);
    assert.equal(res.status, 200);
    assert.equal(res.body.items.length, 1);
    assert.equal(res.body.items[0].id, itemId);
  });

  test('grantee gets a document_shared notification', async () => {
    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', other.bearer);
    assert.equal(res.status, 200);
    const types = res.body.notifications.map((n) => n.type);
    assert.ok(types.includes('document_shared'));
  });

  test('owner can update; grantee with edit can too', async () => {
    await request(app)
      .post(`/api/v1/items/${itemId}/shares`)
      .set('Authorization', owner.bearer)
      .send({ granteeId: other.user.id, permission: 'edit' });

    const edit = await request(app)
      .put(`/api/v1/items/${itemId}`)
      .set('Authorization', other.bearer)
      .send({ title: 'Joint Account' });
    assert.equal(edit.status, 200);
    assert.equal(edit.body.item.title, 'Joint Account');
  });

  test('only the owner can delete', async () => {
    const denied = await request(app)
      .delete(`/api/v1/items/${itemId}`)
      .set('Authorization', other.bearer);
    assert.equal(denied.status, 403);

    const ok = await request(app)
      .delete(`/api/v1/items/${itemId}`)
      .set('Authorization', owner.bearer);
    assert.equal(ok.status, 204);
  });
});
