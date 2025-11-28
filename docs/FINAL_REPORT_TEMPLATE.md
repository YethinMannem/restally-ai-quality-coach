# RestAlly: AI-Assisted Quality Coach for REST APIs
## Final Report - Software Construction Course

**Author:** [Your Name]  
**Course:** CSCI 717 - Software Construction  
**Date:** [Submission Date]  
**GitHub Repository:** https://github.com/YethinMannem/restally-ai-quality-coach

---

## 1. Introduction & Motivation

### 1.1 Project Overview

RestAlly is an AI-assisted quality coach for REST APIs that automatically generates comprehensive test suites from OpenAPI 3.0 specifications. The tool provides end-to-end automation: from parsing OpenAPI specs to generating API implementations, creating test cases, executing them, and producing detailed quality reports.

### 1.2 Problem Statement

[Expand on: Why API testing is challenging, importance of quality assurance, etc.]

### 1.3 AI/Automation Relevance

[Expand on: How automated test generation is AI-like, code generation capabilities, intelligent schema inference, etc.]

### 1.4 Objectives

- Demonstrate software construction principles through a practical tool
- Provide automated quality assurance for REST APIs
- Showcase modular, maintainable architecture
- Generate evidence of bug-safety, clarity, and adaptability

---

## 2. Architecture & Design

### 2.1 System Architecture

[Include your architecture diagram here - can use ASCII from ARCHITECTURE.md or create visual]

```
[Paste architecture diagram]
```

### 2.2 Component Overview

**Key Components:**

1. **Parser Layer** (`src/routeMatrix.ts`)
   - Parses OpenAPI specifications
   - Extracts route information
   - Validates spec structure

2. **API Generator** (`src/generateApi.ts`)
   - Generates Express.js API implementation from OpenAPI spec
   - Handles path parameters, methods, responses
   - Creates mock endpoints

3. **Test Generator** (`src/generateHttpTests.ts`)
   - Generates Jest test suites
   - Creates HTTP tests for all endpoints
   - Materializes path parameters
   - Generates request bodies from schemas

4. **Validator** (`src/validate.ts`)
   - Validates responses against OpenAPI schemas
   - Type checking and schema compliance

5. **Report Generator** (`src/report/makeHtmlReport.ts`)
   - Generates HTML reports from test results
   - Provides visual test metrics

6. **CLI Interface** (`src/cli.ts`)
   - Unified command-line interface
   - Orchestrates entire pipeline

7. **Web UI** (`src/web/server.ts`)
   - Browser-based interface
   - File upload and result viewing
   - User-friendly dashboard

### 2.3 Design Patterns

- **Modular Design:** Each component has single responsibility
- **Separation of Concerns:** Clear boundaries between parsing, generation, validation, reporting
- **Abstraction Barriers:** Clean interfaces between modules
- **Dependency Injection:** Configurable app paths, test directories

### 2.4 Data Flow

[Include data flow diagram]

---

## 3. Implementation Details

### 3.1 Technology Stack

- **TypeScript 5.5+** - Type-safe development
- **Node.js 20+** - Runtime environment
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library
- **Stryker** - Mutation testing
- **Swagger Parser** - OpenAPI validation
- **Express.js** - Sample API implementation
- **Multer** - File upload handling

### 3.2 Key Implementation Decisions

#### 3.2.1 TypeScript Strict Mode

We enabled TypeScript strict mode with additional safety flags:

```typescript
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true
}
```

This provides compile-time error detection and prevents common bugs.

#### 3.2.2 ESM (ECMAScript Modules)

Using ES modules for modern JavaScript support and better tree-shaking:

```json
{
  "type": "module"
}
```

#### 3.2.3 In-Memory Testing

Tests use Supertest with Express app directly, eliminating network overhead:

```typescript
import { app } from '../samples/app.js';
const res = await request(app).get('/pets');
```

### 3.3 Core Algorithms

#### 3.3.1 Test Generation Algorithm

[Explain how tests are generated from OpenAPI specs]

#### 3.3.2 Schema-Driven Body Generation

[Explain how request bodies are generated from schemas]

#### 3.3.3 Path Parameter Materialization

[Explain how path parameters are converted to concrete values]

### 3.4 Code Organization

```
src/
├── routeMatrix.ts      # Route parsing
├── generateApi.ts      # API generation
├── generateHttpTests.ts # Test generation
├── validate.ts         # Schema validation
├── cli.ts             # CLI interface
├── web/               # Web UI
│   └── server.ts
└── report/            # Report generation
    └── makeHtmlReport.ts
```

---

## 4. Quality Measures & Testing

### 4.1 Testing Strategy

**Multi-Layer Testing Approach:**

1. **Automated Test Generation**
   - Tests generated from OpenAPI specs
   - Covers all defined endpoints
   - Validates status codes and schemas

2. **Unit Testing**
   - Core functions testable in isolation
   - Mock-friendly design
   - Clear interfaces

3. **Integration Testing**
   - End-to-end pipeline testing
   - Generated tests validate actual API
   - Full workflow validation

4. **Mutation Testing**
   - Stryker validates test quality
   - Identifies weak test coverage
   - Ensures tests actually catch bugs

### 4.2 Automated Test Generation

[Show example of generated tests]

```typescript
// Example generated test
it('list pets (GET) → expects [200, 404]', async () => {
  const res = await request(app).get('/pets');
  expect(['200', '404']).toContain(String(res.status));
});
```

### 4.3 Mutation Testing Results

**Configuration:**
- Mutation threshold: High 80%, Low 60%
- Coverage analysis: perTest
- TypeScript checker enabled

**Results:**
[Include screenshot of mutation test report]

- Total mutations: [X]
- Killed: [Y] ([Z]%)
- Survived: [W]
- Mutation score: [Score]%

[Explain what this means - evidence that tests actually catch bugs]

### 4.4 Type Safety

**TypeScript Strict Mode Benefits:**

Example of bug caught at compile time:

```typescript
// This would be caught by TypeScript
const value = obj.property; // Error if property might not exist
```

[Include examples of TypeScript catching errors]

### 4.5 Code Quality Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript Compiler** - Type checking
- **Stryker** - Mutation testing

---

## 5. Evidence of Quality Principles

### 5.1 Safety from Bugs

#### 5.1.1 Static Type Checking

[Show TypeScript catching errors at compile time]

**Example:**
```typescript
// TypeScript prevents this error:
function processData(data: string[]) {
  return data[10].toUpperCase(); // Error: possibly undefined
}
```

#### 5.1.2 Automated Testing

[Show generated tests catching bugs]

#### 5.1.3 Mutation Testing

[Show mutation test results as evidence that tests are effective]

#### 5.1.4 Defensive Programming

**Example from codebase:**
```typescript
try {
  const doc = await SwaggerParser.validate(specPath);
  // Process document
} catch (error: any) {
  console.error('❌', error.message);
  process.exit(1);
}
```

#### 5.1.5 Input Validation

[Show OpenAPI spec validation, schema validation, etc.]

### 5.2 Ease of Understanding

#### 5.2.1 Clear Module Boundaries

**Module Structure:**
```
┌──────────────────┐
│   routeMatrix    │ → Route parsing only
└──────────────────┘

┌──────────────────┐
│ generateHttpTests│ → Test generation only
└──────────────────┘

┌──────────────────┐
│    validate      │ → Validation only
└──────────────────┘
```

[Explain how each module has single responsibility]

#### 5.2.2 Meaningful Names

**Examples:**
- `generateHttpTests()` - clearly generates HTTP tests
- `validateAgainstSchema()` - validates against schema
- `toMatrix()` - converts to matrix format
- `materializePath()` - converts abstract path to concrete

#### 5.2.3 Readable Code

**Example:**
```typescript
function pickSuccessStatus(statuses: string[]): string | undefined {
  // Try 2xx status codes in order of preference
  for (const target of ['201', '200', '202', '204']) {
    if (statuses.includes(target)) return target;
  }
  return undefined;
}
```

[Explain why this is readable]

#### 5.2.4 Documentation

- Comprehensive README.md
- Architecture documentation
- Inline code comments
- Type annotations serve as documentation

### 5.3 Ease of Change

#### 5.3.1 Modular Design

[Explain how modules are independent and can be changed without affecting others]

#### 5.3.2 Refactoring Example: Hardcoded → Generic

**Before (hardcoded for petstore):**
```typescript
// Hardcoded request body
const body = { name: "Fluffy", tag: "cat" };
```

**After (generic, schema-driven):**
```typescript
// Generated from OpenAPI schema
const requestBody = generateRequestBodyFromSchema(
  item.post.requestBody, 
  components
);
```

[Explain how this refactoring demonstrates ease of change]

#### 5.3.3 Extension Example: Adding Web UI

[Explain how web UI was added without changing core modules]

**Evidence:**
- Core modules unchanged
- New module added (`src/web/server.ts`)
- Existing functionality preserved

#### 5.3.4 Separation of Concerns

[Show how concerns are separated and can be changed independently]

- Test generation ≠ Test execution
- Report generation ≠ Test results
- API generation ≠ Test generation

#### 5.3.5 Git History Evidence

[Show commits demonstrating evolution and refactoring]

Key commits:
- `7a8eacc` - Made implementation generic
- `4819a25` - Added web UI
- `ea51fd0` - Added CLI interface

Each addition/modification maintained modularity.

---

## 6. Reflection & Lessons Learned

### 6.1 What Worked Well

[Reflect on:]
- Modular architecture paying off
- TypeScript catching errors early
- Automated test generation saving time
- Clear separation of concerns

### 6.2 Challenges Faced

[Reflect on:]
- ESM configuration complexity
- Balancing genericity vs. simplicity
- Test generation edge cases
- Path parameter materialization

### 6.3 Design Decisions That Paid Off

[Reflect on:]
- Choosing TypeScript for type safety
- Modular architecture
- In-memory testing approach
- Generic implementation from the start

### 6.4 What Would I Do Differently

[Reflect on:]
- Earlier focus on mutation testing
- More comprehensive unit tests
- Better error messages
- Earlier documentation

### 6.5 Key Takeaways

[Reflect on:]
- Importance of modular design
- Value of type safety
- Benefits of automation
- Significance of testing infrastructure

---

## 7. Conclusion

RestAlly successfully demonstrates the three core software construction principles:

1. **Safety from Bugs** - Through TypeScript strict mode, automated testing, and mutation testing
2. **Ease of Understanding** - Through clear module boundaries, meaningful names, and comprehensive documentation
3. **Ease of Change** - Through modular design, separation of concerns, and demonstrated refactoring

The project provides a practical tool for API quality assurance while serving as an exemplar of quality software construction.

---

## 8. References

- OpenAPI Specification: https://swagger.io/specification/
- TypeScript Documentation: https://www.typescriptlang.org/
- Jest Documentation: https://jestjs.io/
- Stryker Documentation: https://stryker-mutator.io/

---

## Appendix A: Screenshots

- Mutation test results
- Test execution results
- HTML report examples
- Web UI screenshots
- Architecture diagrams

---

## Appendix B: Code Examples

- Full test generation example
- Schema validation example
- Refactoring before/after
- Extension point example

