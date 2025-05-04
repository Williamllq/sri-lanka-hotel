# Sri Lanka Stay & Explore

A web application for booking accommodations and transportation services in Sri Lanka.

## Features

- Interactive maps for selecting pickup and destination locations
- Real-time driving route visualization using Leaflet and Leaflet Routing Machine
- Fare calculation based on actual driving distance
- Easy booking process for transportation services
- Responsive design for all devices
- Optimized "Discover Sri Lanka" gallery with category filtering and carousel

## Technologies

- HTML5/CSS3
- JavaScript (ES6+)
- Leaflet Maps API
- Leaflet Routing Machine
- OpenStreetMap
- LocalStorage for efficient data management

## Getting Started

1. Clone the repository
2. Open index.html in your browser
3. Explore the website features

## Implementation Details

- Uses actual driving routes instead of straight-line distance for more accurate fare calculations
- Implements fallback mechanisms for situations when routing services are unavailable
- Responsive UI designed for various device sizes
- Lightweight gallery implementation using simple-gallery.js for memory-efficient image display

## GitHub Workflow & Deployment Rules

### Repository Information

- **GitHub Repository**: https://github.com/Williamllq/sri-lanka-hotel
- **Deployed Website**: https://sri-lanka-stay-explore.netlify.app/

### Access Information

- **User Interface**: https://sri-lanka-stay-explore.netlify.app/
- **Admin Dashboard**: https://sri-lanka-stay-explore.netlify.app/admin-dashboard.html
- **Admin Username**: admin
- **Admin Password**: rangabandara2024
- **Important**: Please do not share admin credentials in public forums

### Branch Management

This project uses the following branch strategy:

- **master**: Production branch, corresponds to the deployed website
- **main**: Development branch, used for new feature development

### Publishing Process

1. **Develop New Features**:
   - Ensure you are developing on the `main` branch
   - After completing code changes, commit your changes:
   ```bash
   git add .
   git commit -m "Descriptive commit message"
   git push origin main
   ```

2. **Create Pull Request**:
   - After pushing to the `main` branch, GitHub will prompt to create a Pull Request
   - Click the "Compare & pull request" button
   - Fill in a clear title and description
   - Create the Pull Request to merge `main` branch into `master` branch

3. **Merge Changes**:
   - Review the Pull Request on GitHub
   - Click the "Merge pull request" button to merge changes into the `master` branch
   - Confirm the merge

4. **Check Deployment**:
   - Netlify will automatically deploy the latest code from the `master` branch
   - Check https://sri-lanka-stay-explore.netlify.app/ to confirm changes have been successfully deployed

### Important Notes

- Avoid developing directly on the `master` branch
- Ensure each commit has a clear commit message
- Test your changes before merging
- Pull Requests should include relevant feature descriptions or issues fixed
- The gallery implementation uses localStorage for efficiency - avoid using the memory-intensive synchronization scripts

## Gallery Implementation

The "Discover Sri Lanka" gallery section has been optimized to solve memory issues:

1. **Memory-Efficient Approach**: The simple-gallery.js script provides a lightweight implementation that avoids the memory issues present in earlier versions.
2. **Data Sources**: Images are loaded from localStorage (sitePictures or adminPictures), with fallback to default images if needed.
3. **Features**:
   - Category filtering (All, Scenery, Wildlife, Culture, Food, Beach)
   - Image carousel with automatic rotation
   - Responsive design for all device sizes
   - Thumbnail navigation

## License

MIT License 