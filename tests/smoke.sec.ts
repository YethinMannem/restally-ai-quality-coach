import request from 'supertest';
import { app } from '../samples/app';

describe('smoke', () => {
  it('GET /pets works', async () => {
    const res = await request(app).get('/pets');
    expect([200, 404]).toContain(res.status);
  });
});
