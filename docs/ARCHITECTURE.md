# 🏗️ RestAlly Architecture Documentation

## Overview

RestAlly follows a **modular, extensible architecture** that separates concerns and enables easy extension. The system is built with TypeScript for type safety and follows software construction best practices.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenAPI Specification                     │
│                  (YAML or JSON format)                       │
└───────────────────────────┬─────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Parser Layer                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SwaggerParser                                       │  │
│  │  - Validates OpenAPI spec                            │  │
│  │  - Parses structure                                  │  │
│  │  - Resolves references                               │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
        ┌──────────────────┐  ┌──────────────────┐
        │  Route Matrix     │  │  Test Generator  │
        │  Generator        │  │                  │
        │                   │  │                  │
        │  - Extracts       │  │  - Analyzes      │
        │    endpoints      │  │    paths         │
        │  - Methods        │  │  - Methods      │
        │  - Status codes   │  │  - Responses    │
        │  - Summaries      │  │  - Schemas      │
        └──────────────────┘  └────────┬─────────┘
                                       │
                                       ▼
                            ┌──────────────────┐
                            │  Jest Test Suite  │
                            │  Generation       │
                            │                   │
                            │  - GET tests      │
                            │  - POST tests     │
                            │  - Status checks  │
                            │  - Path params    │
                            └────────┬──────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │  Test Execution  │
                            │                  │
                            │  - Supertest     │
                            │  - Express app   │
                            │  - In-memory     │
                            └────────┬──────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
        ┌──────────────────┐            ┌──────────────────┐
        │  JSON Results    │            │  HTML Report     │
        │                  │            │                  │
        │  - Test data    │            │  - Visual UI     │
        │  - Metrics      │            │  - Statistics    │
        │  - Timings      │            │  - Test details  │
        └──────────────────┘            └──────────────────┘
```

## Component Details

### 1. Parser Layer (`src/routeMatrix.ts`)

**Responsibility**: Convert OpenAPI documents to structured route data

**Key Functions**:
- `toMatrix(doc)`: Converts OpenAPI doc to route matrix
- `printMatrix(rows)`: Displays formatted route matrix

**Input**: OpenAPI.Document
**Output**: Array of Route objects with method, path, statuses, summary

### 2. Test Generator (`src/generateHttpTests.ts`)

**Responsibility**: Generate Jest test suites from OpenAPI specifications

**Key Functions**:
- `generateHttpTests(specPath, outFile)`: Main generation function
- `pickSuccessStatus(statuses)`: Selects appropriate success status
- `materializePath(path)`: Converts path params to concrete values
- `minimalBodyFor(path)`: Generates minimal request bodies

**Input**: OpenAPI spec path, output file path
**Output**: Jest test suite file

**Features**:
- GET endpoint test generation
- POST endpoint test generation
- Path parameter materialization
- Status code validation

### 3. Schema Validator (`src/validate.ts`)

**Responsibility**: Validate JSON data against OpenAPI schemas

**Key Functions**:
- `validateAgainstSchema(schema, data)`: Main validation function
- `isPrimitiveTypeMatch(value, type)`: Type checking

**Supported Types**:
- Primitives: string, number, integer, boolean
- Arrays: with item validation
- Objects: with required fields and property validation

### 4. Report Generator (`src/report/makeHtmlReport.ts`)

**Responsibility**: Generate beautiful HTML reports from test results

**Key Functions**:
- `buildHtml(summary)`: Constructs HTML report
- `esc(s)`: HTML escaping
- `fmtMs(ms)`: Duration formatting

**Output**: Professional HTML report with:
- Test summary statistics
- Detailed test results table
- Status color coding
- Timestamps

### 5. CLI Interface (`src/cli.ts`)

**Responsibility**: Unified command-line interface

**Key Features**:
- Single command execution
- Configurable options
- Progress reporting
- Error handling

**Options**:
- `--out-dir`: Custom output directory
- `--format`: Report format (json/html/both)
- `--no-test`: Skip test execution
- `--no-report`: Skip report generation
- `--verbose`: Detailed output

## Data Flow

### Test Generation Flow

```
OpenAPI Spec
    │
    ├─→ Parse with SwaggerParser
    │
    ├─→ Extract paths and operations
    │
    ├─→ For each endpoint:
    │   ├─→ Determine HTTP method
    │   ├─→ Extract response statuses
    │   ├─→ Materialize path parameters
    │   ├─→ Generate request body (if POST)
    │   └─→ Write Jest test code
    │
    └─→ Output: tests/generated.http.spec.ts
```

### Test Execution Flow

```
Generated Test File
    │
    ├─→ Jest loads test file
    │
    ├─→ Import Express app
    │
    ├─→ For each test:
    │   ├─→ Supertest makes HTTP request
    │   ├─→ Express app handles request
    │   ├─→ Validate response status
    │   └─→ Record result
    │
    └─→ Output: Test results (console + JSON)
```

### Report Generation Flow

```
Test Results (JSON)
    │
    ├─→ Parse JSON data
    │
    ├─→ Extract statistics:
    │   ├─→ Total tests
    │   ├─→ Passed/Failed/Skipped
    │   └─→ Test suites
    │
    ├─→ Build HTML structure:
    │   ├─→ Summary cards
    │   ├─→ Test results table
    │   └─→ Styling
    │
    └─→ Output: reports/index.html
```

## Design Patterns

### 1. **Modular Design**
Each component has a single, well-defined responsibility:
- Parser: Only parses OpenAPI
- Generator: Only generates tests
- Validator: Only validates schemas
- Reporter: Only generates reports

### 2. **Separation of Concerns**
- Business logic separated from I/O
- Test generation separated from test execution
- Report generation separated from test results

### 3. **Extensibility**
- Easy to add new HTTP methods
- Easy to add new report formats
- Easy to extend validation rules

## Error Handling

### Validation Errors
- OpenAPI spec validation errors are caught and reported
- File system errors are handled gracefully
- Test execution errors are captured in reports

### Error Messages
- Clear, actionable error messages
- Suggests solutions when possible
- Verbose mode for debugging

## Performance Considerations

### Test Execution
- In-memory Express app (no network overhead)
- Fast test execution (~30ms per test)
- Parallel test execution support (via Jest)

### Report Generation
- Efficient HTML generation
- Minimal file I/O operations
- Fast rendering

## Security Considerations

### Input Validation
- OpenAPI spec validation prevents malformed input
- Path parameter sanitization
- Request body validation

### File System
- Safe file path handling
- Directory creation with proper permissions
- No arbitrary file access

## Testing Strategy

### Unit Tests
- Core functions are testable in isolation
- Mock-friendly design
- Clear interfaces

### Integration Tests
- End-to-end pipeline testing
- Generated tests validate actual API

### Mutation Testing
- Stryker ensures test quality
- Identifies weak test coverage
- Guides test improvement

## Future Extensibility

### Easy to Add:
1. **New HTTP Methods**: PUT, PATCH, DELETE support
2. **New Report Formats**: PDF, Markdown, XML
3. **Advanced Validation**: Response body schema validation
4. **Custom Test Templates**: User-defined test patterns
5. **CI/CD Integration**: GitHub Actions, GitLab CI

### Extension Points:
- Test generation templates
- Custom validators
- Report formatters
- CLI plugins

---

**Last Updated**: October 2024
**Version**: 0.1.0
