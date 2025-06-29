# Cloudinary Setup Guide for Sri Lanka Stay & Explore

## Your Cloudinary Account Details
- **Cloud Name**: `dmpfjul1j`
- **API Key**: `476146554929449`
- **API Secret**: ⚠️ Keep this secret! Never expose it in client-side code

## Setting Up Unsigned Upload Preset

To enable direct uploads from the browser, you need to create an unsigned upload preset:

1. **Login to Cloudinary Dashboard**
   - Go to https://console.cloudinary.com/
   - Sign in with your credentials

2. **Navigate to Settings**
   - Click on the gear icon (⚙️) in the top right
   - Select "Upload" from the left menu

3. **Create Upload Preset**
   - Scroll down to "Upload presets"
   - Click "Add upload preset"
   - Configure as follows:
     - **Preset name**: `sri_lanka_unsigned`
     - **Signing Mode**: Select "Unsigned"
     - **Folder**: `sri-lanka-travel` (optional, for organization)
     
4. **Configure Upload Settings** (Optional but recommended)
   - **Allowed formats**: jpg, png, gif, webp
   - **Max file size**: 10MB
   - **Eager transformations**: Add these for automatic variants:
     ```
     c_fill,h_150,w_150 (thumbnail)
     c_fill,h_400,w_600 (medium)
     c_fill,h_800,w_1200 (large)
     ```

5. **Save the preset**

## Security Considerations

### ⚠️ Important Security Notes:

1. **API Secret**: 
   - NEVER include your API secret in client-side code
   - It should only be used in server-side applications
   - Anyone with your API secret can delete/modify all your images

2. **Unsigned Uploads**:
   - Allow uploads without authentication
   - Good for client-side apps but less secure
   - Consider rate limiting and moderation

3. **Recommended Security Measures**:
   - Set upload limits in your preset
   - Enable automatic moderation
   - Monitor usage regularly
   - Consider implementing server-side uploads for production

## Testing Your Configuration

1. **Test Upload**:
   ```javascript
   // Open browser console and run:
   const testUpload = async () => {
     const response = await fetch('https://api.cloudinary.com/v1_1/dmpfjul1j/image/upload', {
       method: 'POST',
       body: new FormData(Object.assign(document.createElement('form'), {
         innerHTML: `
           <input name="file" value="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=">
           <input name="upload_preset" value="sri_lanka_unsigned">
         `
       }))
     });
     console.log(await response.json());
   };
   testUpload();
   ```

2. **Check Your Images**:
   - Go to https://console.cloudinary.com/console/media_library
   - You should see uploaded images there

## Next Steps

1. **For Development**:
   - The current setup works for development and testing
   - Images will be publicly accessible

2. **For Production**:
   - Implement server-side uploads using your API secret
   - Add authentication and authorization
   - Set up automatic backups
   - Configure CDN settings for your region

3. **Optimization Tips**:
   - Use Cloudinary's automatic format selection: `f_auto`
   - Apply automatic quality: `q_auto`
   - Implement lazy loading with blur-up effect
   - Use responsive images with `srcset`

## Troubleshooting

### Common Issues:

1. **"Upload preset not found"**
   - Make sure you created the preset with exact name: `sri_lanka_unsigned`
   - Ensure it's set to "Unsigned" mode

2. **CORS errors**
   - Cloudinary allows CORS by default
   - Check browser console for specific error messages

3. **Upload fails silently**
   - Check browser network tab
   - Verify your cloud name is correct
   - Ensure file size is within limits

## Support

- Cloudinary Documentation: https://cloudinary.com/documentation
- Support: https://support.cloudinary.com/
- Community Forum: https://community.cloudinary.com/

## Current Integration Status

✅ Cloud storage system configured with your Cloudinary account
✅ Automatic fallback to local storage if upload fails
✅ Image transformation support enabled
✅ Batch upload capability ready

⏳ Pending: Create the unsigned upload preset in Cloudinary dashboard 