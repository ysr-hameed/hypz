# SDK Development & Release Guide

## Directory Structure

### Private Repository (hypz)
- **Location**: `/home/ysr/VS Code Projects/hypz`
- **Purpose**: Main development, backend, frontend, SDK development
- **SDKs**:
  - `hypz-sdk/nodejs/` - Node.js SDK development
  - `hypz-sdk/python/` - Python SDK development
  - `hypz-sdk/java/` - Java SDK development

### Public Repository (hypz-cloud)
- **Location**: `/home/ysr/VS Code Projects/hypz-cloud`
- **Purpose**: Public showcase, Java SDK distribution
- **SDKs**:
  - `sdks/nodejs/` - Node.js SDK (reference copy)
  - `sdks/python/` - Python SDK (reference copy)
  - `sdks/java/` - Java SDK (used by JitPack)

---

## Development Workflow

### 1. Making Changes

**Always work in the PRIVATE repository:**

```bash
cd /home/ysr/VS\ Code\ Projects/hypz/hypz-sdk
```

Edit the SDK you want to change:
- Node.js: `nodejs/index.js`
- Python: `python/hypz.py`
- Java: `java/src/main/java/com/hypz/sdk/`

### 2. Testing Changes

**Node.js:**
```bash
cd hypz-sdk/nodejs
node test-sdk.js
```

**Python:**
```bash
cd hypz-sdk/python
python3 test_sdk.py
```

**Java:**
```bash
cd hypz-sdk/java
gradle build
```

### 3. Publishing

#### Option A: Use Release Script (Recommended)

```bash
cd /home/ysr/VS\ Code\ Projects/hypz

# Release specific SDK
./release-sdk.sh nodejs 1.0.2
./release-sdk.sh python 2.1.1
./release-sdk.sh java 1.0.2

# Or release all at once
./release-sdk.sh all 1.0.2
```

#### Option B: Manual Release

**Node.js (npm):**
```bash
cd /home/ysr/VS\ Code\ Projects/hypz/hypz-sdk/nodejs
npm version patch  # or: minor, major
npm publish --access public
```

**Python (PyPI):**
```bash
cd /home/ysr/VS\ Code\ Projects/hypz/hypz-sdk/python
# 1. Update version in setup.py
# 2. Build and publish:
rm -rf dist/ build/ *.egg-info
python3 setup.py sdist bdist_wheel
twine upload dist/*
```

**Java (JitPack via public repo):**
```bash
# 1. Copy to public repo
cp -r /home/ysr/VS\ Code\ Projects/hypz/hypz-sdk/java/* \
      /home/ysr/VS\ Code\ Projects/hypz-cloud/sdks/java/

# 2. Commit and tag
cd /home/ysr/VS\ Code\ Projects/hypz-cloud
git add sdks/java/
git commit -m "Update Java SDK to v1.0.2"
git push origin main

# 3. Create version tag
git tag -a 1.0.2 -m "Release v1.0.2"
git push origin 1.0.2

# 4. JitPack will auto-build from the tag
```

---

## Version Numbers

Follow semantic versioning: `MAJOR.MINOR.PATCH`

- **PATCH** (1.0.X): Bug fixes, small improvements
- **MINOR** (1.X.0): New features, backward compatible
- **MAJOR** (X.0.0): Breaking changes

Example:
- Bug fix: `1.0.1` → `1.0.2`
- New feature: `1.0.2` → `1.1.0`
- Breaking change: `1.1.0` → `2.0.0`

---

## Common Tasks

### Update SDK Dependencies

**Node.js:**
```bash
cd hypz-sdk/nodejs
npm update
```

**Python:**
```bash
cd hypz-sdk/python
pip install --upgrade -r requirements.txt
```

### Fix a Bug

1. Make changes in **private repo**: `hypz/hypz-sdk/[sdk-name]/`
2. Test thoroughly
3. Increment PATCH version: `1.0.1` → `1.0.2`
4. Release using script or manually

### Add New Feature

1. Develop in **private repo**
2. Update SDK README with new feature docs
3. Increment MINOR version: `1.0.2` → `1.1.0`
4. Release all SDKs to keep feature parity

---

## Quick Reference

| Task | Command |
|------|---------|
| Test Node.js SDK | `cd hypz/hypz-sdk/nodejs && node test-sdk.js` |
| Test Python SDK | `cd hypz/hypz-sdk/python && python3 test_sdk.py` |
| Test Java SDK | `cd hypz/hypz-sdk/java && gradle build` |
| Release Node.js | `./release-sdk.sh nodejs 1.0.X` |
| Release Python | `./release-sdk.sh python 2.1.X` |
| Release Java | `./release-sdk.sh java 1.0.X` |
| Release All | `./release-sdk.sh all 1.0.X` |

---

## Distribution Channels

| SDK | Published At | Link |
|-----|--------------|------|
| Node.js | npm | https://www.npmjs.com/package/@hypz/sdk |
| Python | PyPI | https://pypi.org/project/hypz-sdk/ |
| Java | JitPack | https://jitpack.io/#ysr-hameed/hypz-cloud |

---

## Important Notes

1. **Always develop in PRIVATE repo** (`hypz/hypz-sdk/`)
2. **Node.js & Python** publish directly from private repo
3. **Java** requires copying to PUBLIC repo (`hypz-cloud`) before release
4. **Test before publishing** - no way to unpublish from npm/PyPI
5. **Keep versions in sync** across all SDKs when possible
6. **Update documentation** in `hypz-cloud` when adding features

---

## Need Help?

- SDK development location: `/home/ysr/VS Code Projects/hypz/hypz-sdk/`
- Public showcase: `/home/ysr/VS Code Projects/hypz-cloud/`
- Release script: `/home/ysr/VS Code Projects/hypz/release-sdk.sh`
