#!/bin/bash
set -e

# === CONFIG ===
BASE_BRANCH="base"
FRONTEND_BRANCH="frontend"
FRONTEND_DIR="frontend"
TMP_BRANCH="tmp_frontend_merge"

# === FETCH & PULL ===
echo "Fetching all branches..."
git fetch origin

echo "Pulling latest from $BASE_BRANCH..."
git checkout $BASE_BRANCH
git pull origin $BASE_BRANCH

echo "Pulling latest from $FRONTEND_BRANCH..."
git checkout $FRONTEND_BRANCH
git pull origin $FRONTEND_BRANCH

# === PREP TEMP BRANCH ===
echo "Creating temp branch..."
git checkout -B $TMP_BRANCH $FRONTEND_BRANCH

# === MOVE FILES INTO FRONTEND DIR ===
echo "Moving frontend files into $FRONTEND_DIR/"
mkdir -p $FRONTEND_DIR

# Move all except .git, .gitignore, and frontend dir itself
find . -mindepth 1 -maxdepth 1 \
  ! -name $FRONTEND_DIR \
  ! -name ".git" \
  ! -name ".gitignore" \
  -exec mv {} $FRONTEND_DIR/ \;

# Commit the move
git add $FRONTEND_DIR
git commit -m "Move $FRONTEND_BRANCH files into $FRONTEND_DIR"

# === MERGE INTO BASE ===
echo "Merging into $BASE_BRANCH..."
git checkout $BASE_BRANCH
git merge --allow-unrelated-histories $TMP_BRANCH -m "Merge $FRONTEND_BRANCH into $FRONTEND_DIR"

# === CLEANUP ===
git branch -D $TMP_BRANCH

# echo "Frontend successfully merged into $FRONTEND_DIR"
# echo "Push when ready:"
# echo "git push origin $BASE_BRANCH"
