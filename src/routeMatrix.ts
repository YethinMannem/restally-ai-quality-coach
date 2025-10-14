import type { OpenAPI } from 'openapi-types';

type Method = 'get'|'post'|'put'|'patch'|'delete'|'head'|'options';
export type Row = { method: string; path: string; statuses: string[]; summary?: string };

export function toMatrix(doc: OpenAPI.Document): Row[] {
  const rows: Row[] = [];
  const paths = (doc as any).paths ?? {};
  for (const path of Object.keys(paths)) {
    const item = paths[path];
    for (const method of Object.keys(item)) {
      const m = method.toLowerCase() as Method;
      if (!['get','post','put','patch','delete','head','options'].includes(m)) continue;
      const op = item[m];
      const statuses = Object.keys(op?.responses ?? {});
      rows.push({
        method: m.toUpperCase(),
        path,
        statuses,
        summary: op?.summary,
      });
    }
  }
  // nice deterministic sort: by path, then method
  return rows.sort((a,b) =>
    a.path === b.path ? a.method.localeCompare(b.method) : a.path.localeCompare(b.path)
  );
}

export function printMatrix(rows: Row[]) {
  console.log('\nMethod  Path            Statuses        Summary');
  console.log('------  --------------  --------------  --------------------');
  for (const r of rows) {
    const statuses = r.statuses.join(',');
    console.log(`${r.method.padEnd(6)}  ${r.path.padEnd(14)}  ${statuses.padEnd(14)}  ${r.summary ?? ''}`);
  }
  console.log();
}
