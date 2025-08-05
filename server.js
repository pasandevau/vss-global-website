import express from 'express';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Helper function to create date in Adelaide timezone
function createAdelaideDate(year, month, day, hours = 0, minutes = 0) {
    // Create a date object that represents the exact Adelaide local time
    // without any timezone conversion
    const date = new Date();
    date.setFullYear(year);
    date.setMonth(month - 1); // month is 0-indexed
    date.setDate(day);
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Get calendar availability endpoint
app.get('/api/calendar-availability', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        // Fetch events from Google Calendar
        const response = await calendar.events.list({
            calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
            timeMin: new Date(startDate).toISOString(),
            timeMax: new Date(endDate).toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
            timeZone: 'Australia/Adelaide'
        });

        const events = response.data.items || [];
        
        // Extract booked time slots
        const bookedSlots = events.map(event => {
            if (event.start && event.start.dateTime) {
                const startTime = new Date(event.start.dateTime);
                const endTime = new Date(event.end.dateTime);
                
                return {
                    date: startTime.toISOString().split('T')[0], // YYYY-MM-DD format
                    startTime: startTime.toTimeString().slice(0, 5), // HH:MM format
                    endTime: endTime.toTimeString().slice(0, 5),
                    summary: event.summary || 'Busy'
                };
            }
            return null;
        }).filter(Boolean);

        res.json({
            success: true,
            bookedSlots: bookedSlots
        });

    } catch (error) {
        console.error('Error fetching calendar availability:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch calendar availability',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Book appointment endpoint
app.post('/api/book-appointment', async (req, res) => {
    try {
        const { name, email, phone, meetingType, projectType, description, date, time } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !meetingType || !projectType || !date || !time) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Create date-time for the appointment (Adelaide timezone)
        // Parse date and time components
        const [year, month, day] = date.split('-').map(Number);
        const [hours, minutes] = time.split(':').map(Number);
        
        // Create appointment date in Adelaide timezone using helper function
        const appointmentDateTime = createAdelaideDate(year, month, day, hours, minutes);
        
        // Debug logging
        console.log('=== APPOINTMENT DATE DEBUG ===');
        console.log('Input date string:', date);
        console.log('Input time string:', time);
        console.log('Parsed components:', { year, month, day, hours, minutes });
        console.log('Created appointmentDateTime:', appointmentDateTime);
        console.log('appointmentDateTime.toISOString():', appointmentDateTime.toISOString());
        console.log('appointmentDateTime in Adelaide timezone:', appointmentDateTime.toLocaleString('en-AU', { timeZone: 'Australia/Adelaide' }));
        console.log('===============================');
        
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

        res.json({
            success: true,
            message: 'Appointment booked successfully',
            appointmentDetails: {
                date: formattedDate,
                time: formattedTime,
                meetingType: meetingType === 'video-call' ? 'Video Call' : 'In-Person Meeting'
            },
            meetingLink: meetingLink || null,
            calendarEventId: calendarResponse.data.id
        });

    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send your message. Please try again or contact us directly at admin@vssglobal.biz.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, company, service, budget, timeline, message, newsletter } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !service || !message) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: firstName, lastName, email, service, and message are required'
            });
        }

        // Create full name
        const fullName = `${firstName} ${lastName}`;
        
        // Format service name for display
        const serviceNames = {
            'web-development': 'Web Design & Development',
            'software-development': 'Custom Software Development',
            'mobile-development': 'Mobile App Development',
            'digital-marketing': 'Digital Marketing',
            'ui-ux-design': 'UI/UX Design',
            'analytics-optimization': 'Analytics & Optimization',
            'consultation': 'General Consultation'
        };
        
        const serviceName = serviceNames[service] || service;
        
        // Format budget and timeline for display
        const budgetNames = {
            'under-10k': 'Under $10,000',
            '10k-25k': '$10,000 - $25,000',
            '25k-50k': '$25,000 - $50,000',
            '50k-100k': '$50,000 - $100,000',
            'over-100k': 'Over $100,000',
            'not-sure': 'Not sure yet'
        };
        
        const timelineNames = {
            'asap': 'ASAP',
            '1-3-months': '1-3 months',
            '3-6-months': '3-6 months',
            '6-12-months': '6-12 months',
            'flexible': 'Flexible'
        };
        
        const budgetDisplay = budget ? budgetNames[budget] || budget : 'Not specified';
        const timelineDisplay = timeline ? timelineNames[timeline] || timeline : 'Not specified';
        
        // Client confirmation email
        const clientEmailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FFD700, #FFA500); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: #333; margin: 0; font-size: 28px; }
        .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
        .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #FFD700; margin: 15px 0; }
        .footer { background: #333; color: #fff; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .btn { display: inline-block; background: #FFD700; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Thank You for Reaching Out!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">We've received your project inquiry</p>
        </div>
        
        <div class="content">
            <p>Dear ${fullName},</p>
            
            <p>Thank you for your interest in VSS Global! We're excited about the possibility of working together on your <strong>${serviceName}</strong> project.</p>
            
            <div class="highlight">
                <h3 style="margin-top: 0;">📋 Your Project Summary</h3>
                <p><strong>Service:</strong> ${serviceName}</p>
                <p><strong>Budget Range:</strong> ${budgetDisplay}</p>
                <p><strong>Timeline:</strong> ${timelineDisplay}</p>
                ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
            </div>
            
            <h3>🎯 What Happens Next?</h3>
            <ul>
                <li><strong>Within 24 Hours:</strong> Our team will review your project details and contact you</li>
                <li><strong>Initial Consultation:</strong> We'll schedule a free consultation to discuss your vision</li>
                <li><strong>Custom Proposal:</strong> You'll receive a detailed proposal tailored to your needs</li>
                <li><strong>Project Kickoff:</strong> Once approved, we'll begin bringing your ideas to life</li>
            </ul>
            
            <div class="highlight">
                <h3 style="margin-top: 0;">💡 In the Meantime</h3>
                <p>Feel free to explore our portfolio and case studies on our website. If you have any urgent questions, don't hesitate to contact us directly at <strong>admin@vssglobal.biz</strong>.</p>
            </div>
            
            <p>We're looking forward to discussing how VSS Global can help transform your digital presence!</p>
            
            <p>Best regards,<br>
            <strong>The VSS Global Team</strong><br>
            <a href="https://vssglobal.biz">vssglobal.biz</a></p>
        </div>
        
        <div class="footer">
            <p><strong>VSS Global - Your Digital Success Partner</strong></p>
            <p>Web Development | Software Solutions | Digital Marketing</p>
        </div>
    </div>
</body>
</html>`;

        // Team notification email
        const teamEmailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #333; color: #fff; padding: 20px; text-align: center; }
        .content { background: #fff; padding: 20px; border: 1px solid #ddd; }
        .client-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .project-details { background: #fff3cd; padding: 15px; border-left: 4px solid #FFD700; margin: 15px 0; }
        .urgent { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 New Project Inquiry - VSS Global</h1>
            <p style="margin: 0;">Action Required: Contact within 24 hours</p>
        </div>
        
        <div class="content">
            <div class="urgent">
                <h3 style="margin-top: 0;">⏰ Priority Response Required</h3>
                <p>New client inquiry received. Please respond within 24 hours as per our guarantee.</p>
            </div>
            
            <div class="client-info">
                <h3 style="margin-top: 0;">👤 Client Information</h3>
                <p><strong>Name:</strong> ${fullName}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Company:</strong> ${company || 'Not provided'}</p>
                <p><strong>Newsletter Signup:</strong> ${newsletter ? 'Yes' : 'No'}</p>
            </div>
            
            <div class="project-details">
                <h3 style="margin-top: 0;">🎯 Project Details</h3>
                <p><strong>Service Interest:</strong> ${serviceName}</p>
                <p><strong>Budget Range:</strong> ${budgetDisplay}</p>
                <p><strong>Timeline:</strong> ${timelineDisplay}</p>
                
                <h4>📝 Project Description:</h4>
                <p style="background: #fff; padding: 15px; border-left: 4px solid #FFD700; margin: 10px 0;">${message}</p>
            </div>
            
            <div class="client-info">
                <h3 style="margin-top: 0;">📋 Next Steps Checklist</h3>
                <ul>
                    <li>□ Review client requirements and project scope</li>
                    <li>□ Research client's industry and competitors</li>
                    <li>□ Prepare relevant portfolio examples for ${serviceName.toLowerCase()}</li>
                    <li>□ Contact client within 24 hours</li>
                    <li>□ Schedule initial consultation</li>
                    <li>□ Prepare custom proposal</li>
                    <li>□ Add to CRM system</li>
                    ${newsletter ? '<li>□ Add to newsletter list</li>' : ''}
                </ul>
            </div>
            
            <p><strong>Received:</strong> ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Adelaide' })} (ACST)</p>
        </div>
    </div>
</body>
</html>`;

        // Send emails
        const clientMailOptions = {
            from: `"VSS Global" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🚀 Thank You for Your Project Inquiry - VSS Global',
            html: clientEmailHtml
        };

        const teamMailOptions = {
            from: `"VSS Global Contact Form" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `🚨 New Project Inquiry: ${serviceName} - ${fullName}`,
            html: teamEmailHtml
        };

        // Send both emails
        await Promise.all([
            transporter.sendMail(clientMailOptions),
            transporter.sendMail(teamMailOptions)
        ]);

        res.json({
            success: true,
            message: 'Thank you for your inquiry! We\'ll contact you within 24 hours.',
            contactDetails: {
                name: fullName,
                email: email,
                service: serviceName
            }
        });

    } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send your message. Please try again or contact us directly at admin@vssglobal.biz.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Newsletter subscription endpoint
app.post('/api/newsletter', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required'
            });
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }
        
        console.log('Newsletter subscription request:', { email });
        
        // Welcome email to subscriber
        const welcomeEmailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to VSS Global Newsletter</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                    .content { padding: 40px 30px; }
                    .welcome-message { background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                    .benefits { margin: 30px 0; }
                    .benefit-item { display: flex; align-items: flex-start; margin: 15px 0; }
                    .benefit-icon { color: #667eea; margin-right: 10px; font-size: 18px; }
                    .footer { background-color: #2c3e50; color: white; padding: 30px; text-align: center; }
                    .social-links { margin: 20px 0; }
                    .social-links a { color: white; text-decoration: none; margin: 0 10px; }
                    .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to VSS Global!</h1>
                        <p>Thank you for subscribing to our newsletter</p>
                    </div>
                    
                    <div class="content">
                        <div class="welcome-message">
                            <h2>🚀 You're now part of our digital community!</h2>
                            <p>Welcome to the VSS Global newsletter! We're excited to share valuable insights, industry trends, and expert tips to help you stay ahead in the digital landscape.</p>
                        </div>
                        
                        <div class="benefits">
                            <h3>What you can expect:</h3>
                            <div class="benefit-item">
                                <span class="benefit-icon">📊</span>
                                <div>
                                    <strong>Industry Insights:</strong> Latest trends in web development, digital marketing, and technology
                                </div>
                            </div>
                            <div class="benefit-item">
                                <span class="benefit-icon">💡</span>
                                <div>
                                    <strong>Expert Tips:</strong> Actionable advice from our team of digital specialists
                                </div>
                            </div>
                            <div class="benefit-item">
                                <span class="benefit-icon">🎯</span>
                                <div>
                                    <strong>Case Studies:</strong> Real success stories and project highlights
                                </div>
                            </div>
                            <div class="benefit-item">
                                <span class="benefit-icon">🔧</span>
                                <div>
                                    <strong>Tools & Resources:</strong> Curated tools and resources to boost your business
                                </div>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://vssglobal.biz/blog.html" class="btn">Explore Our Blog</a>
                        </div>
                        
                        <p>Have a project in mind? We'd love to help bring your vision to life!</p>
                        <div style="text-align: center;">
                            <a href="https://vssglobal.biz/contact.html" class="btn">Get In Touch</a>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p><strong>VSS Global</strong></p>
                        <p>Transforming businesses through exceptional digital experiences</p>
                        <div class="social-links">
                            <a href="https://vssglobal.biz/contact.html">LinkedIn</a> |
                            <a href="https://vssglobal.biz/contact.html">Instagram</a> |
                            <a href="https://vssglobal.biz/contact.html">Facebook</a>
                        </div>
                        <p style="font-size: 12px; margin-top: 20px; opacity: 0.8;">
                            You're receiving this email because you subscribed to our newsletter.<br>
                            If you no longer wish to receive these emails, please contact us.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        // Team notification email
        const notificationEmailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>New Newsletter Subscription</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #667eea; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                    .highlight { background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>📧 New Newsletter Subscription</h2>
                    </div>
                    <div class="content">
                        <div class="highlight">
                            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                            <p><strong>Subscription Date:</strong> ${new Date().toLocaleString()}</p>
                            <p><strong>Source:</strong> VSS Global Website Newsletter</p>
                        </div>
                        
                        <p><strong>Next Steps:</strong></p>
                        <ul>
                            <li>Add email to newsletter mailing list</li>
                            <li>Welcome email has been sent automatically</li>
                            <li>Consider following up with personalized content</li>
                        </ul>
                        
                        <p>This subscriber is now part of your growing digital community!</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        // Send welcome email to subscriber
        const welcomeEmail = {
            from: `"VSS Global" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🎉 Welcome to VSS Global Newsletter - Your Digital Journey Starts Here!',
            html: welcomeEmailHtml
        };
        
        // Send notification email to team
        const notificationEmail = {
            from: `"VSS Global Newsletter" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `📧 New Newsletter Subscription: ${email}`,
            html: notificationEmailHtml
        };
        
        // Send both emails
        await Promise.all([
            transporter.sendMail(welcomeEmail),
            transporter.sendMail(notificationEmail)
        ]);
        
        console.log('Newsletter subscription emails sent successfully');
        
        res.json({
            success: true,
            message: 'Thank you for subscribing! Check your email for a welcome message.',
            subscriber: {
                email: email,
                subscribedAt: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Error processing newsletter subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to subscribe. Please try again or contact us directly.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`VSS Global server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;
