# DarkHours Delights Backend

Backend server for the DarkHours Delights food delivery application.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_uri
PORT=5005
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Production

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Railway Deployment

1. Install the Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Link your project:
```bash
railway link
```

4. Deploy to Railway:
```bash
railway up
```

## Environment Variables in Railway

Add the following environment variables in your Railway project settings:

- `MONGODB_URI`: Your MongoDB connection string
- `PORT`: 5005
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_PRIVATE_KEY`: Your Firebase private key
- `FIREBASE_CLIENT_EMAIL`: Your Firebase client email 