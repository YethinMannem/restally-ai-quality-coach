# RestAlly Usage Guide

## 🚀 Quick Start

RestAlly provides multiple ways to test your REST APIs from OpenAPI specifications. Choose the method that best fits your workflow.

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 20+ installed ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- An **OpenAPI 3.0 specification** file (YAML or JSON format)

---

## 🔧 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/YethinMannem/restally-ai-quality-coach.git
cd restally-ai-quality-coach
```

### Step 2: Install Dependencies

```bash
npm install
```

That's it! You're ready to use RestAlly.

---

## 🎯 Usage Methods

RestAlly offers three main ways to use it:

### 1. 🌐 Web UI (Easiest for Beginners)

**Best for:** Quick testing, non-technical users, visual feedback

#### Start the Web Server

```bash
npm run web
```

This starts the web server at `http://localhost:3001`

#### Using the Web UI

1. **Open your browser** and navigate to `http://localhost:3001`
2. **Upload your OpenAPI file:**
   - Drag and drop your `.yaml` or `.json` file onto the upload area, OR
   - Click "Choose File" and select your OpenAPI specification
3. **Optional:** Check "Include mutation testing" if you want comprehensive quality metrics (takes 5-10 minutes)
4. **Click "Process & Generate Tests"**
5. **View results:**
   - See test statistics (total, passed, failed)
   - View individual test results
   - Click "View Full HTML Report" for detailed analysis
   - If mutation testing was enabled, click "View Mutation Test Report"

#### Example

```bash
# Terminal 1: Start web server
npm run web

# Browser: Open http://localhost:3001
# Upload samples/petstore.yaml
# Click "Process & Generate Tests"
# View results in browser
```

**⚠️ Note:** Mutation testing via web UI may timeout due to browser limitations. For mutation testing, use the CLI method below.

---

### 2. 💻 CLI (Command Line Interface)

**Best for:** Automation, CI/CD pipelines, developers, comprehensive testing

#### Basic Usage

```bash
npm run cli -- <path-to-your-openapi-file>
```

#### Examples

```bash
# Test with petstore.yaml
npm run cli -- samples/petstore.yaml

# Test with custom OpenAPI file
npm run cli -- path/to/your/api-spec.yaml

# Generate JSON report only
npm run cli -- samples/petstore.yaml --format json

# Custom output directory
npm run cli -- samples/petstore.yaml --out-dir ./my-results

# Generate tests only (skip execution)
npm run cli -- samples/petstore.yaml --no-test

# Skip report generation
npm run cli -- samples/petstore.yaml --no-report

# Verbose output (see detailed progress)
npm run cli -- samples/petstore.yaml --verbose

# Show help
npm run cli -- --help
```

#### CLI Options

| Option | Description | Example |
|--------|-------------|---------|
| `--out-dir <dir>` | Custom output directory for reports | `--out-dir ./results` |
| `--test-dir <dir>` | Custom directory for generated tests | `--test-dir ./my-tests` |
| `--report-dir <dir>` | Custom directory for reports | `--report-dir ./reports` |
| `--format <format>` | Report format: `json`, `html`, or `both` | `--format json` |
| `--no-report` | Skip report generation | `--no-report` |
| `--no-test` | Skip test execution (generate only) | `--no-test` |
| `--verbose` | Show detailed progress output | `--verbose` |

#### What the CLI Does

1. ✅ Parses your OpenAPI specification
2. ✅ Generates Express.js API implementation automatically
3. ✅ Generates comprehensive Jest test suite
4. ✅ Executes all tests
5. ✅ Generates HTML and/or JSON reports
6. ✅ Shows results in terminal

---

### 3. 🧪 Individual Commands (Advanced)

**Best for:** Custom workflows, step-by-step control

#### Step-by-Step Pipeline

```bash
# Step 1: Generate API implementation from OpenAPI spec
# (Done automatically by CLI, but you can do it manually)
tsx src/generateApi.ts <input-yaml> <output-ts-file>

# Step 2: Generate test suite from OpenAPI spec
npm run gen:http
# Or manually:
tsx src/generateHttpTests.ts <input-yaml> <output-test-file> <app-path>

# Step 3: Run tests
npm run test

# Step 4: Generate test results JSON
npm run test:json

# Step 5: Generate HTML report
npm run report

# Or do it all at once:
npm run test:report
```

#### Mutation Testing

For comprehensive quality assessment:

```bash
npm run mutation
```

This runs Stryker mutation testing, which:
- Creates mutations of your code
- Runs tests against each mutation
- Reports which mutations were caught (killed) vs survived
- Provides a mutation score (higher = better test quality)

**⏱️ Time:** Takes 5-10 minutes depending on codebase size

---

## 📊 Understanding Results

### Test Results

After running tests, you'll see:

```
PASS tests/generated.http.spec.ts
  Generated HTTP tests
    ✓ list pets (GET) → expects [200, 404] (12 ms)
    ✓ create pet (POST) → expects [201, 400] (13 ms)
    ✓ get pet (GET) → expects [200, 404] (6 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

### HTML Report

The HTML report shows:
- **Summary Statistics:** Total tests, passed, failed
- **Detailed Test Results:** Each test with status and timing
- **Visual Feedback:** Color-coded results (green = pass, red = fail)

### Mutation Testing Report

The mutation report shows:
- **Mutation Score:** Percentage of mutations caught by tests
- **Killed Mutations:** Bugs that tests would catch
- **Survived Mutations:** Potential gaps in test coverage
- **Detailed Breakdown:** Per-file mutation analysis

---

## 📁 Project Structure

After running tests, your project will have:

```
restally/
├── samples/
│   ├── petstore.yaml              # Your OpenAPI specs
│   ├── generated-app.ts           # Auto-generated API implementation
│   └── ...
├── tests/
│   ├── generated.http.spec.ts     # Auto-generated test suite
│   └── ...
└── reports/
    ├── index.html                 # HTML test report
    ├── jest.json                  # JSON test results
    └── mutation/
        └── mutation.html          # Mutation testing report
```

---

## 🎓 Common Use Cases

### Use Case 1: Quick API Validation

**Goal:** Quickly check if your API implementation matches the OpenAPI spec

```bash
# Use web UI for fastest results
npm run web
# Then upload your OpenAPI file in browser
```

### Use Case 2: CI/CD Integration

**Goal:** Automate API testing in your pipeline

```bash
# In your CI/CD script:
npm run cli -- api-spec.yaml --format json --out-dir ./test-results
# Check exit code (0 = success, non-zero = failure)
```

### Use Case 3: Comprehensive Quality Assessment

**Goal:** Full quality analysis including mutation testing

```bash
# Generate and run tests
npm run cli -- api-spec.yaml --verbose

# Run mutation testing separately (takes time)
npm run mutation
```

### Use Case 4: Testing Multiple API Specs

**Goal:** Test several OpenAPI specifications

```bash
for spec in specs/*.yaml; do
  echo "Testing $spec..."
  npm run cli -- "$spec" --out-dir "results/$(basename $spec .yaml)"
done
```

---

## ❓ Troubleshooting

### Problem: Tests fail with "Cannot find module"

**Solution:** Ensure the generated API file exists and path is correct.

```bash
# Regenerate API and tests
npm run cli -- samples/petstore.yaml
```

### Problem: Web UI times out during mutation testing

**Solution:** Mutation testing takes 5-10 minutes. Use CLI instead:

```bash
npm run mutation
```

### Problem: "OpenAPI spec validation failed"

**Solution:** Check your OpenAPI file is valid:

```bash
# Use online validator: https://editor.swagger.io/
# Or check with swagger-parser
npx @apidevtools/swagger-parser validate your-spec.yaml
```

### Problem: "Test results JSON file not found"

**Solution:** Tests may have failed to execute. Check:

1. API was generated successfully
2. Test file was created
3. Express app path is correct

Try running tests manually:

```bash
npm run test
```

---

## 🔍 Example Workflows

### Complete Workflow Example

```bash
# 1. Start with an OpenAPI spec
ls samples/petstore.yaml

# 2. Run complete pipeline via CLI
npm run cli -- samples/petstore.yaml --verbose

# Output shows:
# ✅ Step 1: Generating API implementation...
# ✅ Step 2: Generating test suite...
# ✅ Step 3: Running tests...
# ✅ Step 4: Generating reports...

# 3. View results
open reports/index.html

# 4. Run mutation testing (optional, comprehensive)
npm run mutation

# 5. View mutation results
open reports/mutation/mutation.html
```

### Development Workflow

```bash
# Iterative development:
# 1. Make changes to API spec
vim api-spec.yaml

# 2. Regenerate and test
npm run cli -- api-spec.yaml

# 3. Check results
cat reports/jest.json | jq '.numPassedTests'

# 4. Repeat until all tests pass
```

---

## 📚 Additional Resources

- **OpenAPI Specification:** https://swagger.io/specification/
- **Jest Documentation:** https://jestjs.io/
- **Stryker Mutation Testing:** https://stryker-mutator.io/

---

## 💡 Tips & Best Practices

1. **Start Simple:** Use web UI for first-time users
2. **Automate:** Use CLI for CI/CD pipelines
3. **Test Early:** Run tests after every API spec change
4. **Mutation Testing:** Run weekly for comprehensive quality checks
5. **Version Control:** Commit your OpenAPI specs and generated reports
6. **Keep Specs Updated:** Ensure OpenAPI specs reflect actual API behavior

---

## 🆘 Getting Help

If you encounter issues:

1. Check this usage guide
2. Review the main README.md
3. Check architecture docs in `docs/ARCHITECTURE.md`
4. Open an issue on GitHub

---

**Happy Testing! 🚀**

