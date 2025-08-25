# GitHub Actions Workflows

This project includes GitHub Actions workflows for automated CI/CD (Continuous Integration/Continuous Deployment).

## Workflows

### 1. Simple CI (`ci-simple.yml`)
**Purpose**: Basic testing and validation
**Triggers**: Push to main, Pull requests to main

**What it does**:
- ✅ Installs dependencies
- ✅ Runs linting checks
- ✅ Runs TypeScript type checking
- ✅ Builds the application
- ✅ Builds Docker image
- ✅ Tests Docker container health

**Best for**: Development teams who want basic validation without deployment complexity.

### 2. Full CI/CD Pipeline (`ci.yml`)
**Purpose**: Complete CI/CD with deployment options
**Triggers**: Push to main/develop, Pull requests to main

**What it does**:
- ✅ Everything from Simple CI
- ✅ Pushes Docker images to GitHub Container Registry
- ✅ Runs security vulnerability scanning
- ✅ Deploys to staging (develop branch)
- ✅ Deploys to production (main branch)

**Best for**: Production deployments with security scanning.

## How to Use

### For Simple CI (Recommended to start):
1. The workflow runs automatically on every push/PR
2. Check the "Actions" tab in GitHub to see results
3. PRs will be blocked if tests fail

### For Full CI/CD:
1. Set up GitHub environments (staging/production)
2. Configure deployment secrets
3. The workflow will automatically deploy on branch pushes

## Environment Variables

The workflows use these GitHub secrets (if needed):
- `OPENAI_API_KEY`: For testing LLM functionality
- `ANTHROPIC_API_KEY`: For testing Anthropic integration
- `POSTMAN_API_KEY`: For Postman collection generation

## Docker Images

- **Simple CI**: Builds locally, doesn't push
- **Full CI/CD**: Pushes to `ghcr.io/arun-gupta/postman-labs`

## Security Scanning

The full pipeline includes Trivy vulnerability scanning that:
- Scans Docker images for known vulnerabilities
- Uploads results to GitHub Security tab
- Can block deployments if critical issues found

## Deployment Environments

### Staging
- **Branch**: `develop`
- **Auto-deploy**: Yes
- **Purpose**: Pre-production testing

### Production
- **Branch**: `main`
- **Auto-deploy**: Yes
- **Purpose**: Live application

## Customization

### Add Your Own Deployment
Edit the deployment steps in `ci.yml`:

```yaml
- name: Deploy to production
  run: |
    # Add your deployment commands here
    # Examples:
    # - kubectl apply -f k8s/
    # - docker-compose -f docker-compose.prod.yml up -d
    # - aws ecs update-service --cluster my-cluster --service my-service
```

### Add More Tests
Add test steps to either workflow:

```yaml
- name: Run integration tests
  run: npm run test:integration

- name: Run E2E tests
  run: npm run test:e2e
```

## Troubleshooting

### Common Issues:
1. **Build fails**: Check Node.js version compatibility
2. **Docker build fails**: Verify Dockerfile syntax
3. **Health check fails**: Container might need more startup time
4. **Deployment fails**: Check environment secrets and permissions

### Debugging:
- Check the "Actions" tab in GitHub
- Look at workflow logs for specific error messages
- Test locally first: `docker-compose up --build`
