# Google Calendar Integration Setup Guide

This guide will walk you through setting up Google Calendar integration for the VSS Global appointment booking system.

## Overview

The integration includes:
- ✅ Automatic Google Calendar event creation
- ✅ Email notifications to clients and team
- ✅ Video call link generation (Google Meet)
- ✅ Professional email templates
- ✅ Timezone handling (Australia/Adelaide)

## Prerequisites

- Google Cloud Console account
- Gmail account for sending emails
- Node.js installed on your system

## Step 1: Google Cloud Console Setup

### 1.1 Create a New Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name: "VSS Global Calendar Integration"
4. Click "Create"

### 1.2 Enable Required APIs

1. Go to "APIs & Services" → "Library"
2. Search and enable these APIs:
   - **Google Calendar API**
   - **Gmail API**

### 1.3 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Configure OAuth consent screen first:
   - User Type: External
   - App name: "VSS Global Booking System"
   - User support email: your-email@domain.com
   - Developer contact: your-email@domain.com
   - Add scopes: `../auth/calendar` and `../auth/gmail.send`
   - Add test users: your-email@domain.com

4. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: "VSS Global Web Client"
   - Authorized redirect URIs:
     - `http://localhost:3000/oauth/callback` (for setup)
     - `https://your-netlify-domain.netlify.app/oauth/callback` (for production)

5. Download the JSON file or copy the Client ID and Client Secret

## Step 2: Gmail App Password Setup

### 2.1 Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled

### 2.2 Generate App Password

1. Go to "2-Step Verification" → "App passwords"
2. Select app: "Mail"
3. Select device: "Other" → "VSS Global Server"
4. Copy the generated 16-character password

## Step 3: Environment Variables Setup

### 3.1 Create .env File

Create a `.env` file in your project root:

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback

# Google Calendar Settings
GOOGLE_CALENDAR_ID=admin@vssglobal.biz
GOOGLE_REFRESH_TOKEN=your_refresh_token_here

# Email Settings
EMAIL_USER=admin@vssglobal.biz
EMAIL_APP_PASSWORD=your_gmail_app_password_here

# Server Settings
PORT=3000
NODE_ENV=development
```

### 3.2 Get Refresh Token

Run the OAuth setup helper:

```bash
node setup-google-auth.js
```

Follow the instructions to:
1. Open the authorization URL
2. Complete the OAuth flow
3. Copy the authorization code
4. Get your refresh token

Add the refresh token to your `.env` file.

## Step 4: Test the Integration

### 4.1 Start the Development Server

```bash
npm run server:dev
```

### 4.2 Test the Health Endpoint

Visit: `http://localhost:3000/api/health`

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### 4.3 Test Appointment Booking

1. Open your website
2. Navigate to the contact page
3. Use the booking calendar to book a test appointment
4. Check:
   - Google Calendar for the created event
   - Email inbox for confirmation emails
   - Console logs for any errors

## Step 5: Production Deployment

### 5.1 Netlify Environment Variables

In your Netlify dashboard, go to Site Settings → Environment Variables and add:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=https://your-domain.netlify.app/oauth/callback
GOOGLE_CALENDAR_ID=admin@vssglobal.biz
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
EMAIL_USER=admin@vssglobal.biz
EMAIL_APP_PASSWORD=your_gmail_app_password_here
NODE_ENV=production
```

### 5.2 Update OAuth Redirect URIs

In Google Cloud Console:
1. Go to "APIs & Services" → "Credentials"
2. Edit your OAuth 2.0 Client ID
3. Add your production domain to Authorized redirect URIs:
   - `https://your-domain.netlify.app/oauth/callback`

## Troubleshooting

### Common Issues

**1. "Invalid credentials" error**
- Check that all environment variables are set correctly
- Verify OAuth credentials in Google Cloud Console
- Ensure APIs are enabled

**2. "Refresh token not found"**
- Re-run the OAuth setup with `prompt: 'consent'`
- Make sure you're using the correct Google account

**3. "Calendar event not created"**
- Check GOOGLE_CALENDAR_ID is correct
- Verify Calendar API is enabled
- Check server logs for detailed errors

**4. "Email not sent"**
- Verify Gmail app password is correct
- Check EMAIL_USER matches the Gmail account
- Ensure 2FA is enabled on Gmail account

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will show detailed error messages in the console.

### Testing Checklist

- [ ] Google Calendar API enabled
- [ ] Gmail API enabled
- [ ] OAuth credentials configured
- [ ] Refresh token obtained
- [ ] Gmail app password set
- [ ] Environment variables configured
- [ ] Health endpoint responds
- [ ] Test appointment creates calendar event
- [ ] Confirmation emails sent
- [ ] Video call links generated (for video calls)

## Security Notes

- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- Regularly rotate OAuth credentials and app passwords
- Monitor API usage in Google Cloud Console
- Use HTTPS in production

## Support

If you encounter issues:

1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test each component individually (OAuth, Calendar API, Gmail API)
4. Consult Google's API documentation for specific error codes

For additional help, contact the development team with:
- Error messages from server logs
- Steps to reproduce the issue
- Environment details (development/production)
