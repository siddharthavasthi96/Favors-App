# Assignment Cards - QR Voucher System

A web application for managing assignment help vouchers using QR codes and Firebase Firestore.

## Features

### Public Web App
- **QR Scan Flow**: Scan QR code → verify card → submit assignment request
- **Request Form**: Class, assignment type, amount, promo code support, contact info
- **Request Card Page**: Students can request new cards
- **Status Tracking**: Check submission/card request status without login

### Admin Panel
- **Card Management**: Create cards with QR codes, generate PDFs, revoke cards
- **Submission Management**: Review, approve/deny submissions, filter by status
- **Coupon Management**: Create/delete promo codes with discounts
- **Card Request Management**: Review and approve/deny card requests
- **CSV Export**: Export submissions data

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Firebase Firestore (no Cloud Functions)
- **Routing**: React Router
- **QR Codes**: qrcode library
- **PDF Generation**: jsPDF

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Configuration
The Firebase configuration is already set up in `.env.local` with your credentials.

### 3. Initialize Firebase Project
```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in this directory
firebase init

# Select:
# - Firestore (configure security rules)
# - Hosting (for deployment)
# - Use existing project: assisnment-app
```

### 4. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 5. Set Up Admin Security Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `assisnment-app`
3. Go to Firestore Database
4. Create a new collection called `config`
5. Add a document with these fields:
   - `key`: `"adminSecurityKey"`
   - `value`: `"your_secret_password"` (choose a strong password)

### 6. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 7. Build for Production
```bash
npm run build
```

### 8. Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

## Usage

### For Students
1. **Scan QR Code**: Use a QR code scanner to scan the card
2. **Submit Request**: Fill out the assignment request form
3. **Check Status**: Use the provided link to check your submission status
4. **Request Card**: Visit `/request-card` to request a new card

### For Admins
1. **Login**: Go to `/admin` and enter the security key
2. **Manage Cards**: Create new cards, download PDFs, revoke cards
3. **Review Submissions**: Approve or deny assignment requests
4. **Manage Coupons**: Create promo codes for discounts
5. **Review Card Requests**: Approve or deny student card requests

## Project Structure
```
src/
├── components/
│   └── admin/
│       ├── CardManagement.jsx
│       ├── SubmissionManagement.jsx
│       ├── CouponManagement.jsx
│       └── CardRequestManagement.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── QRScanPage.jsx
│   ├── RequestCardPage.jsx
│   ├── StatusPage.jsx
│   └── admin/
│       ├── AdminLogin.jsx
│       └── AdminDashboard.jsx
├── firebase.js
├── App.jsx
├── main.jsx
└── index.css
```

## Data Models

### Cards
```javascript
{
  id: string,
  title: string,
  to: string (name),
  amount: number (assignments),
  qrToken: string,
  status: 'active' | 'revoked',
  createdAt: ISO string,
  expiresAt?: ISO string
}
```

### Submissions
```javascript
{
  id: string,
  cardId: string,
  cardTitle: string,
  cardTo: string,
  class: string,
  assignmentType: string,
  amountRequested: number,
  promoCode?: string,
  promoDiscount: number,
  phone?: string,
  email?: string,
  status: 'pending' | 'approved' | 'denied',
  createdAt: ISO string
}
```

### Coupons
```javascript
{
  code: string,
  discount: number,
  usesLeft: number,
  createdAt: ISO string
}
```

### Card Requests
```javascript
{
  id: string,
  name: string,
  class: string,
  phone?: string,
  email?: string,
  reason?: string,
  status: 'pending' | 'approved' | 'denied',
  createdAt: ISO string
}
```

## Security

The Firestore security rules are configured to:
- Allow public read access to cards (for verification)
- Allow public creation of submissions and card requests
- Prevent direct updates/deletes (admin operations should be controlled)
- Allow coupon usage tracking

**Important**: The current admin authentication uses a simple security key stored in sessionStorage. For production, consider implementing Firebase Authentication for better security.

## Future Enhancements (Phase 2)
- Rate limiting/CAPTCHA on public forms
- Card expiration & max redemptions
- Submission analytics dashboard
- Multi-language support
- Bulk card generation
- Firebase Authentication for admin panel
- Push notifications (FCM)

## License
Private project - All rights reserved
# Favors-App
