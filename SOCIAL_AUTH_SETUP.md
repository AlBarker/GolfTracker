# Apple Sign-In Setup Guide

This guide will help you configure Apple sign-in for your ParPal app.

## 🔧 Supabase Configuration

### 1. Enable Apple Sign-In Provider

Go to your Supabase dashboard:
1. Navigate to **Authentication** → **Providers**
2. Enable **Apple** provider

### 2. Apple Sign-In Setup

#### A. Apple Developer Account Setup
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Go to **Keys** → Create a new key
4. Enable **Sign in with Apple**
5. Download the key file (.p8)

#### B. Configure in Supabase
1. In Supabase Dashboard → **Authentication** → **Providers** → **Apple**
2. Enter your:
   - **Team ID** (from Apple Developer Account)
   - **Key ID** (from the key you created)
   - **Private Key** (contents of the .p8 file)
3. Save the configuration

## 📱 React Native Configuration

### 1. iOS Configuration

#### A. Apple Sign-In Capability
1. In Xcode, select your project
2. Go to **Signing & Capabilities**
3. Click **+ Capability**
4. Add **Sign in with Apple**

## 🔐 Security Best Practices

### 1. Bundle ID Consistency
Ensure your bundle ID matches across:
- Apple Developer Portal
- Your app configuration

## 🧪 Testing

### 1. Test Apple Sign-In
1. Run on iOS device (Apple Sign-In doesn't work on simulator)
2. Tap "Continue with Apple"
3. Verify Apple sign-in flow works
4. Check that user is created in Supabase

## 🚨 Troubleshooting

### Common Issues

**Apple Sign-In Fails:**
- Verify Apple Developer Account setup
- Check that capability is added in Xcode
- Ensure private key is correctly formatted

**Supabase Connection Issues:**
- Check that Apple provider is enabled in Supabase
- Ensure Apple credentials are correct

### Debug Steps
1. Check console logs for specific error messages
2. Test with different iOS devices
3. Check Supabase logs for authentication attempts

## 📋 Checklist

### Apple Sign-In Setup
- [ ] Created Apple Developer key
- [ ] Configured Supabase with Apple credentials
- [ ] Added Apple capability in Xcode
- [ ] Tested on iOS device

### General
- [ ] Updated database schema with user relationships
- [ ] Verified RLS policies work with social auth
- [ ] Tested app flow with Apple authentication
- [ ] Verified user data isolation works correctly

---

After completing this setup, users will be able to sign in with Apple in addition to email/password authentication!