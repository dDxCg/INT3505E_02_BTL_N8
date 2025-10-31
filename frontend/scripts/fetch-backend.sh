#!/bin/bash
set -e

# === CONFIG ===
BASE_BRANCH="base"
BACKEND_BRANCH="backend"
BACKEND_DIR="backend"
TMP_BRANCH="tmp_backend_merge"

# === FETCH & PULL ===
echo "Fetching all branches..."
git fetch origin

echo "Pulling latest from $BASE_BRANCH..."
git checkout $BASE_BRANCH
git pull origin $BASE_BRANCH

echo "Pulling latest from $BACKEND_BRANCH..."
git checkout $BACKEND_BRANCH
git pull origin $BACKEND_BRANCH

# === PREP TEMP BRANCH ===
echo "Creating temp branch..."
git checkout -B $TMP_BRANCH $BACKEND_BRANCH

# === MOVE FILES INTO BACKEND DIR ===
echo "Moving backend files into $BACKEND_DIR/"
mkdir -p $BACKEND_DIR

# Move all except .git, .gitignore, and backend dir itself
find . -mindepth 1 -maxdepth 1 \
  ! -name $BACKEND_DIR \
  ! -name ".git" \
  ! -name ".gitignore" \
  -exec mv {} $BACKEND_DIR/ \;

# Commit the move
git add $BACKEND_DIR
git commit -m "Move $BACKEND_BRANCH files into $BACKEND_DIR"

# === MERGE INTO BASE ===
echo "Merging into $BASE_BRANCH..."
git checkout $BASE_BRANCH
git merge --allow-unrelated-histories $TMP_BRANCH -m "Merge $BACKEND_BRANCH into $BACKEND_DIR"

# === CLEANUP ===
git branch -D $TMP_BRANCH

# echo "Backend successfully merged into $BACKEND_DIR"
# echo "Push when ready:"
# echo "git push origin $BASE_BRANCH"
