#!/bin/bash

# 🚀 Fast Deployment Script for JustHear Frontend
# This script optimizes the build and deployment process

set -e

echo "🚀 Starting optimized deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist node_modules/.vite .npm-cache

# Install dependencies with optimizations
print_status "Installing dependencies with optimizations..."
npm ci --prefer-offline --no-audit --no-fund --silent

# Build the application
print_status "Building application..."
npm run build:fast

# Check build size
print_status "Analyzing build size..."
BUILD_SIZE=$(du -sh dist | cut -f1)
print_success "Build completed! Size: $BUILD_SIZE"

# List build artifacts
print_status "Build artifacts:"
ls -la dist/

# Check for large files
print_status "Checking for large files..."
find dist -type f -size +100k -exec ls -lh {} \;

# Optimize images if they exist
if [ -d "public" ] && [ "$(find public -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' | wc -l)" -gt 0 ]; then
    print_warning "Consider optimizing images in public/ directory for faster loading"
fi

# Generate deployment report
print_status "Generating deployment report..."
{
    echo "Deployment Report - $(date)"
    echo "========================"
    echo "Build Size: $BUILD_SIZE"
    echo "Build Time: $(date)"
    echo "Node Version: $(node --version)"
    echo "NPM Version: $(npm --version)"
    echo ""
    echo "Build Artifacts:"
    ls -la dist/
    echo ""
    echo "Large Files (>100KB):"
    find dist -type f -size +100k -exec ls -lh {} \;
} > deployment-report.txt

print_success "Deployment report saved to deployment-report.txt"

# Final status
print_success "Deployment preparation complete!"
print_status "Next steps:"
echo "  1. Deploy to Render using the optimized render.yaml"
echo "  2. Or use Docker: docker build -t justhear-frontend ."
echo "  3. Check deployment-report.txt for details"

# Optional: Push to git
read -p "Do you want to commit and push these changes? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Committing changes..."
    git add .
    git commit -m "🚀 Optimized deployment build - $(date)"
    git push
    print_success "Changes pushed to repository!"
fi

print_success "Deployment script completed successfully! 🎉"
