/**
 * Generate Express.js API implementation from OpenAPI specification
 * Creates a working Express app with basic implementations for all endpoints
 */

import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPI } from 'openapi-types';
import fs from 'node:fs';
import path from 'node:path';

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';

/**
 * Generate a minimal Express API implementation from OpenAPI spec
 */
export async function generateApi(specPath: string, outFile: string): Promise<void> {
  const doc = (await SwaggerParser.validate(specPath)) as OpenAPI.Document;
  const paths: any = (doc as any).paths ?? {};
  const components: any = (doc as any).components ?? {};
  const info: any = (doc as any).info ?? {};

  const code: string[] = [];

  // Imports
  code.push(`import express from 'express';`);
  code.push('');
  code.push(`export const app = express();`);
  code.push(`app.use(express.json());`);
  code.push('');

  // Generate route handlers
  for (const pathStr of Object.keys(paths)) {
    const pathItem = paths[pathStr];
    // Convert OpenAPI path params {id} to Express params :id
    const routePath = pathStr.replace(/{([^}]+)}/g, ':$1');

    // GET
    if (pathItem?.get) {
      code.push(`// GET ${routePath}`);
      code.push(`app.get('${routePath}', (req, res) => {`);
      const response = generateResponse(pathItem.get, components, 'GET', routePath);
      code.push(response);
      code.push(`});`);
      code.push('');
    }

    // POST
    if (pathItem?.post) {
      code.push(`// POST ${routePath}`);
      code.push(`app.post('${routePath}', (req, res) => {`);
      const response = generateResponse(pathItem.post, components, 'POST', routePath);
      code.push(response);
      code.push(`});`);
      code.push('');
    }

    // PUT
    if (pathItem?.put) {
      code.push(`// PUT ${routePath}`);
      code.push(`app.put('${routePath}', (req, res) => {`);
      const response = generateResponse(pathItem.put, components, 'PUT', routePath);
      code.push(response);
      code.push(`});`);
      code.push('');
    }

    // PATCH
    if (pathItem?.patch) {
      code.push(`// PATCH ${routePath}`);
      code.push(`app.patch('${routePath}', (req, res) => {`);
      const response = generateResponse(pathItem.patch, components, 'PATCH', routePath);
      code.push(response);
      code.push(`});`);
      code.push('');
    }

    // DELETE
    if (pathItem?.delete) {
      code.push(`// DELETE ${routePath}`);
      code.push(`app.delete('${routePath}', (req, res) => {`);
      const response = generateResponse(pathItem.delete, components, 'DELETE', routePath);
      code.push(response);
      code.push(`});`);
      code.push('');
    }
  }

  // Write file
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, code.join('\n'), 'utf8');
}

/**
 * Generate response code for an endpoint
 */
function generateResponse(
  operation: any,
  components: any,
  method: string,
  pathStr: string
): string {
  const responses = operation.responses ?? {};
  const statusCodes = Object.keys(responses);
  
  // Find success status
  const successStatus = statusCodes.find((s) => /^2\d\d$/.test(s)) || statusCodes[0] || '200';
  const successResponse = responses[successStatus];
  
  // Generate response body from schema
  let responseBody: any = null;
  if (successResponse?.content?.['application/json']?.schema) {
    const schema = successResponse.content['application/json'].schema;
    responseBody = generateValueFromSchema(schema, components, method, pathStr);
  }

  // Handle path parameters
  const pathParams = extractPathParams(pathStr);
  const paramChecks: string[] = [];
  
  if (pathParams.length > 0) {
    for (const param of pathParams) {
      paramChecks.push(`  const ${param} = req.params.${param};`);
    }
    paramChecks.push('');
  }

  // Generate conditional logic for different status codes
  const lines: string[] = [];
  lines.push(...paramChecks);

  // For POST/PUT/PATCH, validate request body
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    lines.push(`  const body = req.body ?? {};`);
    
    // Basic validation
    if (operation.requestBody) {
      const schema = operation.requestBody?.content?.['application/json']?.schema;
      if (schema) {
        const requiredFields = getRequiredFields(schema, components);
        if (requiredFields.length > 0) {
          lines.push(`  // Validate required fields`);
          for (const field of requiredFields) {
            lines.push(`  if (!body.${field} || typeof body.${field} !== 'string') {`);
            lines.push(`    return res.status(400).json({ error: '${field} is required' });`);
            lines.push(`  }`);
          }
        }
      }
    }
    lines.push('');
  }

  // Generate response based on status codes
  if (statusCodes.includes('200') || statusCodes.includes('201') || statusCodes.includes('204')) {
    const status = method === 'POST' ? '201' : method === 'DELETE' ? '204' : '200';
    
    if (status === '204') {
      lines.push(`  res.status(${status}).send();`);
    } else if (responseBody !== null) {
      const bodyStr = JSON.stringify(responseBody, null, 2);
      lines.push(`  res.status(${status}).json(${bodyStr});`);
    } else {
      lines.push(`  res.status(${status}).json({ message: 'Success' });`);
    }
  } else if (statusCodes.includes('404')) {
    // Handle 404 case
    if (pathParams.length > 0) {
      lines.push(`  // Check if resource exists`);
      lines.push(`  if (${pathParams[0]} === '1') {`);
      if (responseBody !== null) {
        const bodyStr = JSON.stringify(responseBody, null, 2);
        lines.push(`    return res.status(200).json(${bodyStr});`);
      } else {
        lines.push(`    return res.status(200).json({ id: '${pathParams[0]}', name: 'Example' });`);
      }
      lines.push(`  }`);
      lines.push(`  return res.status(404).json({ error: 'not found' });`);
    } else {
      // For non-parameterized routes, return success if 200 is available, else 404
      if (statusCodes.includes('200')) {
        if (responseBody !== null) {
          const bodyStr = JSON.stringify(responseBody, null, 2);
          lines.push(`  res.status(200).json(${bodyStr});`);
        } else {
          lines.push(`  res.status(200).json({ message: 'Success' });`);
        }
      } else {
        lines.push(`  res.status(404).json({ error: 'not found' });`);
      }
    }
  } else {
    lines.push(`  res.status(${successStatus}).json({ message: 'Success' });`);
  }

  return lines.join('\n');
}

/**
 * Extract path parameters from a route path
 */
function extractPathParams(pathStr: string): string[] {
  const matches = pathStr.matchAll(/{([^}]+)}/g);
  return Array.from(matches, (m) => m[1]);
}

/**
 * Get required fields from a schema
 */
function getRequiredFields(schema: any, components: any): string[] {
  if (schema.$ref) {
    const refPath = schema.$ref.replace('#/components/schemas/', '');
    const refSchema = components?.schemas?.[refPath];
    if (refSchema) {
      return refSchema.required || [];
    }
  }
  return schema.required || [];
}

/**
 * Generate a value from an OpenAPI schema (for response generation)
 */
function generateValueFromSchema(
  schema: any,
  components: any,
  method: string = 'GET',
  pathStr: string = ''
): any {
  // Handle $ref references
  if (schema.$ref) {
    const refPath = schema.$ref.replace('#/components/schemas/', '');
    const refSchema = components?.schemas?.[refPath];
    if (refSchema) {
      return generateValueFromSchema(refSchema, components, method, pathStr);
    }
    return {};
  }

  // Handle arrays
  if (schema.type === 'array') {
    if (schema.items) {
      const item = generateValueFromSchema(schema.items, components, method, pathStr);
      return [item];
    }
    return [];
  }

  // Handle objects
  if (schema.type === 'object') {
    const obj: any = {};
    const required = schema.required || [];
    const properties = schema.properties || {};

    for (const [key, propSchema] of Object.entries(properties)) {
      const prop = propSchema as any;
      // Include required fields and key fields
      if (required.includes(key) || key === 'id' || key === 'name') {
        if (key === 'id') {
          obj[key] = '1'; // Default ID
        } else if (key === 'name') {
          obj[key] = 'Example';
        } else {
          obj[key] = generateValueFromSchema(prop, components, method, pathStr);
        }
      }
    }
    return obj;
  }

  // Handle primitives
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

  return null;
}

// CLI entry point
if (process.argv[1]?.endsWith('generateApi.ts')) {
  const spec = process.argv[2] ?? 'samples/petstore.yaml';
  const out = process.argv[3] ?? 'samples/generated-app.ts';
  generateApi(spec, out)
    .then(() => {
      console.log('✅ Generated API implementation:', out);
    })
    .catch((e) => {
      console.error('❌', e.message);
      process.exit(1);
    });
}
