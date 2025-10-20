/// <reference types="jest" />
import { app } from '../samples/app';
import type { AddressInfo } from 'node:net';

let server: any;

beforeAll(async () => {
  try {
    await new Promise<void>((resolve, reject) => {
      server = app.listen(0, () => {
        try {
          const { port } = server.address() as AddressInfo;
          process.env.BASE_URL = `http://127.0.0.1:${port}`;
          resolve();
        } catch (e) {
          reject(e);
        }
      });
      server.on('error', reject);
    });
  } catch (e) {
    console.error('❌ Failed to start test server:', e);
    throw e;
  }
});

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
