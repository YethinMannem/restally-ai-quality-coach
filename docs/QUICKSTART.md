# 🚀 RestAlly Quick Start Guide

Get up and running with RestAlly in 5 minutes!

## Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- Basic understanding of OpenAPI specifications

## Installation

```bash
# Clone the repository
git clone https://github.com/YethinMannem/restally-ai-quality-coach.git
cd restally-ai-quality-coach

# Install dependencies
npm install
```

## Your First Test

### Step 1: Prepare Your OpenAPI Spec

Create or use an existing OpenAPI specification file. The project includes a sample:

```bash
# View the sample spec
cat samples/petstore.yaml
```

### Step 2: Generate Tests

```bash
# Generate tests from the OpenAPI spec
npm run gen:http
```

This creates `tests/generated.http.spec.ts` with automated tests.

### Step 3: Run Tests

```bash
# Execute the generated tests
npm run test
```

You should see:
```
PASS tests/generated.http.spec.ts
  Generated HTTP tests
    ✓ list pets (GET) → expects [200, 404] (14 ms)
    ✓ create pet (POST) → expects [201, 400] (14 ms)
    ✓ get pet (GET) → expects [200, 404] (4 ms)
```

### Step 4: Generate Report

```bash
# Generate HTML report
npm run test:report
```

Open `reports/index.html` in your browser to see the beautiful test report!

## Using the CLI

The easiest way to run everything:

```bash
# One command does it all!
npm run cli -- samples/petstore.yaml
```

This will:
1. ✅ Generate tests
2. ✅ Run tests
3. ✅ Generate HTML report

## Common Workflows

### Workflow 1: Quick Validation

```bash
# Just see what endpoints exist
npm run dev
```

### Workflow 2: Full Pipeline

```bash
# Complete testing pipeline
npm run test:report
```

### Workflow 3: Custom Configuration

```bash
# Generate JSON report only
npm run cli -- samples/petstore.yaml --format json

# Custom output directory
npm run cli -- samples/petstore.yaml --out-dir ./my-results
```

## Next Steps

1. **Customize Your API**: Update `samples/app.ts` with your API implementation
2. **Modify Your Spec**: Edit `samples/petstore.yaml` to match your API
3. **Run Mutation Testing**: `npm run mutation` to assess test quality
4. **Read the Docs**: Check out [ARCHITECTURE.md](./ARCHITECTURE.md) for details

## Troubleshooting

### Issue: Tests fail with "Cannot find module"

**Solution**: Make sure you've run `npm install` and all dependencies are installed.

### Issue: OpenAPI spec not found

**Solution**: Check that your spec file path is correct and the file exists.

### Issue: Tests timeout

**Solution**: Check your Express app implementation in `samples/app.ts`.

## Getting Help

- 📖 Read the [README](../README.md)
- 🏗️ Check [ARCHITECTURE.md](./ARCHITECTURE.md)
- 🐛 Open an issue on GitHub

---

**Happy Testing! 🎉**
