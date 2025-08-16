# Deployment Setup

## Vercel Deployment

### 1. Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click "Import Project" and select this repository
3. Vercel will automatically detect it as a React app

### 2. Environment Variables (Optional)
If your app needs environment variables, add them in Vercel dashboard:
- Go to your project settings
- Navigate to "Environment Variables"
- Add any required variables

### 3. Custom Domain (Optional)
- In project settings, go to "Domains"
- Add your custom domain and follow DNS setup instructions

## GitHub Actions Setup

### Required Secrets
Add these secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

#### For Vercel Integration:
- `VERCEL_TOKEN`: Your Vercel account token
  - Go to Vercel → Account Settings → Tokens
  - Generate a new token and copy it

- `VERCEL_ORG_ID`: Your Vercel organization ID
  - Run `npx vercel link` in your project
  - Check `.vercel/project.json` for the orgId

- `VERCEL_PROJECT_ID`: Your Vercel project ID  
  - Found in the same `.vercel/project.json` file as projectId

### Workflow Features

The CI/CD pipeline includes:

1. **Lint and Type Check**: ESLint and TypeScript validation
2. **Unit Tests**: Jest tests with coverage reporting
3. **E2E Tests**: Cypress end-to-end testing
4. **Build**: Production build verification
5. **Lighthouse CI**: Performance, accessibility, and SEO auditing
6. **Deploy Preview**: Automatic preview deployments for PRs
7. **Deploy Production**: Automatic production deployment on main branch

### Manual Deployment Commands

```bash
# Build locally
npm run build

# Run all tests
npm run test:all

# Deploy to Vercel manually
npx vercel --prod
```

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Run E2E tests
npm run test:e2e:open

# Build for production
npm run build

# Serve production build locally
npm run serve
```

## Quality Gates

The CI pipeline enforces:
- ✅ Code linting (ESLint)
- ✅ Type checking (TypeScript)
- ✅ Unit test coverage (Jest)
- ✅ E2E test passing (Cypress)
- ✅ Successful production build
- ⚠️ Lighthouse performance scores (warnings only)

## Troubleshooting

### Build Warnings
The project currently has some ESLint warnings that don't break the build:
- React Hook dependency warnings in NumberPad.tsx and GameScreen.tsx
- Unused variable in ResultsScreen.tsx

These can be fixed by updating the dependency arrays or removing unused code.

### E2E Test Failures
If Cypress tests fail:
1. Check screenshots in the artifacts
2. Run tests locally with `npm run test:e2e:open`
3. Update tests if UI has changed

### Vercel Deployment Issues
- Ensure build command is set to `npm run build`
- Check that output directory is set to `build`
- Verify environment variables are properly set