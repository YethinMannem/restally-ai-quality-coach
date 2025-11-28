/**
 * RestAlly Web Server - Web UI for uploading YAML files and viewing results
 */

import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { generateApi } from '../generateApi.js';
import { generateHttpTests } from '../generateHttpTests.js';
import { execSync } from 'node:child_process';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.static('public'));

// Ensure uploads directory exists
fs.mkdirSync('uploads', { recursive: true });
fs.mkdirSync('public', { recursive: true });
fs.mkdirSync('reports', { recursive: true });

/**
 * Clean up old report directories
 * Removes reports older than specified hours (default: 24 hours)
 */
function cleanupOldReports(maxAgeHours: number = 24) {
  try {
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) return;

    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds
    const entries = fs.readdirSync(reportsDir, { withFileTypes: true });

    let cleaned = 0;
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const dirPath = path.join(reportsDir, entry.name);
        const stats = fs.statSync(dirPath);
        const age = now - stats.mtimeMs;

        // Only delete timestamp-based directories (numeric names)
        if (/^\d+$/.test(entry.name) && age > maxAge) {
          try {
            fs.rmSync(dirPath, { recursive: true, force: true });
            cleaned++;
            console.log(`🧹 Cleaned up old report: ${entry.name}`);
          } catch (err: any) {
            console.error(`Failed to delete ${dirPath}:`, err.message);
          }
        }
      }
    }

    if (cleaned > 0) {
      console.log(`✅ Cleaned up ${cleaned} old report(s)`);
    }
  } catch (error: any) {
    console.error('Error cleaning up reports:', error.message);
  }
}

// Clean up old reports on server start (older than 24 hours)
cleanupOldReports(24);

interface ProcessResult {
  success: boolean;
  message: string;
  testResults?: any;
  reportPath?: string;
  mutationResults?: {
    mutationScore?: number;
    killed?: number;
    survived?: number;
    total?: number;
    reportPath?: string;
  };
  error?: string;
}

/**
 * Process uploaded YAML file and generate tests
 */
/**
 * Run mutation testing and return results
 */
async function runMutationTesting(reportDir: string): Promise<ProcessResult['mutationResults']> {
  try {
    console.log('🔬 Starting mutation testing (this WILL take 5-10 minutes - please wait)...');
    
    // Use the standard stryker command which uses stryker.conf.json
    // The report will be generated in reports/mutation/mutation.html by default
    const mutationCmd = `npx stryker run`;
    
    console.log('⏳ Running mutation testing... (this is a long-running operation)');
    let mutationOutput = '';
    let mutationExitCode = 0;
    
    try {
      mutationOutput = execSync(mutationCmd, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'], // Capture all output
        cwd: process.cwd(),
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer
        timeout: 900000 // 15 minute timeout (mutation testing takes a while)
      }).toString();
      console.log('✅ Mutation testing completed successfully');
    } catch (err: any) {
      // Stryker may exit with non-zero status codes but still generate reports
      mutationExitCode = err.status || err.code || 1;
      mutationOutput = (err.stdout || err.stderr || err.message || '').toString();
      console.log(`⚠️ Mutation testing finished with exit code ${mutationExitCode}`);
      console.log(`Output preview: ${mutationOutput.substring(0, 200)}`);
    }

        // Check default mutation report location from stryker.conf.json
        const defaultMutationReport = path.resolve(process.cwd(), 'reports', 'mutation', 'mutation.html');
        const defaultMutationJson = path.resolve(process.cwd(), 'reports', 'mutation', 'mutation-report.json');
        const customMutationReport = path.resolve(process.cwd(), reportDir, 'mutation', 'mutation.html');
        const customMutationJson = path.resolve(process.cwd(), reportDir, 'mutation', 'mutation-report.json');
        
        console.log(`Checking for mutation report at default location: ${defaultMutationReport}`);
        console.log(`Default report exists: ${fs.existsSync(defaultMutationReport)}`);
        
        let mutationReportPath: string | null = null;
        
        // Check default location first
        if (fs.existsSync(defaultMutationReport)) {
          mutationReportPath = defaultMutationReport;
          // Copy to our report directory for organization
          const targetReportDir = path.join(reportDir, 'mutation');
          fs.mkdirSync(targetReportDir, { recursive: true });
          fs.copyFileSync(defaultMutationReport, path.join(targetReportDir, 'mutation.html'));
          mutationReportPath = path.join(reportDir, 'mutation', 'mutation.html');
          
          // Also copy JSON report if it exists
          if (fs.existsSync(defaultMutationJson)) {
            fs.copyFileSync(defaultMutationJson, customMutationJson);
          }
        } else if (fs.existsSync(customMutationReport)) {
          mutationReportPath = customMutationReport;
        }
    
    if (mutationReportPath && fs.existsSync(path.resolve(process.cwd(), mutationReportPath))) {
      const mutationResults: ProcessResult['mutationResults'] = {
        reportPath: mutationReportPath
      };
      
      // Try to extract mutation score from output
      const scorePatterns = [
        /Mutation score:\s*(\d+\.?\d*)%/i,
        /(\d+\.?\d*)% mutation score/i,
        /score.*?(\d+\.?\d*)%/i
      ];
      
      for (const pattern of scorePatterns) {
        const match = mutationOutput.match(pattern);
        if (match) {
          mutationResults.mutationScore = parseFloat(match[1]);
          console.log(`📊 Mutation score extracted: ${mutationResults.mutationScore}%`);
          break;
        }
      }
      
      // Also try to extract killed/survived counts
      const killedMatch = mutationOutput.match(/(\d+)\s*killed/i);
      const survivedMatch = mutationOutput.match(/(\d+)\s*survived/i);
      const totalMatch = mutationOutput.match(/(\d+)\s*total.*?mutation/i);
      
      if (killedMatch) mutationResults.killed = parseInt(killedMatch[1]);
      if (survivedMatch) mutationResults.survived = parseInt(survivedMatch[1]);
      if (totalMatch) mutationResults.total = parseInt(totalMatch[1]);
      
      console.log('✅ Mutation testing results captured successfully');
      return mutationResults;
    } else {
      console.error('❌ Mutation report was not generated.');
      console.error(`Output (first 1000 chars): ${mutationOutput.substring(0, 1000)}`);
      return {
        reportPath: undefined
      };
    }
  } catch (mutationError: any) {
    console.error('❌ Mutation testing failed:', mutationError.message);
    if (mutationError.stack) {
      console.error('Stack:', mutationError.stack.substring(0, 500));
    }
    return {
      reportPath: undefined
    };
  }
}

async function processYamlFile(filePath: string): Promise<ProcessResult> {
  try {
    const timestamp = Date.now();
    const apiFile = `samples/generated-app-${timestamp}.ts`;
    const testFile = `tests/generated-${timestamp}.spec.ts`;
    const reportDir = `reports/${timestamp}`;

    // Ensure report directory exists
    fs.mkdirSync(reportDir, { recursive: true });

    // Step 1: Generate API
    await generateApi(filePath, apiFile);
    
    // Verify API was generated
    if (!fs.existsSync(apiFile)) {
      throw new Error(`Failed to generate API file: ${apiFile}`);
    }
    
    // Step 2: Generate tests
    await generateHttpTests(filePath, testFile, `../samples/generated-app-${timestamp}.js`);
    
    // Verify tests were generated
    if (!fs.existsSync(testFile)) {
      throw new Error(`Failed to generate test file: ${testFile}`);
    }

    // Step 3: Run tests
    // Use relative paths for better compatibility
    const jestJsonPath = path.join(reportDir, 'jest.json');
    
    // Ensure report directory exists
    fs.mkdirSync(reportDir, { recursive: true });
    
    // Use relative paths for Jest command (with quotes for safety)
    const jestCmd = `node --experimental-vm-modules node_modules/jest/bin/jest.js --config jest.config.cjs --runInBand --json --outputFile "${jestJsonPath}" "${testFile}"`;
    
    // Run Jest (it may throw on test failures, but still creates JSON)
    let testOutput = '';
    let testError = null;
    try {
      testOutput = execSync(jestCmd, { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd(),
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });
    } catch (err: any) {
      testError = err;
      // Capture output - Jest may exit with non-zero but still create JSON
      testOutput = (err.stdout || err.stderr || err.message || '').toString();
      // Wait for file system to sync
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Check if JSON file was created (Jest creates it even on test failures)
    const jestJsonPathAbs = path.resolve(process.cwd(), jestJsonPath);
    
    // Wait a bit more and check again
    if (!fs.existsSync(jestJsonPathAbs)) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (!fs.existsSync(jestJsonPathAbs)) {
      const errorMsg = testError 
        ? `Test execution failed: ${testError.message}\nJest output: ${testOutput.substring(0, 1000)}`
        : `Test results JSON file not found at ${jestJsonPathAbs}\nJest output: ${testOutput.substring(0, 1000)}`;
      throw new Error(errorMsg);
    }
    
    // Use absolute path for reading
    const jestJsonPathForReading = jestJsonPathAbs;

    // Step 4: Generate HTML report
    const htmlReportPath = path.join(reportDir, 'index.html');
    const reportCmd = `tsx src/report/makeHtmlReport.ts "${jestJsonPathForReading}" "${htmlReportPath}"`;
    try {
      execSync(reportCmd, { 
        encoding: 'utf8', 
        stdio: 'pipe',
        cwd: process.cwd()
      });
    } catch (reportError: any) {
      // HTML report generation failed, but we can still return JSON results
      console.error('Failed to generate HTML report:', reportError.message);
    }

    // Read test results
    const jestJson = JSON.parse(fs.readFileSync(jestJsonPathForReading, 'utf8'));

    // Check if HTML report was generated
    const htmlReportPathAbs = path.resolve(process.cwd(), reportDir, 'index.html');
    const reportPath = fs.existsSync(htmlReportPathAbs) ? `${reportDir}/index.html` : undefined;

    return {
      success: true,
      message: 'Tests generated and executed successfully',
      testResults: jestJson,
      reportPath: reportPath
    };
  } catch (error: any) {
    console.error('Error processing YAML file:', error);
    return {
      success: false,
      message: 'Failed to process YAML file',
      error: error.message || String(error)
    };
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.post('/api/upload', upload.single('yamlFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const result = await processYamlFile(req.file.path);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error processing file',
      error: error.message
    });
  }
});

// Mutation testing endpoint
app.post('/api/mutation/:timestamp', async (req, res) => {
  const { timestamp } = req.params;
  const reportDir = `reports/${timestamp}`;
  
  if (!fs.existsSync(reportDir)) {
    return res.status(404).json({
      success: false,
      message: 'Report directory not found. Please run tests first.'
    });
  }

  try {
    const mutationResults = await runMutationTesting(reportDir);
    
    res.json({
      success: true,
      message: 'Mutation testing completed',
      mutationResults: mutationResults
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error running mutation testing',
      error: error.message
    });
  }
});

app.get('/api/report/:timestamp', (req, res) => {
  const { timestamp } = req.params;
  const reportPath = path.join(process.cwd(), 'reports', timestamp, 'index.html');
  
  if (fs.existsSync(reportPath)) {
    res.sendFile(reportPath);
  } else {
    res.status(404).json({ success: false, message: 'Report not found' });
  }
});

// Mutation details endpoint - returns structured mutation data
app.get('/api/mutation/:timestamp/details', async (req, res) => {
  const { timestamp } = req.params;
  const mutationJsonPath = path.join(process.cwd(), 'reports', timestamp, 'mutation', 'mutation-report.json');
  
  if (!fs.existsSync(mutationJsonPath)) {
    return res.status(404).json({
      success: false,
      message: 'Mutation report not found. Please run mutation testing first.'
    });
  }

  try {
    const mutationData = JSON.parse(fs.readFileSync(mutationJsonPath, 'utf8'));
    
    // Extract and format mutation details
    const mutations = mutationData.files?.flatMap((file: any) => 
      file.mutants?.map((mutant: any) => ({
        id: mutant.id,
        file: file.source,
        fileName: path.basename(file.source),
        line: mutant.location.start.line,
        column: mutant.location.start.column,
        endLine: mutant.location.end.line,
        endColumn: mutant.location.end.column,
        status: mutant.status,
        replacement: mutant.replacement,
        original: file.source.split('\n')[mutant.location.start.line - 1]?.substring(
          mutant.location.start.column - 1,
          mutant.location.end.column - 1
        ),
        description: getMutationDescription(mutant),
        tests: mutant.testsRun || [],
        coveredBy: mutant.coveredBy || []
      })) || []
    ) || [];

    res.json({
      success: true,
      mutations: mutations,
      summary: {
        total: mutationData.metrics?.total,
        killed: mutationData.metrics?.killed,
        survived: mutationData.metrics?.survived,
        noCoverage: mutationData.metrics?.noCoverage,
        mutationScore: mutationData.metrics?.mutationScore
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error parsing mutation report',
      error: error.message
    });
  }
});

// Helper function to generate human-readable mutation descriptions
function getMutationDescription(mutant: any): string {
  const replacement = mutant.replacement || '';
  const mutatorName = mutant.mutatorName || '';
  
  // Generate description based on mutator type
  if (mutatorName.includes('Arithmetic')) {
    return `Changed arithmetic operator to: ${replacement}`;
  } else if (mutatorName.includes('Boolean')) {
    return `Changed boolean logic: ${replacement}`;
  } else if (mutatorName.includes('Conditional')) {
    return `Changed conditional operator: ${replacement}`;
  } else if (mutatorName.includes('Equality')) {
    return `Changed equality operator: ${replacement}`;
  } else if (mutatorName.includes('String')) {
    return `Changed string value: ${replacement}`;
  } else if (mutatorName.includes('Block')) {
    return `Removed or changed code block`;
  } else if (mutatorName.includes('Unary')) {
    return `Changed unary operator: ${replacement}`;
  } else {
    return `Changed to: ${replacement}`;
  }
}

app.get('/api/report/:timestamp/*', (req, res) => {
  const { timestamp } = req.params;
  const restOfPath = req.params[0] || 'index.html'; // Get everything after timestamp
  const reportPath = path.join(process.cwd(), 'reports', timestamp, restOfPath);
  
  // Security: prevent path traversal
  if (restOfPath.includes('..')) {
    return res.status(400).json({ success: false, message: 'Invalid path' });
  }
  
  if (fs.existsSync(reportPath)) {
    // If it's the mutation HTML report, inject CSS to hide Stryker logo
    if (restOfPath.includes('mutation.html')) {
      let html = fs.readFileSync(reportPath, 'utf8');
      
      // Inject CSS to hide Stryker logo (usually in bottom right)
      const hideLogoCSS = `
        <style>
          /* Hide Stryker logo SVG in bottom right corner */
          svg.stryker-image,
          svg[class*="stryker"],
          svg[style*="position:fixed"][style*="right"][style*="bottom"],
          /* Hide any fixed position SVG in bottom right */
          svg[style*="right:10px"][style*="bottom:10px"],
          svg[style*="right: 10px"][style*="bottom: 10px"],
          /* Hide links containing Stryker logo */
          a[href*="stryker-mutator.io"],
          a[href*="stryker"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        </style>
      `;
      
      // Inject CSS before </head> or at the beginning of <head>
      if (html.includes('</head>')) {
        html = html.replace('</head>', hideLogoCSS + '</head>');
      } else if (html.includes('<head>')) {
        html = html.replace('<head>', '<head>' + hideLogoCSS);
      } else {
        // If no head tag, add it at the beginning
        html = hideLogoCSS + html;
      }
      
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } else {
      res.sendFile(reportPath);
    }
  } else {
    res.status(404).json({ success: false, message: 'Report not found' });
  }
});

// Delete specific report endpoint
app.delete('/api/report/:timestamp', (req, res) => {
  const { timestamp } = req.params;
  const reportPath = path.join(process.cwd(), 'reports', timestamp);
  
  // Security: ensure it's a numeric timestamp (prevent path traversal)
  if (!/^\d+$/.test(timestamp)) {
    return res.status(400).json({ success: false, message: 'Invalid report ID' });
  }
  
  if (!fs.existsSync(reportPath)) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  try {
    fs.rmSync(reportPath, { recursive: true, force: true });
    console.log(`🗑️  Deleted report: ${timestamp}`);
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting report',
      error: error.message
    });
  }
});

// Cleanup all old reports endpoint
app.post('/api/cleanup', (req, res) => {
  const maxAgeHours = parseInt(req.body.maxAgeHours) || 1; // Default: 1 hour
  cleanupOldReports(maxAgeHours);
  res.json({ success: true, message: 'Cleanup completed' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🌐 RestAlly Web UI running at http://localhost:${PORT}`);
});

export { app };
