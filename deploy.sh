#!/bin/bash

echo "======================================"
echo "Assignment Cards - Deploy Script"
echo "======================================"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI is not installed."
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
fi

echo "✅ Firebase CLI is ready"
echo ""

# Login to Firebase
echo "Logging in to Firebase..."
firebase login

echo ""
echo "What would you like to deploy?"
echo "1) Firestore Rules only"
echo "2) Build and Deploy to Hosting"
echo "3) Deploy Everything"
echo "4) Cancel"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "Deploying Firestore rules..."
        firebase deploy --only firestore:rules
        echo "✅ Firestore rules deployed!"
        ;;
    2)
        echo ""
        echo "Building application..."
        npm run build
        echo ""
        echo "Deploying to Firebase Hosting..."
        firebase deploy --only hosting
        echo "✅ Application deployed!"
        echo ""
        echo "Your app is live at: https://assisnment-app.web.app"
        ;;
    3)
        echo ""
        echo "Building application..."
        npm run build
        echo ""
        echo "Deploying everything..."
        firebase deploy
        echo "✅ Everything deployed!"
        echo ""
        echo "Your app is live at: https://assisnment-app.web.app"
        ;;
    4)
        echo "Cancelled."
        exit 0
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "======================================"
echo "Deployment Complete!"
echo "======================================"
