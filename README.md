# VSS Global Website with Google Calendar Integration

A modern, responsive website for VSS Global with integrated appointment booking system that automatically creates Google Calendar events and sends professional email notifications.

## 🌟 Features

### Website Features
- **Modern Responsive Design** - Mobile-first approach with beautiful UI
- **Service Pages** - Dedicated pages for all VSS Global services
- **Portfolio Showcase** - Interactive project gallery with filtering
- **Professional Blog** - SEO-optimized blog system
- **Contact System** - Multiple contact methods and forms

### Booking System Features
- **Interactive Calendar** - Date and time slot selection
- **Google Calendar Integration** - Automatic event creation
- **Email Notifications** - Professional templates for clients and team
- **Video Call Support** - Automatic Google Meet link generation
- **Timezone Handling** - Australia/Adelaide (ACST) timezone
- **Form Validation** - Comprehensive client-side and server-side validation
- **Modal Feedback** - Professional success/error messages

### Technical Features
- **Serverless Backend** - Netlify Functions for scalable deployment
- **OAuth 2.0 Security** - Secure Google API authentication
- **Environment Variables** - Secure credential management
- **Error Handling** - Comprehensive error management and logging
- **Mobile Responsive** - Optimized for all device sizes

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Google Cloud Console account
- Gmail account for email notifications
- Netlify account (for deployment)

### Local Development Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd project_VSS_web
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials (see setup guides)
   ```

3. **Google Calendar Setup**
   ```bash
   # Follow GOOGLE_CALENDAR_SETUP.md for detailed instructions
   node setup-google-auth.js
   ```

4. **Start Development Server**
   ```bash
   # Frontend (website)
   npm run dev
   
   # Backend (API server)
   npm run server:dev
   ```

5. **Test the Integration**
   - Visit `http://localhost:5173` (frontend)
   - API available at `http://localhost:3000` (backend)
   - Test booking system on contact page

## 📁 Project Structure

```
project_VSS_web/
├── 📄 Frontend Files
│   ├── index.html              # Homepage
│   ├── contact.html            # Contact page with booking system
│   ├── portfolio.html          # Portfolio showcase
│   ├── process.html            # Development process
│   ├── blog.html              # Blog main page
│   ├── blog-*.html            # Individual blog posts
│   ├── *-development.html     # Service pages
│   ├── script.js              # Main JavaScript (includes BookingCalendar)
│   └── styles.css             # Main stylesheet
│
├── 🔧 Backend Files
│   ├── server.js              # Express.js server for local development
│   ├── netlify/
│   │   └── functions/
│   │       └── book-appointment.js  # Serverless function for Netlify
│   └── setup-google-auth.js   # OAuth setup helper
│
├── ⚙️ Configuration
│   ├── package.json           # Dependencies and scripts
│   ├── netlify.toml          # Netlify deployment configuration
│   ├── .env.example          # Environment variables template
│   └── .gitignore            # Git ignore rules
│
└── 📚 Documentation
    ├── README.md              # This file
    ├── GOOGLE_CALENDAR_SETUP.md  # Google integration setup
    └── NETLIFY_DEPLOYMENT.md     # Deployment guide
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback

# Google Services
GOOGLE_CALENDAR_ID=admin@vssglobal.biz
GOOGLE_REFRESH_TOKEN=your_refresh_token

# Email Configuration
EMAIL_USER=admin@vssglobal.biz
EMAIL_APP_PASSWORD=your_gmail_app_password

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Google Cloud Console Setup

1. **Create Project** - "VSS Global Calendar Integration"
2. **Enable APIs** - Google Calendar API, Gmail API
3. **OAuth Credentials** - Web application with correct redirect URIs
4. **OAuth Consent** - Configure app information and scopes

See `GOOGLE_CALENDAR_SETUP.md` for detailed instructions.

## 🎯 API Endpoints

### Health Check
```http
GET /api/health
```
Returns server status and environment information.

### Book Appointment
```http
POST /api/book-appointment
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+61 400 000 000",
  "meetingType": "video-call",
  "projectType": "Web Development",
  "description": "Need a new website",
  "date": "2024-01-15",
  "time": "10:00"
}
```

## 🎨 Frontend Components

### BookingCalendar Class
Located in `script.js`, handles:
- Calendar rendering and navigation
- Date/time selection
- Form submission and validation
- API communication
- Success/error modals
- Meeting type pre-selection

### Key Methods
- `renderCalendar()` - Displays calendar with available dates
- `selectDate(e)` - Handles date selection
- `selectTime(e)` - Handles time slot selection
- `handleFormSubmit(e)` - Processes form submission
- `showModal()` - Displays success/error messages

## 🚀 Deployment

### Netlify Deployment

1. **Connect Repository**
   - Link GitHub repository to Netlify
   - Configure build settings

2. **Environment Variables**
   - Add all production environment variables
   - Update redirect URIs for production domain

3. **Deploy**
   - Automatic deployment from Git pushes
   - Serverless functions automatically deployed

See `NETLIFY_DEPLOYMENT.md` for detailed instructions.

### Manual Deployment

1. **Build Assets**
   ```bash
   npm run build
   ```

2. **Deploy Files**
   - Upload all files to web server
   - Configure environment variables
   - Set up serverless functions or API server

## 🧪 Testing

### Local Testing
```bash
# Test frontend
npm run dev

# Test backend API
npm run server:dev
curl http://localhost:3000/api/health

# Test OAuth setup
node setup-google-auth.js
```

### Production Testing
- Test all website pages and functionality
- Verify booking system creates calendar events
- Check email notifications are sent
- Test on multiple devices and browsers
- Verify serverless functions work correctly

## 🔐 Security

### Best Practices
- ✅ Environment variables for all credentials
- ✅ OAuth 2.0 for Google API access
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Error handling without exposing sensitive data
- ✅ Secure email authentication (App Passwords)

### Security Checklist
- [ ] `.env` files in `.gitignore`
- [ ] No hardcoded credentials in code
- [ ] OAuth credentials rotated regularly
- [ ] Gmail app passwords used (not account password)
- [ ] HTTPS used in production
- [ ] Function logs monitored for suspicious activity

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start frontend development server
npm run build        # Build frontend for production
npm run server       # Start backend server
npm run server:dev   # Start backend with nodemon
npm run lint         # Run ESLint
```

### Adding New Features

1. **Frontend Changes**
   - Modify HTML, CSS, or JavaScript files
   - Test locally with `npm run dev`

2. **Backend Changes**
   - Update `server.js` for local development
   - Update `netlify/functions/book-appointment.js` for production
   - Test with `npm run server:dev`

3. **Deployment**
   - Commit changes to Git
   - Push to trigger automatic Netlify deployment

## 📊 Monitoring

### Netlify Dashboard
- Function invocations and performance
- Error logs and debugging
- Build logs and deployment status
- Analytics and usage metrics

### Google Cloud Console
- API usage and quotas
- OAuth token usage
- Error rates and performance

### Email Monitoring
- Delivery rates and bounces
- Gmail API usage
- Authentication status

## 🐛 Troubleshooting

### Common Issues

**Booking System Not Working**
- Check environment variables are set
- Verify Google API credentials
- Check function logs for errors
- Test OAuth flow manually

**Emails Not Sending**
- Verify Gmail app password
- Check EMAIL_USER matches Gmail account
- Ensure 2FA is enabled on Gmail
- Check Gmail API quotas

**Calendar Events Not Created**
- Verify GOOGLE_CALENDAR_ID is correct
- Check Calendar API is enabled
- Test refresh token validity
- Check API quotas and limits

**Deployment Issues**
- Verify all environment variables in Netlify
- Check function build logs
- Test functions locally with Netlify CLI
- Verify redirect URIs match production domain

### Debug Mode
Set `NODE_ENV=development` for detailed error logging.

### Getting Help
1. Check server/function logs for specific errors
2. Verify all environment variables are correctly set
3. Test each component individually
4. Consult the setup guides for configuration issues

## 📝 License

This project is proprietary software developed for VSS Global. All rights reserved.

## 🤝 Contributing

This is a private project for VSS Global. For internal development:

1. Create feature branch from main
2. Make changes and test thoroughly
3. Submit pull request with detailed description
4. Ensure all tests pass and documentation is updated

## 📞 Support

For technical support or questions:
- Check the troubleshooting sections in this README
- Review the setup guides (`GOOGLE_CALENDAR_SETUP.md`, `NETLIFY_DEPLOYMENT.md`)
- Contact the development team with detailed error information

---

**VSS Global** - Your Digital Success Partner  
Web Development | Software Solutions | Digital Marketing
