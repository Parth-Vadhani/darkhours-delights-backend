// firebaseAdmin.js
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize only if not already initialized
if (!admin.apps.length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT ? 
        JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : 
        require('./firebase-service-account.json');

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export default admin;