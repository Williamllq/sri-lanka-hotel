#!/bin/bash

# Deployment script for Sri Lanka Stay & Explore
# This script commits and pushes changes to GitHub

# Get the current date and time for commit message
CURRENT_DATE=$(date +"%Y-%m-%d %H:%M:%S")

# Step 1: Add all changes to staging
echo "Adding changes to staging..."
git add .

# Step 2: Commit changes with timestamp
echo "Committing changes..."
git commit -m "Image optimization update - $CURRENT_DATE"

# Step 3: Pull latest changes from origin to prevent conflicts
echo "Pulling latest changes from remote..."
git pull origin main

# Step 4: Push changes to GitHub
echo "Pushing changes to GitHub..."
git push origin main

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
echo "- All files were committed with message: 'Image optimization update - $CURRENT_DATE'"
echo "- Changes were pushed to GitHub repository"
echo "- Netlify will automatically build and deploy the changes"
echo ""
echo "🌐 Website URL: https://sri-lanka-stay-explore.netlify.app/"
echo ""
echo "📝 Next steps:"
echo "1. Check Netlify build status"
echo "2. Verify image optimization features on the live site"
echo "3. Test admin image upload functionality"
echo "" 