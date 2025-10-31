#!/bin/bash
set -e

# Config
BASE_BRANCH="base"
BACKEND_BRANCH="backend"
BACKEND_DIR="backend"
TMP_BRANCH="tmp_backend_merge"

# Fetch all branches
git fetch origin

# Pull latest base branch
git checkout $BASE_BRANCH
git pull origin $BASE_BRANCH

# Pull latest backend branch
git checkout $BACKEND_BRANCH
git pull origin $BACKEND_BRANCH

# Checkout temporary branch from backend
git checkout -B $TMP_BRANCH $BACKEND_BRANCH

# Copy files into backend directory
mkdir -p $BACKEND_DIR
git ls-tree --name-only -r HEAD | xargs -I{} cp -r {} $BACKEND_DIR 2>/dev/null || true

# Commit the move
git add $BACKEND_DIR
git commit -m "Merge backend branch into $BACKEND_DIR"

# Merge temp branch into base
git checkout $BASE_BRANCH
git merge --allow-unrelated-histories $TMP_BRANCH -m "Merge backend branch into $BACKEND_DIR"

# Cleanup
git branch -D $TMP_BRANCH

# echo "Backend merged into $BACKEND_DIR. Push if satisfied:"
# echo "git push origin $BASE_BRANCH"
