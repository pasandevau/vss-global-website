const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    // Handle CORS preflight
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

    try {
        const { email } = JSON.parse(event.body);
        
        // Validate email
        if (!email) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Email address is required'
                })
            };
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Please enter a valid email address'
                })
            };
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
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                message: 'Thank you for subscribing! Check your email for a welcome message.',
                subscriber: {
                    email: email,
                    subscribedAt: new Date().toISOString()
                }
            })
        };
        
    } catch (error) {
        console.error('Error processing newsletter subscription:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                message: 'Failed to subscribe. Please try again or contact us directly.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            })
        };
    }
};
