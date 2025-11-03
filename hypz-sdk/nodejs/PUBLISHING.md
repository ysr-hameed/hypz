# Publishing Guide - Hypz SDK

This guide explains how to publish the Hypz SDK to npm.

## Prerequisites

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com)
2. **npm Login**: Login on your terminal with `npm login`
3. **Package Name**: The package is scoped as `@hypz/sdk`

## Publishing Steps

### 1. Prepare for Publishing

Navigate to the nodejs SDK folder:
```bash
cd hypz-sdk/nodejs
```

### 2. Login to npm

If not already logged in:
```bash
npm login
```

Enter your:
- Username
- Password
- Email
- One-time password (if 2FA enabled)

### 3. Test Before Publishing

Run tests to ensure everything works:
```bash
npm test
```

### 4. Check Package Contents

Preview what will be published:
```bash
npm pack --dry-run
```

This shows all files that will be included in the package.

### 5. Publish to npm

For first-time publishing of a scoped package:
```bash
npm publish --access public
```

For subsequent updates:
```bash
npm publish
```

## Version Management

### Semantic Versioning

Follow semantic versioning (semver):
- **MAJOR** (1.x.x): Breaking changes
- **MINOR** (x.1.x): New features, backward compatible
- **PATCH** (x.x.1): Bug fixes

### Update Version

Use npm version commands:

```bash
# Patch release (1.0.0 → 1.0.1)
npm version patch

# Minor release (1.0.0 → 1.1.0)
npm version minor

# Major release (1.0.0 → 2.0.0)
npm version major
```

Then publish:
```bash
npm publish
```

## Publishing Checklist

Before publishing, ensure:

- [ ] All tests pass (`npm test`)
- [ ] README.md is complete and accurate
- [ ] package.json has correct information
- [ ] Version number is updated
- [ ] No sensitive data in code
- [ ] LICENSE file is included
- [ ] .npmignore excludes unnecessary files
- [ ] TypeScript definitions are correct

## After Publishing

### 1. Verify Package

Check your package on npm:
```
https://www.npmjs.com/package/@hypz/sdk
```

### 2. Test Installation

In a new directory:
```bash
npm install @hypz/sdk
```

### 3. Update Documentation

Update your main project documentation with installation instructions.

## Unpublishing (Emergency Only)

⚠️ **Warning**: Only unpublish if absolutely necessary!

```bash
npm unpublish @hypz/sdk@1.0.0
```

**Note**: You can only unpublish within 72 hours of publishing, and the version number can never be reused.

## Deprecating a Version

Instead of unpublishing, prefer deprecating:

```bash
npm deprecate @hypz/sdk@1.0.0 "Security vulnerability, please upgrade to 1.0.1"
```

## Scoped Packages

The SDK uses a scoped package name (`@hypz/sdk`). Benefits:

- **Namespace**: Prevents name conflicts
- **Organization**: Groups related packages
- **Private by default**: Must explicitly publish as public

## Common Issues

### Issue: Need to login
```
npm ERR! need auth This command requires you to be logged in.
```
**Solution**: Run `npm login`

### Issue: 402 Payment Required
```
npm ERR! 402 Payment Required - PUT https://registry.npmjs.org/@hypz%2fsdk
```
**Solution**: Add `--access public` flag for scoped packages

### Issue: Version already exists
```
npm ERR! 403 You cannot publish over the previously published versions
```
**Solution**: Update version with `npm version patch/minor/major`

### Issue: Package name taken
**Solution**: 
1. Choose a different name
2. Use a scoped package (e.g., `@yourorg/sdk`)

## Continuous Deployment

For automated publishing, use GitHub Actions:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Best Practices

1. **Semantic Versioning**: Always follow semver
2. **Changelog**: Maintain a CHANGELOG.md file
3. **Tests**: Ensure all tests pass before publishing
4. **Documentation**: Keep README up to date
5. **Security**: Run `npm audit` before publishing
6. **Git Tags**: Tag releases in git (`git tag v1.0.0`)
7. **Breaking Changes**: Document in README and changelog

## Support

For publishing issues:
- npm support: support@npmjs.com
- npm documentation: https://docs.npmjs.com

## Quick Reference

```bash
# Login
npm login

# Test
npm test

# Preview package
npm pack --dry-run

# Update version
npm version patch|minor|major

# Publish
npm publish --access public

# View package
npm view @hypz/sdk

# Check who you're logged in as
npm whoami
```

## Example Publishing Workflow

```bash
# 1. Make changes to code
# ... edit files ...

# 2. Test changes
npm test

# 3. Update version
npm version patch
# This creates a git commit and tag

# 4. Push to git
git push && git push --tags

# 5. Publish to npm
npm publish --access public

# 6. Verify
npm view @hypz/sdk
```

---

**Ready to publish?** Follow the steps above to make your SDK available on npm! 🚀
