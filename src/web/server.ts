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

interface ProcessResult {
  success: boolean;
  message: string;
  testResults?: any;
  reportPath?: string;
  error?: string;
}

/**
 * Process uploaded YAML file and generate tests
 */
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

app.get('/api/report/:timestamp', (req, res) => {
  const { timestamp } = req.params;
  const reportPath = path.join(process.cwd(), 'reports', timestamp, 'index.html');
  
  if (fs.existsSync(reportPath)) {
    res.sendFile(reportPath);
  } else {
    res.status(404).json({ success: false, message: 'Report not found' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🌐 RestAlly Web UI running at http://localhost:${PORT}`);
});

export { app };
