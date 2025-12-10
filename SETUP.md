# Setup Script for Assignment Cards

## Quick Start

The application is now running at: **http://localhost:3000**

## ⚠️ Important: First-Time Setup

Before you can use the admin panel, you need to set up the admin security key in Firestore:

### Option 1: Using Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **assisnment-app**
3. Navigate to **Firestore Database**
4. Click **Start collection**
5. Collection ID: `config`
6. Document ID: (auto-generate or use `adminKey`)
7. Add fields:
   - Field: `key`, Type: `string`, Value: `adminSecurityKey`
   - Field: `value`, Type: `string`, Value: `YourSecretPassword123` (choose your own strong password)
8. Click **Save**

### Option 2: Using Firebase CLI
```bash
# Install Firebase CLI if needed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

## Testing the Application

### Test Public Features
1. Visit http://localhost:3000
2. Click "Request a Card" to test the card request form
3. After submitting, you'll get a status link

### Test Admin Panel
1. Visit http://localhost:3000/admin
2. Enter your security key (the one you set in Firestore)
3. Test creating cards, coupons, and managing submissions

### Test QR Flow
1. In admin panel, create a card
2. Download the PDF
3. Use the QR token from the card to visit: `http://localhost:3000/?qr=YOUR_TOKEN`
4. Fill out and submit the form

## Firebase Setup Checklist

- [x] Project created: `assisnment-app`
- [x] Web app configured with credentials
- [x] Firestore enabled
- [ ] **Admin security key created in Firestore** ⚠️
- [ ] Firestore rules deployed
- [ ] (Optional) Firebase Hosting configured

## Firestore Collections Structure

Your Firestore database will have these collections:
- `cards` - Assignment cards with QR tokens
- `submissions` - Student assignment requests
- `cardRequests` - Student card requests
- `coupons` - Promo codes
- `config` - App configuration (admin key)
- `events` - Audit log

## Common Issues

### "No admin security key configured"
→ You need to create the config document in Firestore (see setup above)

### "Invalid security key"
→ Make sure you're entering the exact password you set in Firestore

### Firestore permissions error
→ Deploy the security rules: `firebase deploy --only firestore:rules`

## Next Steps

1. ✅ Set up admin security key in Firestore
2. Create your first card in the admin panel
3. Test the QR code flow
4. Create some promo codes
5. Test submission approval workflow

## Deployment to Production

When ready to deploy:

```bash
# Build the app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Or deploy everything
firebase deploy
```

Your app will be available at: `https://assisnment-app.web.app`

## Support

For issues or questions, refer to:
- Firebase Console: https://console.firebase.google.com/
- Firebase Documentation: https://firebase.google.com/docs
- Project README.md

---

**Created by GitHub Copilot** | Assignment Cards v1.0
