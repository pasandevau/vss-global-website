exports.handler = async (event, context) => {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ success: false, message: 'Method not allowed' })
        };
    }

    try {
        console.log('Function called successfully');
        console.log('Event body:', event.body);
        console.log('Environment variables check:');
        console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
        console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
        
        const requestData = JSON.parse(event.body);
        console.log('Parsed request data:', requestData);

        // Simple validation
        const { name, email, phone, meetingType, projectType, date, time } = requestData;
        
        if (!name || !email || !phone || !meetingType || !projectType || !date || !time) {
            console.log('Missing required fields');
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Missing required fields',
                    received: { name, email, phone, meetingType, projectType, date, time }
                })
            };
        }

        // For now, just return success without actually creating calendar events
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                message: 'Test booking successful - no actual calendar event created',
                appointmentDetails: {
                    date: date,
                    time: time,
                    meetingType: meetingType
                },
                debug: {
                    envVarsSet: {
                        GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
                        EMAIL_USER: !!process.env.EMAIL_USER,
                        GOOGLE_REFRESH_TOKEN: !!process.env.GOOGLE_REFRESH_TOKEN
                    }
                }
            })
        };

    } catch (error) {
        console.error('Error in test function:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                message: 'Test function error',
                error: error.message,
                stack: error.stack
            })
        };
    }
};
