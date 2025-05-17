#!/bin/bash

# Deployment script for Sri Lanka Stay & Explore
# This script commits and pushes changes to GitHub

# Get the current date and time for commit message
CURRENT_DATE=$(date +"%Y-%m-%d %H:%M:%S")

# Get current branch name
BRANCH=$(git symbolic-ref --short HEAD)
if [ -z "$BRANCH" ]; then
  BRANCH="master" # Default to master if branch detection fails
fi

# Step 1: Add all changes to staging
echo "Adding changes to staging..."
git add .

# Step 2: Commit changes with timestamp
echo "Committing changes..."
git commit -m "Fix Netlify deployment configuration - $CURRENT_DATE"

# Step 3: Pull latest changes from origin to prevent conflicts
echo "Pulling latest changes from remote..."
git pull origin $BRANCH || { 
  echo "❌ Pull failed! Resolving conflicts may be required."; 
  exit 1; 
}

# Step 4: Push changes to GitHub
echo "Pushing changes to GitHub branch: $BRANCH..."
git push origin $BRANCH || {
  echo "❌ Push failed! Check if you have permission to push to this repository."
  exit 1;
}

# Step 5: Verify deployment status
if [ $? -eq 0 ]; then
  echo "✅ Deployment successful!"
  echo "Changes are now being deployed via Netlify CI/CD pipeline."
  echo "Check deployment status at: https://app.netlify.com/sites/sri-lanka-stay-explore/deploys"
else
  echo "❌ Deployment failed!"
  echo "Please check your git configuration and try again."
  exit 1
fi

# Print helpful information
echo ""
echo "📋 Deployment Summary:"
echo "- All files were committed with message: 'Fix Netlify deployment configuration - $CURRENT_DATE'"
echo "- Changes were pushed to GitHub repository (branch: $BRANCH)"
echo "- Netlify will automatically build and deploy the changes"
echo ""
echo "🌐 Website URL: https://sri-lanka-stay-explore.netlify.app/"
echo ""
echo "📝 Next steps:"
echo "1. Check Netlify build status"
echo "2. Verify image optimization features on the live site"
echo "3. Test admin image upload functionality"
echo "" 