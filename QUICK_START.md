# 🚀 RestAlly Quick Start Guide

Get up and running with RestAlly in 3 minutes!

---

## Step 1: Install

```bash
# Clone the repository
git clone https://github.com/YethinMannem/restally-ai-quality-coach.git
cd restally-ai-quality-coach

# Install dependencies
npm install
```

---

## Step 2: Choose Your Method

### Option A: Web UI (Easiest! 🎯)

**Best for:** Beginners, quick tests, visual feedback

```bash
# Start the web server
npm run web
```

Then open `http://localhost:3001` in your browser and upload your OpenAPI YAML file!

---

### Option B: Command Line (Fastest! ⚡)

**Best for:** Developers, automation, CI/CD

```bash
# Test your OpenAPI file
npm run cli -- samples/petstore.yaml

# Or test your own file
npm run cli -- path/to/your/api-spec.yaml
```

That's it! Results are in `reports/index.html`

---

### Option C: Full Pipeline (Most Complete! 🔬)

**Best for:** Comprehensive quality assessment

```bash
# Generate and run tests
npm run cli -- samples/petstore.yaml

# Then run mutation testing (takes 5-10 minutes)
npm run mutation
```

View reports in:
- `reports/index.html` - Test results
- `reports/mutation/mutation.html` - Mutation test results

---

## Step 3: View Results

Open the HTML report:

```bash
# macOS
open reports/index.html

# Linux
xdg-open reports/index.html

# Windows
start reports/index.html
```

Or use the web UI to view results directly in your browser!

---

## 📚 Need More Help?

- **Detailed Guide:** See [docs/USAGE_GUIDE.md](docs/USAGE_GUIDE.md)
- **Architecture:** See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Full README:** See [README.md](README.md)

---

## 🎯 Common Commands

```bash
# Web UI
npm run web

# CLI - basic usage
npm run cli -- samples/petstore.yaml

# CLI - verbose output
npm run cli -- samples/petstore.yaml --verbose

# CLI - custom output directory
npm run cli -- samples/petstore.yaml --out-dir ./my-results

# Mutation testing
npm run mutation

# View help
npm run cli -- --help
```

---

**That's it! You're ready to test your REST APIs! 🎉**

