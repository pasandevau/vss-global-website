const { google } = require('googleapis');

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Get query parameters
        const { startDate, endDate } = event.queryStringParameters || {};

        if (!startDate || !endDate) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Missing required parameters: startDate and endDate' 
                })
            };
        }

        console.log('Calendar availability request received:', { startDate, endDate });
        
        // Validate environment variables
        const requiredEnvVars = [
            'GOOGLE_CLIENT_ID',
            'GOOGLE_CLIENT_SECRET', 
            'GOOGLE_REFRESH_TOKEN',
            'GOOGLE_CALENDAR_ID'
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            console.error('Missing environment variables:', missingVars);
            console.log('Available env vars:', Object.keys(process.env).filter(key => key.startsWith('GOOGLE')));
            return {
                statusCode: 200, // Return 200 so frontend doesn't error
                headers,
                body: JSON.stringify({ 
                    success: true,
                    error: 'Server configuration incomplete',
                    bookedSlots: [], // Return empty array so calendar still works
                    debug: { missingVars, availableVars: Object.keys(process.env).filter(key => key.startsWith('GOOGLE')) }
                })
            };
        }

        // Initialize Google Calendar API
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        oauth2Client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        console.log('Attempting to fetch calendar events...');
        console.log('Calendar ID:', process.env.GOOGLE_CALENDAR_ID);
        
        // Fetch events from Google Calendar
        const response = await calendar.events.list({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            timeMin: startDate,
            timeMax: endDate,
            singleEvents: true,
            orderBy: 'startTime'
        });

        console.log('Calendar API response status:', response.status);
        const events = response.data.items || [];
        console.log('Found events:', events.length);
        
        const bookedSlots = [];

        // Process events to extract booked time slots
        events.forEach(event => {
            console.log('Processing event:', event.summary, event.start);
            if (event.start && event.start.dateTime) {
                const startTime = new Date(event.start.dateTime);
                const endTime = new Date(event.end.dateTime);
                
                const slot = {
                    date: startTime.toISOString().split('T')[0], // YYYY-MM-DD format
                    time: startTime.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true,
                        timeZone: 'Australia/Adelaide'
                    }),
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                    title: event.summary || 'Booked Appointment'
                };
                
                console.log('Adding booked slot:', slot);
                bookedSlots.push(slot);
            }
        });

        console.log(`Found ${bookedSlots.length} booked slots between ${startDate} and ${endDate}`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                bookedSlots,
                dateRange: {
                    start: startDate,
                    end: endDate
                }
            })
        };

    } catch (error) {
        console.error('Error fetching calendar availability:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to fetch calendar availability',
                message: error.message,
                bookedSlots: [] // Return empty array so calendar still works
            })
        };
    }
};
