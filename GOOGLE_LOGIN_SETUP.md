# Google Login Setup Guide

## Overview

This implementation adds Google OAuth2 login functionality to the FU News Management System. Users can now log in using their Google accounts, which will be authenticated through the backend API endpoint `/api/auth/google-login`.

## Backend API Integration

### Endpoint
- **URL**: `POST /api/auth/google-login`
- **Request Body**:
  ```json
  {
    "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
  }
  ```
- **Response**: Same format as regular login, returns JWT tokens and user information

### API Service Implementation

The Google login is implemented in `src/lib/api-services.ts`:

```typescript
async googleLogin(googleLoginData: { idToken: string }): Promise<LoginResponse> {
  const response = await apiClient.post<ApiSingleResponse<any>>(
    API_ENDPOINTS.AUTH.GOOGLE_LOGIN,
    googleLoginData
  );
  // ... token storage and response handling
}
```

## Frontend Implementation

### Components Added

1. **GoogleLoginButton** (`src/components/auth/GoogleLoginButton.tsx`)
   - Loads Google Identity Services library
   - Handles Google OAuth flow
   - Provides fallback UI if Google services fail

2. **Google Callback Page** (`src/app/auth/google/callback/page.tsx`)
   - Handles OAuth2 redirect responses
   - Processes ID tokens and authorization codes
   - Redirects users based on their roles

### Login Page Integration

The login page (`src/app/auth/login/page.tsx`) now includes:
- Google login button with proper styling
- Error handling for Google authentication failures
- Seamless integration with existing login flow

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" and create a new "OAuth 2.0 Client ID"
5. Configure the following:
   - **Application type**: Web application
   - **Authorized JavaScript origins**: `http://localhost:3000` (for development)
   - **Authorized redirect URIs**: 
     - `http://localhost:3000/auth/google/callback`
     - `http://localhost:3000/auth/login`

### 2. Environment Variables

Create a `.env.local` file in the project root:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### 3. Backend Requirements

Ensure your backend API supports the `/api/auth/google-login` endpoint:

1. **Validate Google ID Token**: Verify the token with Google's servers
2. **Extract User Information**: Get email, name, and other profile data
3. **User Registration/Login**: 
   - If user exists: return login response
   - If new user: register them (based on your business logic)
4. **Return JWT Tokens**: Same format as regular login

## Testing

### Test Flow

1. Click "Continue with Google" on the login page
2. User is redirected to Google OAuth consent screen
3. After consent, Google redirects back to your callback URL
4. Frontend extracts the ID token and sends it to the backend
5. Backend validates token and returns user session
6. User is redirected to appropriate dashboard

### Troubleshooting

**Common Issues:**

1. **"Invalid redirect URI"**: Ensure the redirect URIs are properly configured in Google Cloud Console
2. **"Client ID not found"**: Check the `NEXT_PUBLIC_GOOGLE_CLIENT_ID` environment variable
3. **Token validation fails**: Ensure backend properly validates Google ID tokens
4. **CORS issues**: Configure CORS on backend to allow requests from your domain

## Security Considerations

1. **Token Validation**: Always validate Google ID tokens on the backend
2. **HTTPS**: Use HTTPS in production for OAuth2 security
3. **Environment Variables**: Keep Google Client ID in environment variables
4. **Token Expiry**: Handle token refresh appropriately
5. **User Registration**: Implement proper logic for new Google users

## User Experience Features

1. **Seamless Integration**: Google login works alongside traditional email/password login
2. **Role-based Redirects**: Users are redirected to appropriate pages based on their roles
3. **Error Handling**: Clear error messages for various failure scenarios
4. **Loading States**: Visual feedback during authentication process
5. **Fallback UI**: Custom button if Google services fail to load

## API Response Format

The Google login endpoint should return the same format as regular login:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "user": {
      "accountId": 1,
      "accountName": "John Doe",
      "accountEmail": "john@example.com",
      "accountRole": "Admin"
    },
    "accessTokenExpires": "2024-01-01T12:00:00Z",
    "refreshTokenExpires": "2024-01-08T12:00:00Z"
  },
  "timestamp": "2024-01-01T10:00:00Z",
  "requestId": "uuid"
}
```

## Future Enhancements

1. **Google Account Linking**: Allow existing users to link Google accounts
2. **Profile Picture**: Import Google profile pictures
3. **Single Sign-On**: Implement SSO for organization domains
4. **Multi-factor Authentication**: Combine Google login with additional security
5. **Social Login Expansion**: Add Facebook, GitHub, or other providers 