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

/**
 * Generate minimal request body from OpenAPI requestBody schema
 * Works with any OpenAPI spec by reading the schema definition
 */
function generateRequestBodyFromSchema(
  requestBody: any,
  components: any
): any {
  if (!requestBody?.content?.['application/json']?.schema) {
    return {};
  }

  const schema = requestBody.content['application/json'].schema;
  return generateValueFromSchema(schema, components);
}

/**
 * Recursively generate a value from an OpenAPI schema
 */
function generateValueFromSchema(schema: any, components: any): any {
  // Handle $ref references
  if (schema.$ref) {
    const refPath = schema.$ref.replace('#/components/schemas/', '');
    const refSchema = components?.schemas?.[refPath];
    if (refSchema) {
      return generateValueFromSchema(refSchema, components);
    }
    return {};
  }

  // Handle different schema types
  if (schema.type === 'object') {
    const obj: any = {};
    const required = schema.required || [];
    const properties = schema.properties || {};

    for (const [key, propSchema] of Object.entries(properties)) {
      const prop = propSchema as any;
      // Include required fields and some optional ones
      if (required.includes(key) || Object.keys(properties).length <= 3) {
        obj[key] = generateValueFromSchema(prop, components);
      }
    }
    return obj;
  }

  if (schema.type === 'array') {
    if (schema.items) {
      return [generateValueFromSchema(schema.items, components)];
    }
    return [];
  }

  // Handle primitive types
  if (schema.type === 'string') {
    if (schema.enum && schema.enum.length > 0) {
      return schema.enum[0];
    }
    return 'example';
  }

  if (schema.type === 'number' || schema.type === 'integer') {
    return schema.minimum !== undefined ? schema.minimum : 1;
  }

  if (schema.type === 'boolean') {
    return true;
  }

  // Default fallback
  return null;
}

export async function generateHttpTests(
  specPath: string,
  outFile: string,
  appPath: string = '../samples/app.js'
) {
  const doc = (await SwaggerParser.validate(specPath)) as OpenAPI.Document;
  const paths: any = (doc as any).paths ?? {};
  const components: any = (doc as any).components ?? {};
  const tests: string[] = [];

  tests.push(`import request from 'supertest';`);
  tests.push(`import { app } from '${appPath}';`);
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

    // POST (happy path) - now schema-driven
    if (item?.post) {
      const statuses = Object.keys(item.post.responses ?? {});
      const target = pickSuccessStatus(statuses);
      if (target) {
        const name = (item.post.summary ?? `POST ${p}`).replace(/'/g, "\\'");
        const url = materializePath(p);
        
        // Generate body from OpenAPI requestBody schema, or infer from response
        let requestBody: any = {};
        if (item.post.requestBody) {
          requestBody = generateRequestBodyFromSchema(item.post.requestBody, components);
        } else {
          // If no requestBody defined, try to infer from success response schema
          const successResponse = item.post.responses?.[target];
          if (successResponse?.content?.['application/json']?.schema) {
            const responseSchema = successResponse.content['application/json'].schema;
            // For POST, typically the request is similar to response but without auto-generated fields
            requestBody = generateValueFromSchema(responseSchema, components);
            // Remove common auto-generated fields
            if (requestBody && typeof requestBody === 'object') {
              delete requestBody.id;
              delete requestBody.createdAt;
              delete requestBody.updatedAt;
            }
          }
        }
        
        const body = JSON.stringify(requestBody);
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