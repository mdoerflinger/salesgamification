# Authentication Setup Guide

## Overview

The Sales Lead Coach uses Microsoft Entra ID (formerly Azure AD) for authentication via MSAL (Microsoft Authentication Library). This allows users to sign in with their Microsoft accounts and access Dataverse resources securely.

## Prerequisites

1. **Azure Active Directory tenant** (Microsoft Entra ID)
2. **App Registration** in Azure Portal
3. **Dataverse environment** with proper permissions

## Step 1: Register Your App in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Microsoft Entra ID** > **App registrations** > **New registration**
3. Configure your app:
   - **Name**: `Sales Lead Coach` (or your preferred name)
   - **Supported account types**: Choose based on your needs
     - Single tenant (your org only) - recommended for internal apps
     - Multi-tenant - for apps used across organizations
   - **Redirect URI**: 
     - Platform: **Single-page application (SPA)**
     - URI: `http://localhost:3000` (for development)
     - Add production URI when deploying (e.g., `https://your-app.vercel.app`)

4. Click **Register**

## Step 2: Configure Authentication Settings

After registration:

1. Go to **Authentication** in the left sidebar
2. Under **Implicit grant and hybrid flows**, ensure these are **NOT** checked (we use Auth Code + PKCE)
3. Under **Advanced settings**:
   - Allow public client flows: **No**
4. Click **Save**

## Step 3: Configure API Permissions

1. Go to **API permissions** in the left sidebar
2. Click **Add a permission**
3. Select **Dynamics CRM** (or search for it under "APIs my organization uses")
4. Select **Delegated permissions**
5. Check **user_impersonation**
6. Click **Add permissions**
7. Click **Grant admin consent** (if you have admin rights)

## Step 4: Get Your Configuration Values

From your app registration:

1. **Application (client) ID**: Copy from the Overview page
2. **Directory (tenant) ID**: Copy from the Overview page
3. **Dataverse Resource URL**: Your Dynamics 365 URL
   - Format: `https://{org}.crm{region}.dynamics.com`
   - Example: `https://contoso.crm.dynamics.com`
   - Find it in [Power Platform Admin Center](https://admin.powerplatform.microsoft.com/)

## Step 5: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# ── Microsoft Entra ID / MSAL ──
NEXT_PUBLIC_TENANT_ID=your-tenant-id-here
NEXT_PUBLIC_CLIENT_ID=your-client-id-here
NEXT_PUBLIC_AUTHORITY=https://login.microsoftonline.com/${NEXT_PUBLIC_TENANT_ID}

# ── Dataverse ──
NEXT_PUBLIC_DATAVERSE_RESOURCE=https://your-org.crm.dynamics.com
NEXT_PUBLIC_DATAVERSE_SCOPE=${NEXT_PUBLIC_DATAVERSE_RESOURCE}/.default

# ── Azure Speech (optional, for voice features) ──
NEXT_PUBLIC_SPEECH_KEY=
NEXT_PUBLIC_SPEECH_REGION=

# ── Dev flags ──
NEXT_PUBLIC_USE_MOCK_AUTH=false
NEXT_PUBLIC_USE_MOCK_VOICE=false
```

**Important**: Replace the placeholder values with your actual configuration from Steps 3 and 4.

## Step 6: Verify Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
3. Click **Sign in with Microsoft**
4. You should be redirected to Microsoft login
5. After successful authentication, you'll be redirected back to the dashboard

## Troubleshooting

### "Authentication not initialized" error

**Cause**: Missing or invalid environment variables.

**Solution**: 
- Check that all required env vars are set in `.env.local`
- Restart your dev server after changing env vars
- Check browser console for specific error messages

### "AADSTS50011: The redirect URI does not match"

**Cause**: The redirect URI in your code doesn't match what's registered in Azure.

**Solution**:
- Go to Azure Portal > Your App Registration > Authentication
- Ensure `http://localhost:3000` is listed under "Single-page application" redirect URIs
- For production, add your production URL

### "AADSTS65001: The user or administrator has not consented"

**Cause**: API permissions not granted.

**Solution**:
- Go to Azure Portal > Your App Registration > API permissions
- Click "Grant admin consent for [Your Organization]"
- If you're not an admin, ask your IT admin to grant consent

### Silent token acquisition fails

**Cause**: Token expired or user session ended.

**Solution**: The app automatically falls back to popup authentication. If this persists:
- Clear browser cache and cookies
- Sign out and sign back in
- Check that your Azure session is still valid

### "No authenticated account" error

**Cause**: User is not signed in or session expired.

**Solution**:
- Navigate to `/login` and sign in again
- Check that MSAL hasn't been blocked by browser privacy settings

## Development Mode (Mock Auth)

For local development without Azure credentials:

```env
NEXT_PUBLIC_USE_MOCK_AUTH=true
```

This enables a mock authentication provider that:
- Bypasses real Microsoft authentication
- Uses a fake user account
- Returns mock access tokens
- Ideal for UI development and testing

**Note**: Mock auth should **never** be used in production.

## Production Deployment

When deploying to production (e.g., Vercel):

1. Add your production URL as a redirect URI in Azure Portal
2. Set environment variables in your hosting platform:
   - Vercel: Project Settings > Environment Variables
   - Add all `NEXT_PUBLIC_*` variables
3. Ensure `NEXT_PUBLIC_USE_MOCK_AUTH=false`
4. Test authentication thoroughly before going live

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use different app registrations** for dev/staging/production
3. **Rotate client secrets regularly** (if using confidential client flow)
4. **Monitor authentication logs** in Azure Portal
5. **Enable conditional access policies** for additional security
6. **Use single-tenant** apps when possible for better control

## Additional Resources

- [MSAL.js Documentation](https://learn.microsoft.com/en-us/azure/active-directory/develop/msal-overview)
- [Register an app with Microsoft Entra ID](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/walkthrough-register-app-azure-active-directory)
- [Dataverse Web API Authentication](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/authenticate-web-api)
