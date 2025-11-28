# 🚀 RestAlly - AI-Assisted Quality Coach for REST APIs

**RestAlly** is an intelligent TypeScript tool that automatically generates comprehensive test suites from OpenAPI specifications and provides quality assurance for REST API implementations.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Usage](#-usage)
  - [Web UI](#web-ui)
  - [CLI Interface](#cli-interface)
  - [Individual Commands](#individual-commands)
- [Documentation](#-documentation)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 Core Capabilities

- **📄 OpenAPI Parsing**: Automatically parses OpenAPI 3.0 specifications
- **🧪 Test Generation**: Generates comprehensive Jest test suites from API specs
- **✅ Schema Validation**: Validates API responses against OpenAPI schemas
- **📊 HTML Reports**: Beautiful, professional test reports with detailed metrics
- **🧬 Mutation Testing**: Quality assurance through Stryker mutation testing
- **⚡ Fast Execution**: In-memory testing with Supertest (no external server needed)
- **🔧 CLI Interface**: Unified command-line interface for end-to-end automation

### 🏗️ Software Construction Principles

- **Safety from Bugs**: Static typing, schema validation, comprehensive testing
- **Ease of Understanding**: Modular architecture, clear naming, comprehensive documentation
- **Ease of Change**: Separation of concerns, independent modules, extensible design

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ and npm
- An **OpenAPI 3.0 specification** file (YAML or JSON)

### Installation

```bash
# Clone the repository
git clone https://github.com/YethinMannem/restally-ai-quality-coach.git
cd restally-ai-quality-coach

# Install dependencies
npm install
```

### Three Ways to Use RestAlly

#### 1. 🌐 **Web UI** (Easiest for Beginners)

```bash
npm run web
# Then open http://localhost:3001 in your browser
# Upload your OpenAPI YAML file and view results!
```

#### 2. 💻 **CLI** (Best for Developers)

```bash
npm run cli -- samples/petstore.yaml
# Or use your own OpenAPI file
npm run cli -- path/to/your/api-spec.yaml
```

#### 3. 🔬 **Full Pipeline** (Most Comprehensive)

```bash
# Generate and run tests
npm run cli -- samples/petstore.yaml

# Run mutation testing for quality assessment
npm run mutation
```

📖 **For detailed instructions, see [QUICK_START.md](QUICK_START.md) or [docs/USAGE_GUIDE.md](docs/USAGE_GUIDE.md)**

---

## 📖 Usage

> **📚 New to RestAlly?** Start with the [Quick Start Guide](QUICK_START.md) or [Detailed Usage Guide](docs/USAGE_GUIDE.md)

### Web UI

The easiest way to use RestAlly - perfect for beginners and quick tests:

```bash
# Start the web server
npm run web
```

Then:
1. Open `http://localhost:3001` in your browser
2. Upload your OpenAPI YAML file
3. Click "Process & Generate Tests"
4. View results and reports

### CLI Interface

### Command-Line Interface

The RestAlly CLI provides a unified interface for the complete testing pipeline:

```bash
# Basic usage
npm run cli -- samples/petstore.yaml

# Generate JSON report only
npm run cli -- samples/petstore.yaml --format json

# Custom output directory
npm run cli -- samples/petstore.yaml --out-dir ./results

# Generate tests only (skip execution)
npm run cli -- samples/petstore.yaml --no-test

# Skip report generation
npm run cli -- samples/petstore.yaml --no-report

# Verbose output
npm run cli -- samples/petstore.yaml --verbose

# Show help
npm run cli -- --help
```

### Individual Commands

```bash
# Parse OpenAPI spec and show route matrix
npm run dev

# Generate tests from OpenAPI spec
npm run gen:http

# Run generated tests
npm run test

# Generate JSON test results
npm run test:json

# Generate HTML report
npm run report

# Complete pipeline (generate → test → report)
npm run test:report

# Run mutation testing
npm run mutation
```

---

## 📚 Documentation

Comprehensive guides are available:

- **[Quick Start Guide](QUICK_START.md)** - Get started in 3 minutes
- **[Detailed Usage Guide](docs/USAGE_GUIDE.md)** - Complete usage instructions and examples
- **[Architecture Documentation](docs/ARCHITECTURE.md)** - System design and components
- **[Final Report Assessment](docs/FINAL_REPORT_ASSESSMENT.md)** - Project requirements compliance

---

## 🏗️ Architecture

RestAlly follows a modular architecture with clear separation of concerns:

```
┌─────────────────┐
│  OpenAPI Spec   │
│  (YAML/JSON)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Parser Layer   │
│  (SwaggerParser)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│ Route Matrix    │      │ Test Generator  │
│  Generator      │      │   (Jest)        │
└─────────────────┘      └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │  Test Runner    │
                          │  (Supertest)    │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ Report Generator│
                          │   (HTML/JSON)   │
                          └─────────────────┘
```

### Key Components

1. **Parser** (`src/routeMatrix.ts`): Converts OpenAPI docs to structured route data
2. **Generator** (`src/generateHttpTests.ts`): Creates Jest test suites automatically
3. **Validator** (`src/validate.ts`): Validates responses against JSON schemas
4. **Reporter** (`src/report/makeHtmlReport.ts`): Generates beautiful HTML reports
5. **CLI** (`src/cli.ts`): Unified command-line interface

---

## 📁 Project Structure

```
restally/
├── src/                          # Core source code
│   ├── index.ts                  # Route matrix CLI
│   ├── routeMatrix.ts            # OpenAPI → route matrix
│   ├── generateHttpTests.ts      # Test generation engine
│   ├── validate.ts               # Schema validation
│   ├── cli.ts                    # Unified CLI interface
│   └── report/
│       └── makeHtmlReport.ts     # HTML report generator
├── samples/                      # Example implementation
│   ├── petstore.yaml            # OpenAPI 3.0 specification
│   ├── app.ts                   # Express.js API implementation
│   └── server.ts                # Server startup script
├── tests/                        # Generated and manual tests
│   ├── generated.http.spec.ts   # Auto-generated test suite
│   ├── global.setup.ts          # Test setup automation
│   └── setup.server.ts          # Server setup utilities
├── reports/                      # Generated outputs
│   ├── index.html               # HTML test report
│   ├── jest.json                # JSON test results
│   └── mutation/                # Mutation testing reports
├── jest.config.cjs               # Jest configuration
├── stryker.conf.json            # Mutation testing config
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

---

## 🛠️ Development

### Technology Stack

- **TypeScript** 5.5+ - Type-safe development
- **Node.js** 20+ - Runtime environment
- **Express.js** - Sample API implementation
- **Jest** + **ts-jest** - Testing framework
- **Supertest** - HTTP assertion library
- **Stryker** - Mutation testing
- **Swagger Parser** - OpenAPI validation

### Development Workflow

1. **Make changes** to source code
2. **Run tests** to verify functionality: `npm run test`
3. **Generate reports** to see results: `npm run test:report`
4. **Run mutation testing** to assess test quality: `npm run mutation`

### Code Quality

- **TypeScript strict mode** enabled
- **ESLint** for code linting
- **Prettier** for code formatting
- **Mutation testing** for test quality assurance

---

## 🧪 Testing

### Test Generation

Tests are automatically generated from OpenAPI specifications:

```bash
npm run gen:http
```

This creates `tests/generated.http.spec.ts` with:
- GET endpoint tests with status validation
- POST endpoint tests with request bodies
- Path parameter materialization

### Test Execution

```bash
# Run all tests
npm run test

# Run with JSON output
npm run test:json

# Complete pipeline with HTML report
npm run test:report
```

### Mutation Testing

Assess test quality with Stryker:

```bash
npm run mutation
```

This will:
- Generate mutations of your code
- Run tests against each mutation
- Report which mutations were caught (killed) vs survived
- Provide a mutation score

---

## 📊 Example Output

### Route Matrix

```
Method  Path            Statuses        Summary
------  --------------  --------------  --------------------
GET     /pets           200,404         list pets
POST    /pets           201,400         create pet
GET     /pets/{id}      200,404         get pet
```

### Test Results

```
PASS tests/generated.http.spec.ts
  Generated HTTP tests
    ✓ list pets (GET) → expects [200, 404] (14 ms)
    ✓ create pet (POST) → expects [201, 400] (14 ms)
    ✓ get pet (GET) → expects [200, 404] (4 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

---

## 🎯 Use Cases

- **API Development**: Ensure implementations match OpenAPI specifications
- **CI/CD Integration**: Automated testing in continuous integration pipelines
- **Documentation Validation**: Verify API documentation accuracy
- **Quality Assurance**: Comprehensive test coverage with mutation testing
- **Educational**: Learn API testing best practices

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built for Software Construction course project
- Inspired by the need for automated API quality assurance
- Uses industry-standard tools: Jest, Supertest, Stryker, Swagger Parser

---

## 📧 Contact

**Yethin Mannem**
- GitHub: [@YethinMannem](https://github.com/YethinMannem)
- Repository: [restally-ai-quality-coach](https://github.com/YethinMannem/restally-ai-quality-coach)

---

## 🗺️ Roadmap

### Completed ✅
- [x] OpenAPI parsing and route matrix analysis
- [x] Automatic test generation (GET & POST)
- [x] Response schema validation
- [x] HTML report generation
- [x] Mutation testing integration
- [x] Unified CLI interface

### Future Enhancements 🔮
- [ ] Schema-driven request body generation
- [ ] Response body validation in generated tests
- [ ] Unit tests for core modules
- [ ] Developer dashboard (optional)
- [ ] AI-powered test result explanations

---

**Made with ❤️ for API Quality Assurance**
