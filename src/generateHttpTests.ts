import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPI } from 'openapi-types';
import fs from 'node:fs';
import path from 'node:path';


type Method = 'get'|'post'|'put'|'patch'|'delete'|'head'|'options';

function pickSuccessStatus(statuses: string[]): string | undefined {
  const preferred = ['200', '201', '204'];
  for (const s of preferred) if (statuses.includes(s)) return s;
  // fallback: any 2xx
  return statuses.find(s => /^2\d\d$/.test(s));
}

function materializePath(p: string): string {
  return p.replace(/{[^}]+}/g, '1');
}

// NEW: naive minimal body for known paths (we’ll make this schema-driven later)
function minimalBodyFor(path: string) {
  if (path === '/pets') return { name: 'Buddy' };
  return {};
}

export async function generateHttpTests(specPath: string, outFile: string) {
  const doc = (await SwaggerParser.validate(specPath)) as OpenAPI.Document;
  const paths: any = (doc as any).paths ?? {};
  const tests: string[] = [];

  tests.push(`import request from 'supertest';`);
  tests.push(`import { app } from '../samples/app.js';`);
  tests.push(`describe('Generated HTTP tests', () => {`);

  for (const p of Object.keys(paths)) {
    const item = paths[p];

    // GET
    if (item?.get) {
      const statuses = Object.keys(item.get.responses ?? {});
      const target = pickSuccessStatus(statuses);
      if (target) {
        const name = (item.get.summary ?? `GET ${p}`).replace(/'/g, "\\'");
        const url = materializePath(p);
        tests.push(`
          it('${name} (GET) → expects [${statuses.join(', ')}]', async () => {
            const res = await request(app).get('${url}');
            expect([${statuses.map(s => `'${s}'`).join(', ')}]).toContain(String(res.status));
          });
        `);
      }
    }

    // POST (happy path)
    if (item?.post) {
      const statuses = Object.keys(item.post.responses ?? {});
      const target = pickSuccessStatus(statuses);
      if (target) {
        const name = (item.post.summary ?? `POST ${p}`).replace(/'/g, "\\'");
        const url = materializePath(p);
        const body = JSON.stringify(minimalBodyFor(p));
        tests.push(`
          it('${name} (POST) → expects [${statuses.join(', ')}]', async () => {
            const res = await request(app).post('${url}')
              .send(${body})
              .set('Content-Type', 'application/json');
            expect([${statuses.map(s => `'${s}'`).join(', ')}]).toContain(String(res.status));
          });
        `);
      }
    }
  }

  tests.push(`});`);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, tests.join('\n'), 'utf8');
}

// CLI entry
if (process.argv[1]?.endsWith('generateHttpTests.ts') || process.argv[1]?.endsWith('generateGetTests.ts')) {
  const spec = process.argv[2] ?? 'samples/petstore.yaml';
  const out = process.argv[3] ?? 'tests/generated.http.spec.ts';
  generateHttpTests(spec, out).then(() => {
    console.log('✅ Wrote', out);
  }).catch(e => {
    console.error('❌', e.message);
    process.exit(1);
  });
}