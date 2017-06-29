#!/bin/bash

set -e # Exit with nonzero exit code if anything fails
echo "=================================================="
echo "=============    STARTING RELEASE    ============="
echo "=================================================="

# Build a tag
## current build script will work only with
git checkout develop
## Build lib folder
npm install
npm prune
npm run build
git add .

export TRAVIS_REPO_SLUG=GFG/gfg-lambda-utilities
export TRAVIS_BUILD_NUMBER=GFG/gfg-lambda-utilities
# TODO Fix need a GH_TOKEN for github-change cli to work, make it option in the script
bash ./node_modules/gfg-cicd-scripts/modules/build.sh

# Merge to master
# TODO Not working in local, trying to create a master branch, need to fix the script
# bash ./node_modules/gfg-cicd-scripts/modules/merge.sh master
