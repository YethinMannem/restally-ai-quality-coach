import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPI } from 'openapi-types';
import { toMatrix, printMatrix } from './routeMatrix.js';

async function main() {
  const specPath = process.argv[2] ?? 'samples/petstore.yaml';
  const doc = (await SwaggerParser.validate(specPath)) as OpenAPI.Document;
  const matrix = toMatrix(doc);
  printMatrix(matrix);
}
main().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});
