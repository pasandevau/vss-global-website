const nodemailer = require('nodemailer');

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

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse request body
        const contactData = JSON.parse(event.body);
        
        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'message'];
        const missingFields = requiredFields.filter(field => !contactData[field]);
        
        if (missingFields.length > 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Missing required fields',
                    missingFields
                })
            };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactData.email)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Invalid email format'
                })
            };
        }

        // Check for required environment variables
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Missing email configuration');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Server configuration error'
                })
            };
        }

        // Create nodemailer transporter
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const fullName = `${contactData.firstName} ${contactData.lastName}`;
        const currentDate = new Date().toLocaleDateString('en-AU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Australia/Adelaide'
        });

        // Email to client (confirmation)
        const clientEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thank You for Contacting VSS Global</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 30px; text-align: center; }
                .header h1 { color: #1a1a1a; margin: 0; font-size: 28px; font-weight: 700; }
                .content { padding: 30px; }
                .highlight { background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #FFD700; margin: 20px 0; }
                .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .details h3 { color: #1a1a1a; margin-top: 0; }
                .footer { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
                .social-links { margin: 15px 0; }
                .social-links a { color: #FFD700; text-decoration: none; margin: 0 10px; }
                .btn { display: inline-block; background: #FFD700; color: #1a1a1a; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Thank You for Contacting VSS Global!</h1>
                </div>
                <div class="content">
                    <p>Dear ${fullName},</p>
                    
                    <p>Thank you for reaching out to VSS Global! We've successfully received your inquiry and our team is excited to help bring your digital vision to life.</p>
                    
                    <div class="highlight">
                        <strong>📋 What happens next?</strong>
                        <ul>
                            <li>✅ Our team will review your project details within 24 hours</li>
                            <li>📞 We'll contact you to discuss your requirements in detail</li>
                            <li>💡 We'll provide personalized recommendations for your project</li>
                            <li>📊 You'll receive a detailed proposal with timeline and pricing</li>
                        </ul>
                    </div>
                    
                    <div class="details">
                        <h3>📝 Your Inquiry Details:</h3>
                        <p><strong>Service Interest:</strong> ${contactData.service || 'Not specified'}</p>
                        <p><strong>Budget Range:</strong> ${contactData.budget || 'Not specified'}</p>
                        <p><strong>Timeline:</strong> ${contactData.timeline || 'Not specified'}</p>
                        <p><strong>Company:</strong> ${contactData.company || 'Not specified'}</p>
                        <p><strong>Message:</strong> ${contactData.message}</p>
                    </div>
                    
                    <p>In the meantime, feel free to:</p>
                    <div style="text-align: center;">
                        <a href="https://vssglobal.biz/portfolio.html" class="btn">View Our Portfolio</a>
                        <a href="https://vssglobal.biz/process.html" class="btn">Learn Our Process</a>
                    </div>
                    
                    <p>If you have any urgent questions, don't hesitate to contact us directly at <strong>admin@vssglobal.biz</strong> or <strong>+61 421530032</strong>.</p>
                    
                    <p>We're looking forward to working with you!</p>
                    
                    <p>Best regards,<br>
                    <strong>The VSS Global Team</strong><br>
                    Digital Innovation Partners</p>
                </div>
                <div class="footer">
                    <p><strong>VSS Global</strong> | Adelaide, South Australia</p>
                    <p>Email: admin@vssglobal.biz | Phone: +61 421530032</p>
                    <div class="social-links">
                        <a href="https://vssglobal.biz/contact.html">LinkedIn</a> |
                        <a href="https://vssglobal.biz/contact.html">Instagram</a> |
                        <a href="https://vssglobal.biz/contact.html">Facebook</a>
                    </div>
                    <p style="font-size: 12px; margin-top: 20px;">
                        This email was sent because you contacted us through our website. 
                        If you have any questions, please contact us at admin@vssglobal.biz
                    </p>
                </div>
            </div>
        </body>
        </html>`;

        // Email to VSS Global team (notification)
        const teamEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Form Submission - VSS Global</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); padding: 30px; text-align: center; }
                .header h1 { color: #FFD700; margin: 0; font-size: 28px; font-weight: 700; }
                .content { padding: 30px; }
                .client-info { background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3; margin: 20px 0; }
                .project-details { background: #f3e5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #9c27b0; margin: 20px 0; }
                .priority { background: #ffebee; padding: 15px; border-radius: 8px; border-left: 4px solid #f44336; margin: 20px 0; }
                .actions { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
                .btn { display: inline-block; background: #FFD700; color: #1a1a1a; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚨 New Contact Form Submission</h1>
                    <p style="color: #FFD700; margin: 0;">Received on ${currentDate}</p>
                </div>
                <div class="content">
                    <div class="priority">
                        <strong>⚡ Action Required:</strong> New client inquiry received - respond within 24 hours
                    </div>
                    
                    <div class="client-info">
                        <h3>👤 Client Information</h3>
                        <p><strong>Name:</strong> ${fullName}</p>
                        <p><strong>Email:</strong> <a href="mailto:${contactData.email}">${contactData.email}</a></p>
                        <p><strong>Phone:</strong> ${contactData.phone || 'Not provided'}</p>
                        <p><strong>Company:</strong> ${contactData.company || 'Not provided'}</p>
                        <p><strong>Newsletter Subscription:</strong> ${contactData.newsletter ? 'Yes' : 'No'}</p>
                    </div>
                    
                    <div class="project-details">
                        <h3>🎯 Project Details</h3>
                        <p><strong>Service Interest:</strong> ${contactData.service || 'Not specified'}</p>
                        <p><strong>Budget Range:</strong> ${contactData.budget || 'Not specified'}</p>
                        <p><strong>Timeline:</strong> ${contactData.timeline || 'Not specified'}</p>
                        <p><strong>Message:</strong></p>
                        <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #ddd;">
                            ${contactData.message.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                    
                    <div class="actions">
                        <h3>📋 Next Steps</h3>
                        <p>1. Review client requirements and project scope</p>
                        <p>2. Prepare initial consultation questions</p>
                        <p>3. Schedule follow-up call or meeting</p>
                        <p>4. Send personalized proposal if appropriate</p>
                        
                        <a href="mailto:${contactData.email}?subject=Re: Your VSS Global Inquiry&body=Dear ${fullName},%0D%0A%0D%0AThank you for your interest in VSS Global..." class="btn">Reply to Client</a>
                    </div>
                    
                    <p style="text-align: center; color: #666; font-size: 14px;">
                        This notification was generated automatically from the VSS Global website contact form.
                    </p>
                </div>
            </div>
        </body>
        </html>`;

        // Send confirmation email to client
        await transporter.sendMail({
            from: `"VSS Global" <${process.env.EMAIL_USER}>`,
            to: contactData.email,
            subject: '🎉 Thank you for contacting VSS Global - We\'ll be in touch soon!',
            html: clientEmailHtml
        });

        // Send notification email to VSS Global team
        await transporter.sendMail({
            from: `"VSS Global Website" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `🚨 New Contact Form Submission from ${fullName}`,
            html: teamEmailHtml
        });

        console.log(`Contact form submitted successfully by ${fullName} (${contactData.email})`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Contact form submitted successfully',
                contactDetails: {
                    name: fullName,
                    email: contactData.email,
                    service: contactData.service || 'General Inquiry'
                }
            })
        };

    } catch (error) {
        console.error('Error processing contact form:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Failed to process contact form',
                message: error.message
            })
        };
    }
};
