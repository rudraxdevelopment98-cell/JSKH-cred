import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDb, teardown, makeUser } from './helpers.js';

describe('auth', () => {
  before(resetDb);
  after(teardown);

  test('registers and returns tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'alice@example.com', password: 'password123', displayName: 'Alice' });
    assert.equal(res.status, 201);
    assert.ok(res.body.accessToken);
    assert.ok(res.body.refreshToken);
    assert.equal(res.body.user.email, 'alice@example.com');
    assert.equal(res.body.user.role, 'member');
  });

  test('rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'alice@example.com', password: 'password123' });
    assert.equal(res.status, 409);
  });

  test('rejects weak password with 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'weak@example.com', password: 'short' });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'validation_error');
  });

  test('logs in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alice@example.com', password: 'password123' });
    assert.equal(res.status, 200);
    assert.ok(res.body.accessToken);
  });

  test('rejects bad credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alice@example.com', password: 'wrong' });
    assert.equal(res.status, 401);
  });

  test('GET /me requires auth and returns the user', async () => {
    const user = await makeUser();
    const unauth = await request(app).get('/api/v1/auth/me');
    assert.equal(unauth.status, 401);

    const res = await request(app).get('/api/v1/auth/me').set('Authorization', user.bearer);
    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, user.email);
  });

  test('refresh rotates the refresh token', async () => {
    const user = await makeUser();
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: user.refreshToken });
    assert.equal(res.status, 200);
    assert.ok(res.body.accessToken);
    assert.notEqual(res.body.refreshToken, user.refreshToken);

    // Old token is now revoked.
    const reuse = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: user.refreshToken });
    assert.equal(reuse.status, 401);
  });
});
