import { google } from 'googleapis';
import readline from 'readline';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// OAuth 2.0 credentials - you'll get these from Google Cloud Console
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';

// Scopes for Google Calendar and Gmail
const SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/gmail.send'
];

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

function getAuthUrl() {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent' // Force consent screen to get refresh token
    });
    return authUrl;
}

async function getTokens(code) {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        return tokens;
    } catch (error) {
        console.error('Error getting tokens:', error);
        throw error;
    }
}

async function main() {
    console.log('🔧 VSS Global - Google Calendar Integration Setup');
    console.log('================================================\n');

    // Check if credentials are set
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error('❌ Missing Google OAuth credentials!');
        console.log('\nPlease set the following environment variables in your .env file:');
        console.log('GOOGLE_CLIENT_ID=your_client_id');
        console.log('GOOGLE_CLIENT_SECRET=your_client_secret');
        console.log('GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback');
        console.log('\nGet these from: https://console.cloud.google.com/apis/credentials');
        process.exit(1);
    }

    console.log('✅ OAuth credentials found in environment variables');
    console.log('\n📋 Setup Steps:');
    console.log('1. Open the authorization URL in your browser');
    console.log('2. Sign in with your Google account');
    console.log('3. Grant permissions for Calendar and Gmail access');
    console.log('4. Copy the authorization code from the redirect URL');
    console.log('5. Paste it here to get your refresh token\n');

    // Generate authorization URL
    const authUrl = getAuthUrl();
    console.log('🔗 Authorization URL:');
    console.log(authUrl);
    console.log('\n📝 Instructions:');
    console.log('1. Click the URL above or copy it to your browser');
    console.log('2. Complete the OAuth flow');
    console.log('3. You\'ll be redirected to a URL like:');
    console.log('   http://localhost:3000/auth/google/callback?code=AUTHORIZATION_CODE');
    console.log('4. Copy the "code" parameter value from the URL');

    // Create readline interface
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('\n🔑 Enter the authorization code: ', async (code) => {
        try {
            console.log('\n⏳ Exchanging code for tokens...');
            const tokens = await getTokens(code);

            console.log('\n🎉 Success! Here are your tokens:');
            console.log('=====================================');
            console.log('\n📋 Add these to your .env file:');
            console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
            
            if (tokens.access_token) {
                console.log('\n🔍 Access Token (for testing):');
                console.log(`GOOGLE_ACCESS_TOKEN=${tokens.access_token}`);
            }

            console.log('\n📧 Don\'t forget to also set:');
            console.log('GOOGLE_CALENDAR_ID=your-email@domain.com');
            console.log('EMAIL_USER=your-gmail@gmail.com');
            console.log('EMAIL_APP_PASSWORD=your-gmail-app-password');

            console.log('\n✅ Setup complete! Your Google Calendar integration is ready.');
            console.log('\n🚀 Next steps:');
            console.log('1. Add the GOOGLE_REFRESH_TOKEN to your .env file');
            console.log('2. Set your GOOGLE_CALENDAR_ID (usually your email)');
            console.log('3. Configure Gmail app password for email notifications');
            console.log('4. Test the integration by running: npm run server');

        } catch (error) {
            console.error('\n❌ Error getting tokens:', error.message);
            console.log('\n🔧 Troubleshooting:');
            console.log('- Make sure the authorization code is correct');
            console.log('- Check that your OAuth credentials are valid');
            console.log('- Ensure the redirect URI matches your Google Cloud Console settings');
        }

        rl.close();
    });
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n\n👋 Setup cancelled. Run this script again when ready.');
    process.exit(0);
});

// Run the setup
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { getAuthUrl, getTokens };
