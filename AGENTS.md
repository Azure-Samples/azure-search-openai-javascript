# AGENTS.md

## Project Overview

This is a ChatGPT + Enterprise data application built with Azure OpenAI and Azure AI Search, implementing the Retrieval Augmented Generation (RAG) pattern. The application allows users to chat with their enterprise data using Azure OpenAI's ChatGPT models (gpt-4o-mini) and Azure AI Search for data indexing and retrieval.

**Architecture**: The project is organized as an npm workspace with three main packages:
- **webapp**: React + Vite frontend application with Lit web components (Static Web App)
- **search**: Fastify-based backend API service for search and chat (Container App)
- **indexer**: Document indexing service with CLI tool (Container App)

**Key Technologies**:
- TypeScript, React, Lit (web components)
- Fastify (backend API framework)
- Vite (frontend build tool)
- Azure OpenAI, Azure AI Search, Azure Container Apps, Azure Static Web Apps
- Playwright (e2e testing), k6 (load testing)
- Azure Developer CLI (azd) for infrastructure and deployment

## Setup Commands

### Prerequisites
- Node.js 22 or higher (check `.nvmrc`)
- npm 10 or higher
- Azure Developer CLI (azd) - for deployment
- Azure subscription with OpenAI service access

### Installation

```bash
# Install all dependencies (workspace root)
npm install

# Install Playwright browsers (for e2e tests)
npx playwright install --with-deps
```

### First-Time Azure Deployment

```bash
# Login to Azure
azd auth login

# Deploy infrastructure and application
azd up

# This will:
# - Prompt for Azure location
# - Provision all Azure resources (OpenAI, AI Search, Container Apps, etc.)
# - Build and deploy all services
# - Run post-provision hook to index sample data
```

## Development Workflow

### Running Locally

**Prerequisites**: You must first deploy to Azure with `azd up` before running locally.

```bash
# 1. Authenticate with Azure
azd auth login
az login

# 2. Load environment variables from Azure deployment
azd env get-values > .env

# 3. Index the data
./scripts/index-data.sh    # On Linux/macOS
./scripts/index-data.ps1   # On Windows

# 4. Start all services concurrently
npm start

# This runs all three services:
# - webapp on http://localhost:5173
# - search API on http://localhost:3000
# - indexer API on http://localhost:3001
```

### Starting Individual Services

```bash
# Start only the webapp
npm run start:webapp

# Start only the search API
npm run start:search

# Start only the indexer API
npm run start:indexer
```

### Development Mode with Hot Reload

Each workspace package has its own dev mode with hot reload:

```bash
# Build and watch for changes in a specific package
npm run dev --workspace=webapp
npm run dev --workspace=search
npm run dev --workspace=indexer
```

### Environment Variables

Environment variables are managed through Azure Developer CLI:

```bash
# View all environment variables
azd env get-values

# Set a specific environment variable
azd env set VARIABLE_NAME value

# Export to .env file for local development
azd env get-values > .env
```

## Testing Instructions

### Unit Tests

```bash
# Run all tests across workspaces
npm test

# Run tests for a specific package
npm test --workspace=search
npm test --workspace=indexer

# Tests use Node.js built-in test runner and c8 for coverage
```

### End-to-End Tests (Playwright)

```bash
# Run Playwright e2e tests
npm run test:playwright

# Run in headed mode for debugging
npx playwright test --headed

# Run specific test file
npx playwright test tests/e2e/webapp.spec.ts

# View test report
npx playwright show-report
```

**Test Configuration**: See `playwright.config.ts`
- Tests run against `http://localhost:5173`
- Uses chromium, firefox, and webkit browsers
- Automatically starts webapp dev server before tests
- Test files located in `tests/e2e/`

### Load Tests

```bash
# Run load tests with k6
npm run test:load

# Tests are defined in tests/load/index.js
```

### Test File Locations

- Unit tests: `packages/*/test/**/*.ts`
- E2E tests: `tests/e2e/**/*.spec.ts`
- Load tests: `tests/load/**/*.js`

## Code Style

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Check code formatting with Prettier
npm run format:check

# Format code with Prettier
npm run format
```

### Style Conventions

**Prettier Configuration** (in `package.json`):
- Tab width: 2 spaces
- Semicolons: required
- Single quotes: enabled
- Print width: 120 characters
- Bracket spacing: enabled

**ESLint**: Uses shared config from `eslint-config-shared` workspace package

**Pre-commit Hooks**: 
- Uses `simple-git-hooks` with `lint-staged`
- Automatically runs on `git commit`
- Formats staged files with Prettier

### File Organization

```
/
├── packages/           # Workspace packages
│   ├── webapp/        # Frontend application
│   ├── search/        # Search API service
│   ├── indexer/       # Indexer service
│   ├── chat-component/# Shared chat web component
│   └── eslint-config/ # Shared ESLint config
├── infra/             # Bicep infrastructure as code
├── scripts/           # Build and deployment scripts
├── tests/             # E2E and load tests
├── data/              # Sample documents for indexing
└── docs/              # Documentation
```

### TypeScript

- All packages use TypeScript
- Build with `tsc` (TypeScript compiler)
- Configuration in each package's `tsconfig.json`
- Type definitions from `@types/*` packages

## Build and Deployment

### Building All Packages

```bash
# Build all workspace packages
npm run build

# This compiles TypeScript and builds Vite bundles
```

### Building Individual Packages

```bash
# Build specific package
npm run build --workspace=webapp
npm run build --workspace=search
npm run build --workspace=indexer
```

### Building Docker Images

```bash
# Build all Docker images (Linux only)
npm run docker:build

# Build specific service image
npm run docker:build --workspace=search
npm run docker:build --workspace=indexer
```

### Deployment with Azure Developer CLI

```bash
# Deploy infrastructure and all services
azd up

# Deploy only code changes (skip infrastructure)
azd deploy

# Provision infrastructure only
azd provision

# Redeploy after making changes
azd deploy
```

### Deployment Architecture

The `azure.yaml` file defines three services:
- **webapp**: Static Web App (frontend)
  - Predeploy hook builds the webapp
  - Deploys `dist` folder
- **search**: Container App (backend API)
  - Remote Docker build on Azure
- **indexer**: Container App (indexer service)
  - Remote Docker build on Azure

**Post-deployment Hook**: After provisioning, the `postup` hook runs the index-data script to populate the search index with sample data.

### Environment-Specific Configuration

```bash
# For existing Azure resources, set environment variables:
azd env set AZURE_RESOURCE_GROUP <existing-group>
azd env set AZURE_OPENAI_RESOURCE_GROUP <existing-openai-group>
azd env set AZURE_OPENAI_RESOURCE <existing-openai-resource>
azd env set AZURE_SEARCH_SERVICE <existing-search-service>

# Then run azd up to deploy with existing resources
azd up
```

## Pull Request Guidelines

### Before Submitting

1. **Run linting and formatting**:
   ```bash
   npm run lint:fix
   npm run format
   ```

2. **Build the code**:
   ```bash
   npm run build
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

4. **Run e2e tests** (if UI changes):
   ```bash
   npm run test:playwright
   ```

### PR Requirements

- Title format: Clear and descriptive
- All lint checks must pass
- All tests must pass
- Code must be formatted with Prettier
- Follow TypeScript best practices
- Include tests for new features or bug fixes

### CI/CD Workflow

The GitHub Actions workflow (`.github/workflows/build-test.yaml`) runs on every PR:
- Installs dependencies with `npm ci`
- Builds all packages
- Builds Docker images (Ubuntu only)
- Runs linting
- Runs unit tests
- Tests on Ubuntu, macOS, and Windows with Node.js 22

## Additional Notes

### Workspace Commands

This project uses npm workspaces. Common patterns:

```bash
# Run command in all workspaces
npm run <script> -ws

# Run command in all workspaces that have the script
npm run <script> -ws --if-present

# Run command in specific workspace
npm run <script> --workspace=<package-name>
```

### Common Gotchas

1. **Must deploy to Azure first**: Local development requires Azure resources. You cannot run fully locally without first running `azd up`.

2. **Environment variables**: The `.env` file is generated from Azure deployment. Don't manually create it; use `azd env get-values > .env`.

3. **Data indexing**: After deploying, ensure data is indexed by running the index-data script. This is done automatically by the `postup` hook but may need to be run manually if you change the data.

4. **OpenAI capacity**: Default is 30K TPM (tokens per minute), roughly 30 conversations/minute. Increase `chatGptDeploymentCapacity` in `infra/main.bicep` if needed.

5. **Playwright tests**: Require browsers to be installed. Run `npm run install:playwright` if tests fail due to missing browsers.

6. **Node.js version**: This project requires Node.js 22+. Check `.nvmrc` for the exact version.

### Troubleshooting

**"Resource name not allowed" conflicts**: Azure keeps deleted resources for 48 hours. Purge them or use different names.

```bash
# Clean up and purge all resources
azd down --purge
```

**Port conflicts when running locally**: Ensure ports 3000, 3001, and 5173 are available.

**Authentication errors**: Ensure both `azd auth login` and `az login` are completed for local development.

### Reindexing Data

To add or update documents:

```bash
# 1. Add files to data/ folder
# 2. Run indexing script
./scripts/index-data.sh    # Linux/macOS
./scripts/index-data.ps1   # Windows
```

The indexer CLI tool (`index-files`) can also be run directly:

```bash
npx index-files --wait --indexer-url "${INDEXER_API_URI}" --index-name "${AZURE_SEARCH_INDEX}" ./data/*.*
```

### Performance Considerations

- **Search Service**: Default is Standard tier with 1 replica. Scale up for production loads.
- **Container Apps**: Default is 1 vCPU, 2GB RAM, scales 1-10 replicas. Adjust in `infra/main.bicep`.
- **Static Web App**: Free tier, consider upgrade for production.
- **Monitoring**: Application Insights available for tracing and diagnostics.

### Backend API Compatibility

The search API implements the [HTTP protocol for AI chat apps](https://aka.ms/chatprotocol). It can be swapped with compatible backends like the Python implementation from [azure-search-openai-demo](https://github.com/Azure-Samples/azure-search-openai-demo).
