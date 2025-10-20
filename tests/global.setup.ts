import { generateHttpTests } from '../src/generateHttpTests';

export default async function setup() {
  await generateHttpTests('samples/petstore.yaml', 'tests/generated.http.spec.ts');
}
