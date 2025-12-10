# Admin Quick Reference Guide

## Admin Panel Access
URL: `http://localhost:3000/admin` (or your deployed URL + `/admin`)

## Main Features

### 1. Card Management 📇
**Create a New Card**
1. Click "Create New Card"
2. Fill in:
   - Card Title (e.g., "Spring 2024 Card")
   - To (Recipient name)
   - Amount (Number of assignments)
3. Click "Create Card & Generate PDF"
4. PDF will automatically download with QR code

**Manage Existing Cards**
- View all cards with status (active/revoked)
- Download PDF for any card
- Revoke cards that should no longer be used

### 2. Submission Management 📝
**Review Submissions**
- Filter by: All / Pending / Approved / Denied
- View submission details (class, assignment type, amount, contact info)

**Approve a Submission**
1. Click "Approve" on pending submission
2. Card balance automatically deducts
3. Student can see approved status

**Deny a Submission**
1. Click "Deny" on pending submission
2. Card balance stays the same
3. Student sees denied status

**Export Data**
- Click "Export to CSV" to download all submissions

### 3. Coupon Management 🎟️
**Create a Coupon**
1. Click "Create New Coupon"
2. Enter:
   - Code (e.g., "SAVE10")
   - Discount (number of assignments)
   - Uses Left (how many times it can be used)
3. Click "Create Coupon"

**Manage Coupons**
- View all active coupons
- See remaining uses
- Delete coupons when no longer needed

### 4. Card Request Management 📋
**Review Card Requests**
- See requests from students who want cards
- Filter by status

**Approve a Request**
1. Click "Approve"
2. Enter the number of assignments for the card
3. System automatically creates a card for the student

**Deny a Request**
1. Click "Deny"
2. Request is marked as denied

## Workflow Examples

### Scenario 1: New Student Needs a Card
1. Student fills out form at `/request-card`
2. You see request in "Card Requests" tab
3. Click "Approve", enter amount (e.g., 5)
4. Card is created automatically
5. Download PDF and give to student

### Scenario 2: Student Uses Card
1. Student scans QR code from card
2. Student fills out assignment request form
3. You see submission in "Submissions" tab
4. Review details and click "Approve"
5. Card balance automatically decreases

### Scenario 3: Creating a Promo Code
1. Go to "Coupons" tab
2. Create code "FIRSTTIME" with 1 assignment discount
3. Set uses to 50
4. Share code with students
5. They can use it when submitting requests

## Tips & Best Practices

### Card Management
- Use descriptive titles (e.g., "Fall 2024 - Math Students")
- Set appropriate amounts based on student needs
- Download and save PDFs in organized folders
- Revoke cards if they're lost or compromised

### Submissions
- Review submissions regularly to avoid delays
- Check that amounts requested are reasonable
- Verify contact information is provided
- Use filters to focus on pending items

### Coupons
- Use uppercase codes for consistency
- Set reasonable discount amounts
- Monitor usage to prevent abuse
- Delete unused/expired coupons

### Card Requests
- Respond to requests promptly
- Consider the reason provided
- Set appropriate amounts based on need
- Keep track of who receives cards

## Security Notes

⚠️ **Important**
- Keep your admin security key private
- Don't share your login credentials
- Log out when done (especially on shared computers)
- Use a strong security key

## Status Indicators

**Card Status**
- 🟢 Active - Card can be used
- 🔴 Revoked - Card is disabled

**Submission Status**
- 🟡 Pending - Awaiting review
- 🟢 Approved - Request accepted
- 🔴 Denied - Request rejected

**Request Status**
- 🟡 Pending - Awaiting review
- 🟢 Approved - Card created
- 🔴 Denied - Request rejected

## Keyboard Shortcuts

- Tab switching: Click tab names
- Search: Use browser's find (Cmd/Ctrl + F)
- Refresh: Reload page to see updates

## Troubleshooting

**Can't log in**
- Verify security key is correct
- Check that config document exists in Firestore
- Make sure you're using the exact key value

**PDF not generating**
- Check browser allows downloads
- Try different browser if issues persist
- Verify QR code data is valid

**Submissions not appearing**
- Refresh the page
- Check Firestore database directly
- Verify security rules are deployed

**Balance not updating**
- Check that submission was approved (not just viewed)
- Refresh card list to see updated balance
- Verify in Firestore if needed

## Data Management

### Regular Tasks
- Review pending submissions daily
- Clean up old revoked cards monthly
- Archive or export old submissions quarterly
- Update coupon codes as needed

### Monitoring
- Check card balances regularly
- Monitor coupon usage
- Track approval/denial rates
- Review student feedback

## Support Resources

- Firebase Console: https://console.firebase.google.com/
- Project README: See README.md file
- Setup Guide: See SETUP.md file

---

**Need Help?** Check the main README.md or contact the system administrator.
