import fs from 'node:fs';
import path from 'node:path';

function esc(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
}
function fmtMs(ms: number | undefined) { return (ms || ms === 0) ? `${ms} ms` : '-'; }

function buildHtml(summary: any) {
  const total = summary.numTotalTests ?? 0;
  const passed = summary.numPassedTests ?? 0;
  const failed = summary.numFailedTests ?? 0;
  const skipped = summary.numPendingTests ?? 0;

  const rows: string[] = [];
  for (const suite of summary.testResults ?? []) {
    for (const test of suite.assertionResults ?? []) {
      const status = test.status;
      rows.push(`
        <tr class="${status}">
          <td>${esc(path.relative(process.cwd(), suite.name))}</td>
          <td>${esc(test.fullName || test.title)}</td>
          <td class="status ${status}">${status}</td>
          <td>${fmtMs(test.duration)}</td>
        </tr>
      `);
    }
  }

  return `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>RestAlly Test Report</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 24px; }
      h1 { margin: 0 0 12px; }
      .summary { display: flex; gap: 12px; margin: 12px 0 20px; flex-wrap: wrap; }
      .card { padding: 10px 14px; border: 1px solid #eee; border-radius: 10px; }
      .passed { color: #0a7b38; }
      .failed { color: #b00020; }
      .pending { color: #8a8a8a; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #eee; }
      th { background: #fafafa; }
      .status { font-weight: 600; text-transform: capitalize; }
      .status.passed { color: #0a7b38; }
      .status.failed { color: #b00020; }
      .status.pending { color: #8a8a8a; }
      footer { margin-top: 20px; font-size: 12px; color: #666; }
    </style>
  </head>
  <body>
    <h1>RestAlly — Test Report</h1>
    <div class="summary">
      <div class="card"><strong>Total:</strong> ${total}</div>
      <div class="card passed"><strong>Passed:</strong> ${passed}</div>
      <div class="card failed"><strong>Failed:</strong> ${failed}</div>
      <div class="card pending"><strong>Skipped:</strong> ${skipped}</div>
      <div class="card"><strong>Suites:</strong> ${summary.numTotalTestSuites ?? 0}</div>
    </div>

    <table>
      <thead><tr><th>Suite</th><th>Test</th><th>Status</th><th>Duration</th></tr></thead>
      <tbody>${rows.join('\n')}</tbody>
    </table>

    <footer>Generated ${new Date().toLocaleString()}</footer>
  </body>
  </html>`;
}

function main() {
  const inPath = process.argv[2] ?? 'reports/jest.json';
  const outPath = process.argv[3] ?? 'reports/index.html';
  if (!fs.existsSync(inPath)) {
    console.error(`Input JSON not found: ${inPath}. Run "npm run test:json" first.`);
    process.exit(1);
  }
  const raw = fs.readFileSync(inPath, 'utf8');
  const json = JSON.parse(raw);
  const html = buildHtml(json);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`✅ Wrote ${outPath}`);
}
main();
