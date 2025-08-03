# Netlify Deployment Guide

Complete guide for deploying the VSS Global website with Google Calendar integration to Netlify.

## Overview

This deployment includes:
- ✅ Static website hosting
- ✅ Serverless functions for backend API
- ✅ Environment variables for secure credential storage
- ✅ Custom domain support
- ✅ Automatic deployments from Git

## Prerequisites

- Netlify account
- GitHub repository with your code
- Google Calendar integration setup completed
- Domain name (optional)

## Step 1: Prepare for Deployment

### 1.1 Verify Project Structure

Ensure your project has:
```
project_VSS_web/
├── netlify/
│   └── functions/
│       └── book-appointment.js
├── netlify.toml
├── package.json
├── index.html
├── contact.html
├── script.js
├── styles.css
└── other website files...
```

### 1.2 Check netlify.toml Configuration

Your `netlify.toml` should contain:
```toml
[build]
  publish = "."
  command = ""
  functions = "netlify/functions"
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 1.3 Verify Dependencies

Check `package.json` includes:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "googleapis": "^128.0.0",
    "nodemailer": "^6.9.7",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

## Step 2: Deploy to Netlify

### 2.1 Connect Repository

1. Log in to [Netlify](https://app.netlify.com/)
2. Click "New site from Git"
3. Choose your Git provider (GitHub, GitLab, etc.)
4. Select your repository
5. Configure build settings:
   - **Build command:** Leave empty (static site)
   - **Publish directory:** `.` (current directory)
   - **Functions directory:** `netlify/functions`

### 2.2 Initial Deployment

1. Click "Deploy site"
2. Wait for the initial build to complete
3. Note your temporary Netlify URL (e.g., `amazing-site-123456.netlify.app`)

## Step 3: Configure Environment Variables

### 3.1 Add Environment Variables

In Netlify Dashboard:
1. Go to Site Settings → Environment Variables
2. Add the following variables:

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-site.netlify.app/oauth/callback

# Google Services
GOOGLE_CALENDAR_ID=admin@vssglobal.biz
GOOGLE_REFRESH_TOKEN=your_refresh_token

# Email Configuration
EMAIL_USER=admin@vssglobal.biz
EMAIL_APP_PASSWORD=your_gmail_app_password

# Environment
NODE_ENV=production
```

### 3.2 Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add your Netlify URL to Authorized redirect URIs:
   - `https://your-site.netlify.app/oauth/callback`
5. Save changes

## Step 4: Custom Domain (Optional)

### 4.1 Add Custom Domain

1. In Netlify Dashboard → Domain Settings
2. Click "Add custom domain"
3. Enter your domain (e.g., `vssglobal.biz`)
4. Follow DNS configuration instructions

### 4.2 Update Environment Variables

Update the redirect URI to use your custom domain:
```bash
GOOGLE_REDIRECT_URI=https://vssglobal.biz/oauth/callback
```

### 4.3 Update Google Cloud Console

Add your custom domain to OAuth redirect URIs:
- `https://vssglobal.biz/oauth/callback`

## Step 5: Testing Deployment

### 5.1 Test Website

1. Visit your deployed site
2. Navigate through all pages
3. Check that all links and buttons work
4. Verify responsive design on mobile

### 5.2 Test Booking System

1. Go to the contact page
2. Use the booking calendar
3. Fill out the appointment form
4. Submit a test booking
5. Verify:
   - Success message appears
   - Calendar event is created
   - Confirmation emails are sent

### 5.3 Test Serverless Functions

Check function logs in Netlify:
1. Go to Functions tab in Netlify Dashboard
2. Click on `book-appointment`
3. Check recent invocations and logs
4. Look for any errors or issues

## Step 6: Monitoring and Maintenance

### 6.1 Function Monitoring

Monitor your functions:
- **Invocations:** Track usage patterns
- **Duration:** Ensure functions complete quickly
- **Errors:** Monitor for failures
- **Logs:** Debug issues

### 6.2 Performance Optimization

- Enable Netlify's asset optimization
- Use Netlify's CDN for global distribution
- Monitor Core Web Vitals
- Optimize images and assets

### 6.3 Security

- Regularly rotate OAuth credentials
- Monitor function logs for suspicious activity
- Keep dependencies updated
- Use Netlify's security headers

## Troubleshooting

### Common Deployment Issues

**1. Function Build Errors**
```bash
# Check package.json dependencies
# Verify Node.js version compatibility
# Check function syntax and imports
```

**2. Environment Variables Not Working**
- Verify all variables are set in Netlify Dashboard
- Check variable names match exactly
- Redeploy after adding variables

**3. OAuth Redirect Errors**
- Verify redirect URI in Google Cloud Console
- Check HTTPS is used in production
- Ensure domain matches exactly

**4. Calendar/Email Errors**
- Check Google API quotas and limits
- Verify service account permissions
- Test credentials locally first

### Debug Steps

1. **Check Function Logs:**
   ```bash
   # In Netlify Dashboard → Functions → book-appointment → Logs
   ```

2. **Test Locally:**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Test functions locally
   netlify dev
   ```

3. **Verify Environment:**
   ```bash
   # Check all required variables are set
   # Test OAuth flow manually
   # Verify API credentials
   ```

## Deployment Checklist

### Pre-Deployment
- [ ] Code tested locally
- [ ] Environment variables documented
- [ ] Google Cloud Console configured
- [ ] OAuth flow tested
- [ ] Email functionality verified

### Deployment
- [ ] Repository connected to Netlify
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] Initial deployment successful
- [ ] Custom domain configured (if applicable)

### Post-Deployment
- [ ] Website loads correctly
- [ ] All pages accessible
- [ ] Booking system functional
- [ ] Calendar events created
- [ ] Emails sent successfully
- [ ] Function logs clean
- [ ] Performance optimized

### Ongoing Maintenance
- [ ] Monitor function usage
- [ ] Check error logs regularly
- [ ] Update dependencies monthly
- [ ] Rotate credentials quarterly
- [ ] Backup environment variables

## Support and Resources

### Netlify Resources
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Environment Variables Guide](https://docs.netlify.com/environment-variables/overview/)
- [Custom Domains Setup](https://docs.netlify.com/domains-https/custom-domains/)

### Google APIs
- [Google Calendar API Documentation](https://developers.google.com/calendar/api)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)

### Troubleshooting
- Check Netlify function logs for detailed errors
- Use browser developer tools to debug frontend issues
- Test API endpoints individually
- Verify all environment variables are correctly set

For additional support, contact the development team with:
- Deployment URL
- Error messages from function logs
- Steps to reproduce issues
- Environment configuration details
