#!/usr/bin/env node
/**
 * RestAlly CLI - Unified command-line interface for end-to-end API testing
 * 
 * Usage:
 *   restally <spec-path> [options]
 * 
 * Examples:
 *   restally samples/petstore.yaml
 *   restally api.yaml --out-dir ./test-results
 *   restally api.yaml --no-report
 *   restally api.yaml --format json
 */

import { generateHttpTests } from './generateHttpTests.js';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

interface CLIOptions {
  specPath: string;
  outDir?: string;
  testDir?: string;
  reportDir?: string;
  format?: 'json' | 'html' | 'both';
  noReport?: boolean;
  noTest?: boolean;
  verbose?: boolean;
}

class RestAllyCLI {
  private options: CLIOptions;

  constructor(options: CLIOptions) {
    this.options = {
      outDir: 'reports',
      testDir: 'tests',
      reportDir: 'reports',
      format: 'both',
      noReport: false,
      noTest: false,
      verbose: false,
      ...options
    };
  }

  async run(): Promise<void> {
    const { specPath, outDir, testDir, reportDir, format, noReport, noTest, verbose } = this.options;

    console.log('🚀 RestAlly - API Quality Coach\n');
    console.log(`📄 OpenAPI Spec: ${specPath}`);
    console.log(`📁 Output Directory: ${outDir}`);
    console.log(`🧪 Test Directory: ${testDir}`);
    console.log(`📊 Report Directory: ${reportDir}\n`);

    // Step 1: Validate spec file exists
    if (!fs.existsSync(specPath)) {
      console.error(`❌ Error: OpenAPI spec file not found: ${specPath}`);
      process.exit(1);
    }

    // Step 2: Generate tests
    console.log('📝 Step 1: Generating tests from OpenAPI spec...');
    const testFile = path.join(testDir!, 'generated.http.spec.ts');
    try {
      await generateHttpTests(specPath, testFile);
      console.log(`✅ Tests generated: ${testFile}\n`);
    } catch (error: any) {
      console.error(`❌ Failed to generate tests: ${error.message}`);
      process.exit(1);
    }

    // Step 3: Run tests (if not skipped)
    if (!noTest) {
      console.log('🧪 Step 2: Running generated tests...');
      try {
        const jestCmd = `node --experimental-vm-modules node_modules/jest/bin/jest.js --config jest.config.cjs --runInBand`;
        const jestOutput = execSync(jestCmd, { 
          encoding: 'utf8',
          stdio: verbose ? 'inherit' : 'pipe'
        });
        
        if (!verbose) {
          // Extract summary from output
          const match = jestOutput.match(/(\d+) passed/);
          if (match) {
            console.log(`✅ Tests completed: ${match[1]} test(s) passed\n`);
          } else {
            console.log('✅ Tests completed\n');
          }
        }
      } catch (error: any) {
        console.error(`❌ Tests failed: ${error.message}`);
        if (!verbose) {
          console.error('Run with --verbose to see full output');
        }
        process.exit(1);
      }
    } else {
      console.log('⏭️  Skipping test execution (--no-test flag)\n');
    }

    // Step 4: Generate reports (if not skipped)
    if (!noReport) {
      if (noTest) {
        console.log('⚠️  Cannot generate reports without running tests. Use without --no-test flag.\n');
      } else {
        console.log('📊 Step 3: Generating reports...');
        
        // Ensure output directory exists
        fs.mkdirSync(outDir!, { recursive: true });

        const jestJsonPath = path.join(reportDir!, 'jest.json');
        const htmlReportPath = path.join(reportDir!, 'index.html');

        // Generate JSON report (run Jest with JSON output)
        if (format === 'json' || format === 'both') {
          try {
            const jsonCmd = `node --experimental-vm-modules node_modules/jest/bin/jest.js --config jest.config.cjs --runInBand --json --outputFile ${jestJsonPath}`;
            execSync(jsonCmd, { 
              encoding: 'utf8',
              stdio: verbose ? 'inherit' : 'pipe'
            });
            console.log(`✅ JSON report: ${jestJsonPath}`);
          } catch (error: any) {
            console.error(`❌ Failed to generate JSON report: ${error.message}`);
          }
        }

        // Generate HTML report (requires JSON report first)
        if (format === 'html' || format === 'both') {
          try {
            // Ensure JSON exists for HTML generation
            if (!fs.existsSync(jestJsonPath)) {
              const jsonCmd = `node --experimental-vm-modules node_modules/jest/bin/jest.js --config jest.config.cjs --runInBand --json --outputFile ${jestJsonPath}`;
              execSync(jsonCmd, { 
                encoding: 'utf8',
                stdio: 'pipe'
              });
            }
            
            const reportCmd = `tsx src/report/makeHtmlReport.ts ${jestJsonPath} ${htmlReportPath}`;
            execSync(reportCmd, { 
              encoding: 'utf8',
              stdio: verbose ? 'inherit' : 'pipe'
            });
            console.log(`✅ HTML report: ${htmlReportPath}`);
          } catch (error: any) {
            console.error(`❌ Failed to generate HTML report: ${error.message}`);
          }
        }

        console.log('');
      }
    } else {
      console.log('⏭️  Skipping report generation (--no-report flag)\n');
    }

    // Success summary
    console.log('🎉 RestAlly pipeline completed successfully!');
    if (!noReport && (format === 'html' || format === 'both')) {
      console.log(`\n📖 View your report: file://${path.resolve(reportDir!, 'index.html')}`);
    }
  }
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
RestAlly CLI - API Quality Coach

Usage:
  restally <spec-path> [options]

Arguments:
  <spec-path>              Path to OpenAPI specification file (YAML or JSON)

Options:
  --out-dir <dir>          Output directory for reports (default: reports)
  --test-dir <dir>          Directory for generated tests (default: tests)
  --report-dir <dir>        Directory for test reports (default: reports)
  --format <format>         Report format: json, html, or both (default: both)
  --no-report              Skip report generation
  --no-test                Skip test execution (only generate tests)
  --verbose, -v             Show detailed output
  --help, -h                Show this help message

Examples:
  restally samples/petstore.yaml
  restally api.yaml --out-dir ./results
  restally api.yaml --format json
  restally api.yaml --no-report
  restally api.yaml --no-test --format html
    `);
    process.exit(0);
  }

  const options: CLIOptions = {
    specPath: args[0]
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '--out-dir':
        options.outDir = next;
        i++;
        break;
      case '--test-dir':
        options.testDir = next;
        i++;
        break;
      case '--report-dir':
        options.reportDir = next;
        i++;
        break;
      case '--format':
        if (next === 'json' || next === 'html' || next === 'both') {
          options.format = next as 'json' | 'html' | 'both';
          i++;
        } else {
          console.error(`❌ Invalid format: ${next}. Must be json, html, or both`);
          process.exit(1);
        }
        break;
      case '--no-report':
        options.noReport = true;
        break;
      case '--no-test':
        options.noTest = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      default:
        console.error(`❌ Unknown option: ${arg}`);
        console.error('Run with --help to see usage information');
        process.exit(1);
    }
  }

  return options;
}

// CLI Entry Point
async function main() {
  try {
    const options = parseArgs();
    const cli = new RestAllyCLI(options);
    await cli.run();
  } catch (error: any) {
    console.error('❌ CLI Error:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('cli.ts')) {
  main();
}

export { RestAllyCLI, parseArgs };
