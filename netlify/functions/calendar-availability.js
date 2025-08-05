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
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Server configuration error',
                    bookedSlots: [] // Return empty array so calendar still works
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

        // Fetch events from Google Calendar
        const response = await calendar.events.list({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            timeMin: new Date(startDate).toISOString(),
            timeMax: new Date(endDate).toISOString(),
            singleEvents: true,
            orderBy: 'startTime'
        });

        const events = response.data.items || [];

        // Transform events into booked slots format
        const bookedSlots = events.map(event => {
            const startDateTime = new Date(event.start.dateTime || event.start.date);
            const endDateTime = new Date(event.end.dateTime || event.end.date);
            
            return {
                date: startDateTime.toISOString().split('T')[0], // YYYY-MM-DD format
                startTime: startDateTime.toTimeString().substring(0, 5), // HH:MM format
                endTime: endDateTime.toTimeString().substring(0, 5), // HH:MM format
                title: event.summary || 'Appointment',
                id: event.id
            };
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
