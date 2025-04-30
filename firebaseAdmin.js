// firebaseAdmin.js
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize only if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./firebase-service-account.json"),
    });
}

export default admin;