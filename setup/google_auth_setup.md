# Google Cloud Console OAuth Setup Guide

## Prerequisites
- Google account
- Frontend application URL (e.g., `http://localhost:3000`)
- Backend application URL (e.g., `http://localhost:8000`)

## Step-by-Step Setup

### 1. Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **Sign in** with your Google account

### 2. Create or Select a Project
1. Click on the **project dropdown** at the top of the page
2. Either:
   - **Create a new project**: Click "New Project" and enter project details
   - **Select existing project**: Choose from your existing projects

### 3. Navigate to APIs & Services
```
Left sidebar → APIs & Services → Credentials
```

### 4. Configure OAuth Consent Screen (First Time Setup)
```
OAuth consent screen tab → External (or Internal) → Fill details:
├── App name: Your application name
├── User support email: Your email address
├── Developer contact information: Your email address
└── Save and Continue → Add Scopes (optional) → Add Test users → Save and Continue
```

### 5. Create OAuth 2.0 Client ID
```
Credentials tab → + CREATE CREDENTIALS → OAuth client ID → Web application
```

### 6. Configure Client ID Settings
```
Name: [Your OAuth client name]

Authorized JavaScript origins:
├── http://localhost:3000
├── https://yourfrontend.com
└── [+ ADD URI for each origin]

Authorized redirect URIs:
├── http://localhost:8000/auth/google/callback
├── https://api.yourbackend.com/auth/google/callback
└── [+ ADD URI for each redirect]
```

### 7. Save and Get Credentials
```
CREATE → Copy and save:
├── Client ID (for frontend)
└── Client Secret (for backend)
```

### 8. Enable Required APIs
```
APIs & Services → Library → Search:
├── Google+ API (Enable)
└── People API (Enable)
```

## Configuration Details

### Authorized JavaScript Origins
```
Purpose: Frontend application URLs
Format:  http://domain:port OR https://domain

Examples:
├── http://localhost:3000
├── http://127.0.0.1:3000
└── https://myapp.com
```

### Authorized Redirect URIs
```
Purpose: Backend OAuth callback endpoints
Format:  Complete URL path to callback handler

Examples:
├── http://localhost:8000/auth/google/callback
├── https://api.myapp.com/auth/google/callback
└── https://mybackend.com/oauth/google/redirect
```

## Environment Variables

```bash
# Frontend (.env)
GOOGLE_CLIENT_ID=your_client_id_here

# Backend (.env)
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

## Testing Flow
```
1. Frontend running on configured URL
2. Backend running on configured URL  
3. Test OAuth flow end-to-end
4. Check browser console + server logs
```

## Common Issues

### CORS Errors
```
Issue: Frontend can't make requests
Fix:   Add frontend URL to "Authorized JavaScript origins"
```

### Redirect URI Mismatch  
```
Issue: Google can't redirect back
Fix:   Add exact backend callback URL to "Authorized redirect URIs"
```

### Environment Mismatch
```
Development:
├── http://localhost:3000 (frontend)
└── http://localhost:8000/auth/google/callback (backend)

Production:
├── https://myapp.com (frontend)  
└── https://api.myapp.com/auth/google/callback (backend)
```

## Security Checklist
```
✅ Keep Client Secret secure (backend only)
✅ Use HTTPS in production
✅ Rotate client secrets regularly
✅ Monitor OAuth usage in console
✅ Separate clients for dev/prod environments
```