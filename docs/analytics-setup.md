# Sri Lanka Stay & Explore - Analytics Setup Guide

This document provides instructions for setting up and configuring Google Analytics for the Sri Lanka Stay & Explore website.

## Setting Up Google Analytics 4 (GA4)

### Step 1: Create a Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/) and sign in with your Google account
2. Click on "Start measuring"
3. Provide an account name (e.g., "Sri Lanka Stay & Explore")
4. Configure data sharing settings according to your preferences
5. Click "Next"

### Step 2: Create a Property

1. Enter a property name (e.g., "Sri Lanka Stay & Explore Website")
2. Select your reporting time zone and currency
3. Click "Next"
4. Provide business information as required
5. Click "Create"

### Step 3: Set Up Data Collection

1. Select "Web" as the platform
2. Enter your website URL: `https://sri-lanka-stay-explore.netlify.app`
3. Name your data stream (e.g., "Sri Lanka Stay & Explore Web Stream")
4. Click "Create stream"

### Step 4: Get Your Measurement ID

1. Once your stream is created, you'll see a Measurement ID (format: G-XXXXXXXX)
2. Copy this ID as you'll need it for the website configuration

## Integrating with the Website

The website already has an `analytics.js` file that handles all the tracking, but you need to update it with your actual Measurement ID:

1. Open `js/analytics.js` in your code editor
2. Find the line: `const GA_MEASUREMENT_ID = 'G-XXXXXXXX';`
3. Replace `G-XXXXXXXX` with your actual Measurement ID
4. Save the file and deploy the changes

## Custom Event Tracking

The analytics implementation includes tracking for:

- Navigation menu clicks
- Booking form submissions
- Content engagement (scroll depth, video plays)
- Outbound link clicks

These events will automatically appear in your Google Analytics dashboard after users start interacting with the website.

## Viewing Reports

After implementation:

1. Log in to Google Analytics
2. Navigate to "Reports" in the left sidebar
3. You'll find various reports including:
   - Real-time: Current active users
   - Acquisition: Where your traffic is coming from
   - Engagement: How users interact with your site
   - Monetization: Conversion tracking (if e-commerce is set up)

## Enhanced Features to Consider

- **E-commerce tracking**: For tracking actual bookings and revenue
- **User ID tracking**: To better understand cross-device behavior
- **Custom dimensions**: For tracking additional user properties
- **Goal setup**: To track specific conversion points

## Troubleshooting

If events aren't being tracked properly:

1. Install the Google Analytics Debugger browser extension
2. Enable debug mode by setting `DEBUG_MODE = true;` in `analytics.js`
3. Check the browser console for tracking events
4. Verify that the Measurement ID is correct
5. Ensure the website doesn't have JavaScript errors blocking analytics code

## Regular Maintenance

- Review data quality monthly
- Update tracking code as needed
- Add new event tracking for new features
- Regularly check for compliance with privacy regulations 