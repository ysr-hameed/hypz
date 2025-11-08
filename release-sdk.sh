#!/bin/bash

# Hypz SDK Release Script
# Usage: ./release-sdk.sh [nodejs|python|java|all] [version]

SDK_TYPE=$1
VERSION=$2

if [ -z "$SDK_TYPE" ] || [ -z "$VERSION" ]; then
    echo "Usage: ./release-sdk.sh [nodejs|python|java|all] [version]"
    echo "Example: ./release-sdk.sh nodejs 1.0.2"
    exit 1
fi

PRIVATE_REPO="/home/ysr/VS Code Projects/hypz"
PUBLIC_REPO="/home/ysr/VS Code Projects/hypz-cloud"

release_nodejs() {
    echo "📦 Releasing Node.js SDK v$VERSION..."
    cd "$PRIVATE_REPO/hypz-sdk/nodejs"
    
    # Update version
    npm version $VERSION --no-git-tag-version
    
    # Publish to npm
    npm publish --access public
    
    echo "✅ Node.js SDK published to npm"
}

release_python() {
    echo "🐍 Releasing Python SDK v$VERSION..."
    cd "$PRIVATE_REPO/hypz-sdk/python"
    
    # Update version in setup.py (manual step - remind user)
    echo "⚠️  Please update version in setup.py to $VERSION"
    read -p "Press enter when done..."
    
    # Clean old builds
    rm -rf dist/ build/ *.egg-info
    
    # Build
    python3 setup.py sdist bdist_wheel
    
    # Upload
    twine upload dist/*
    
    echo "✅ Python SDK published to PyPI"
}

release_java() {
    echo "☕ Releasing Java SDK v$VERSION..."
    
    # Copy to public repo
    echo "Copying files to public repository..."
    cp -r "$PRIVATE_REPO/hypz-sdk/java/"* "$PUBLIC_REPO/sdks/java/"
    
    # Commit and tag
    cd "$PUBLIC_REPO"
    git add sdks/java/
    git commit -m "Update Java SDK to v$VERSION"
    git push origin main
    
    # Create and push tag
    git tag -a $VERSION -m "Release v$VERSION"
    git push origin $VERSION
    
    echo "✅ Java SDK pushed to GitHub"
    echo "🔗 JitPack will build at: https://jitpack.io/#ysr-hameed/hypz-cloud/$VERSION"
}

sync_public_repo() {
    echo "🔄 Syncing all SDKs to public repository..."
    cp -r "$PRIVATE_REPO/hypz-sdk/nodejs/"* "$PUBLIC_REPO/sdks/nodejs/"
    cp -r "$PRIVATE_REPO/hypz-sdk/python/"* "$PUBLIC_REPO/sdks/python/"
    cp -r "$PRIVATE_REPO/hypz-sdk/java/"* "$PUBLIC_REPO/sdks/java/"
    
    cd "$PUBLIC_REPO"
    git add sdks/
    git commit -m "Sync all SDKs to v$VERSION"
    git push origin main
    
    echo "✅ All SDKs synced to public repository"
}

case $SDK_TYPE in
    nodejs)
        release_nodejs
        ;;
    python)
        release_python
        ;;
    java)
        release_java
        ;;
    all)
        release_nodejs
        release_python
        release_java
        sync_public_repo
        ;;
    *)
        echo "Invalid SDK type. Use: nodejs, python, java, or all"
        exit 1
        ;;
esac

echo ""
echo "🎉 Release complete!"
echo ""
echo "Published versions:"
echo "  • Node.js: https://www.npmjs.com/package/@hypz/sdk"
echo "  • Python: https://pypi.org/project/hypz-sdk/"
echo "  • Java: https://jitpack.io/#ysr-hameed/hypz-cloud/$VERSION"
