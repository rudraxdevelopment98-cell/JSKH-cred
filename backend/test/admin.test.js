import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDb, teardown, makeUser, promoteToSuperAdmin } from './helpers.js';

describe('admin', () => {
  let admin;
  let member;

  before(async () => {
    await resetDb();
    admin = await makeUser();
    member = await makeUser();
    await promoteToSuperAdmin(admin.user.id);
  });
  after(teardown);

  test('non-admin is forbidden from admin routes', async () => {
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', member.bearer);
    assert.equal(res.status, 403);
  });

  test('admin sees stats', async () => {
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', admin.bearer);
    assert.equal(res.status, 200);
    assert.equal(res.body.stats.totalUsers, 2);
    assert.ok('activityLast24h' in res.body.stats);
  });

  test('admin lists users and can suspend / reinstate', async () => {
    const list = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', admin.bearer);
    assert.equal(list.status, 200);
    assert.equal(list.body.users.length, 2);

    const suspend = await request(app)
      .post(`/api/v1/admin/users/${member.user.id}/suspend`)
      .set('Authorization', admin.bearer);
    assert.equal(suspend.status, 200);
    assert.equal(suspend.body.user.status, 'suspended');

    // Suspended user is rejected on authenticated routes.
    const blocked = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', member.bearer);
    assert.equal(blocked.status, 403);

    const reinstate = await request(app)
      .post(`/api/v1/admin/users/${member.user.id}/reinstate`)
      .set('Authorization', admin.bearer);
    assert.equal(reinstate.body.user.status, 'active');
  });
});
