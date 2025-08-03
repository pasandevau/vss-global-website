const { google } = require('googleapis');
const nodemailer = require('nodemailer');

// Google Calendar and Gmail setup
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

exports.handler = async (incomingEvent, context) => {
    // Handle CORS preflight requests
    if (incomingEvent.httpMethod === 'OPTIONS') {
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
    if (incomingEvent.httpMethod !== 'POST') {
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
        const { name, email, phone, meetingType, projectType, description, date, time } = JSON.parse(incomingEvent.body);

        // Validate required fields
        if (!name || !email || !phone || !meetingType || !projectType || !date || !time) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Missing required fields'
                })
            };
        }

        // Create date-time for the appointment (Adelaide timezone)
        const appointmentDateTime = new Date(`${date}T${time}:00+09:30`);
        const endDateTime = new Date(appointmentDateTime.getTime() + 45 * 60000); // 45 minutes later

        // Format date and time for display
        const formattedDate = appointmentDateTime.toLocaleDateString('en-AU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Australia/Adelaide'
        });

        const formattedTime = appointmentDateTime.toLocaleTimeString('en-AU', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Australia/Adelaide'
        });

        // Create Google Calendar event
        const event = {
            summary: `VSS Global Consultation - ${name}`,
            description: `
Consultation with ${name}

Contact Details:
- Email: ${email}
- Phone: ${phone}
- Meeting Type: ${meetingType}
- Project Type: ${projectType}

Project Description:
${description}

Meeting Details:
- Duration: 45 minutes
- Type: ${meetingType === 'video-call' ? 'Video Call (Google Meet)' : 'In-Person Meeting'}

Preparation Checklist:
□ Review client requirements
□ Prepare project timeline discussion
□ Gather relevant portfolio examples
□ Prepare pricing structure
□ Send NDA if required
            `.trim(),
            start: {
                dateTime: appointmentDateTime.toISOString(),
                timeZone: 'Australia/Adelaide'
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: 'Australia/Adelaide'
            },
            attendees: [
                { email: email },
                { email: process.env.GOOGLE_CALENDAR_ID || 'admin@vssglobal.biz' }
            ],
            conferenceData: meetingType === 'video-call' ? {
                createRequest: {
                    requestId: `vss-${Date.now()}`,
                    conferenceSolutionKey: { type: 'hangoutsMeet' }
                }
            } : undefined
        };

        // Insert event into Google Calendar
        const calendarResponse = await calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
            resource: event,
            conferenceDataVersion: meetingType === 'video-call' ? 1 : 0,
            sendUpdates: 'all'
        });

        const meetingLink = calendarResponse.data.conferenceData?.entryPoints?.[0]?.uri;

        // Email templates
        const clientEmailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FFD700, #FFA500); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: #000; margin: 0; font-size: 28px; }
        .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
        .appointment-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .detail-label { font-weight: bold; color: #555; }
        .meeting-link { background: #FFD700; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .meeting-link a { color: #000; text-decoration: none; font-weight: bold; }
        .footer { background: #333; color: #fff; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .nda-section { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Appointment Confirmed!</h1>
            <p style="margin: 10px 0 0 0; color: #000;">Your consultation with VSS Global is confirmed</p>
        </div>
        
        <div class="content">
            <p>Dear ${name},</p>
            
            <p>Thank you for booking a consultation with VSS Global! We're excited to discuss your ${projectType.toLowerCase()} project and explore how we can bring your vision to life.</p>
            
            <div class="appointment-details">
                <h3 style="margin-top: 0; color: #333;">📅 Appointment Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span>${formattedDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span>${formattedTime} (ACST)</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Duration:</span>
                    <span>45 minutes</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Meeting Type:</span>
                    <span>${meetingType === 'video-call' ? 'Video Call' : 'In-Person Meeting'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Project Type:</span>
                    <span>${projectType}</span>
                </div>
            </div>

            ${meetingLink ? `
            <div class="meeting-link">
                <p style="margin: 0 0 10px 0; font-weight: bold;">🔗 Video Call Link</p>
                <a href="${meetingLink}" target="_blank">${meetingLink}</a>
                <p style="margin: 10px 0 0 0; font-size: 14px;">Click the link above to join the meeting at your scheduled time</p>
            </div>
            ` : `
            <div class="appointment-details">
                <h4>📍 Meeting Location</h4>
                <p>We'll send you the meeting location details separately, or feel free to contact us if you need directions.</p>
            </div>
            `}

            <div class="nda-section">
                <h4 style="margin-top: 0;">📋 Before Our Meeting</h4>
                <p><strong>Preparation:</strong> Please prepare any relevant materials, requirements, or questions about your project. The more details you can share, the better we can tailor our discussion to your needs.</p>
                <p><strong>NDA:</strong> If your project involves sensitive information, we're happy to sign a Non-Disclosure Agreement before our consultation. Please let us know in advance.</p>
            </div>

            <p>If you need to reschedule or have any questions before our meeting, please don't hesitate to contact us at <a href="mailto:admin@vssglobal.biz">admin@vssglobal.biz</a> or call us directly.</p>

            <p>We look forward to discussing your project and showing you how VSS Global can help achieve your goals!</p>

            <p>Best regards,<br>
            <strong>The VSS Global Team</strong><br>
            <a href="https://vssglobal.biz">vssglobal.biz</a></p>
        </div>
        
        <div class="footer">
            <p style="margin: 0;">VSS Global - Your Digital Success Partner</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Web Development | Software Solutions | Digital Marketing</p>
        </div>
    </div>
</body>
</html>
        `;

        const teamEmailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FFD700, #FFA500); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
        .client-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .checklist { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .checklist ul { margin: 0; padding-left: 20px; }
        .footer { background: #333; color: #fff; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0; color: #000;">🗓️ New Appointment Booked</h2>
        </div>
        
        <div class="content">
            <p><strong>New consultation appointment has been scheduled:</strong></p>
            
            <div class="client-details">
                <h3 style="margin-top: 0;">👤 Client Information</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
                <p><strong>Meeting Type:</strong> ${meetingType === 'video-call' ? 'Video Call' : 'In-Person Meeting'}</p>
                <p><strong>Project Type:</strong> ${projectType}</p>
                
                <h4>📝 Project Description:</h4>
                <p style="background: #fff; padding: 15px; border-left: 4px solid #FFD700; margin: 10px 0;">${description}</p>
            </div>

            <div class="client-details">
                <h3 style="margin-top: 0;">📅 Appointment Details</h3>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${formattedTime} (ACST)</p>
                <p><strong>Duration:</strong> 45 minutes</p>
                ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
            </div>

            <div class="checklist">
                <h3 style="margin-top: 0;">✅ Pre-Meeting Preparation Checklist</h3>
                <ul>
                    <li>Review client's project requirements and description</li>
                    <li>Prepare relevant portfolio examples for ${projectType.toLowerCase()}</li>
                    <li>Research client's industry and competitors if applicable</li>
                    <li>Prepare project timeline and milestone discussions</li>
                    <li>Review current pricing structure for ${projectType.toLowerCase()}</li>
                    <li>Prepare technical questions about requirements</li>
                    <li>Have NDA ready if project involves sensitive information</li>
                    <li>Prepare follow-up proposal template</li>
                </ul>
            </div>

            <p><strong>Calendar Event:</strong> This appointment has been automatically added to the team calendar with all details.</p>
            
            <p><strong>Next Steps:</strong> The client has received a confirmation email with all appointment details and preparation guidelines.</p>
        </div>
        
        <div class="footer">
            <p style="margin: 0;">VSS Global Team Notification</p>
        </div>
    </div>
</body>
</html>
        `;

        // Send confirmation email to client
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Appointment Confirmed - VSS Global Consultation on ${formattedDate}`,
            html: clientEmailHtml
        });

        // Send notification email to team
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to team email
            subject: `New Appointment: ${name} - ${formattedDate} at ${formattedTime}`,
            html: teamEmailHtml
        });

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                message: 'Appointment booked successfully',
                appointmentDetails: {
                    date: formattedDate,
                    time: formattedTime,
                    meetingType: meetingType === 'video-call' ? 'Video Call' : 'In-Person Meeting'
                },
                meetingLink: meetingLink || null,
                calendarEventId: calendarResponse.data.id
            })
        };

    } catch (error) {
        console.error('Error booking appointment:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            code: error.code
        });
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                message: 'Failed to book appointment. Please try again or contact us directly.',
                error: error.message,
                errorType: error.name,
                debug: {
                    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
                    hasEmailUser: !!process.env.EMAIL_USER,
                    hasRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN
                }
            })
        };
    }
};
