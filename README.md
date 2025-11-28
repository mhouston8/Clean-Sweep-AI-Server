# AI Cleaner Storage Optimizer - Node Server

Express server with TypeScript for handling push notifications and database operations.

## Features

- **TypeScript** - Full type safety
- **Express.js** - RESTful API server
- **Firebase Admin** - Push notifications
- **Supabase** - Database operations
- **Node-cron** - Scheduled tasks

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp env.example .env
```

Edit `.env` with your development credentials.

### 3. Firebase Setup

Place your Firebase service account JSON file in the root directory:
- Development: `*-firebase-adminsdk-*.json` (dev project)
- Production: `*-firebase-adminsdk-*.json` (prod project)

The file is automatically ignored by git for security.

## Development

### Run in Development Mode

```bash
npm run dev
```

This runs TypeScript directly with `ts-node` and uses `.env` file.

### Run with Auto-reload

```bash
npm run dev:watch
```

Uses nodemon to automatically restart on file changes.

## Production

### Build for Production

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

### Run in Production

```bash
npm start
```

This runs the compiled JavaScript from `dist/` with `NODE_ENV=production`.

### Environment Variables for Production

For production, create a `.env.production` file or set environment variables on your server:

```bash
NODE_ENV=production
PORT=3000
SUPABASE_URL=your_prod_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_prod_key
```

**Important:** Never commit `.env` or `.env.production` files to git.

## Environment-Specific Configuration

### Development
- Uses `.env` file
- Development Supabase project
- Development Firebase project
- Debug logging enabled

### Production
- Uses `.env.production` or environment variables
- Production Supabase project
- Production Firebase project
- Optimized for performance

## API Endpoints

### Push Notifications
- `POST /send-notification` - Send to single device
- `POST /send-notification/all` - Send to all users

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions
- `GET /api/subscriptions/:id` - Get subscription by ID
- `GET /api/subscriptions/user/:userId` - Get user subscriptions
- `POST /api/subscriptions` - Create subscription

### User Devices
- `GET /api/user-devices` - Get all devices
- `GET /api/user-devices/:id` - Get device by ID
- `GET /api/user-devices/user/:userId` - Get user devices
- `POST /api/user-devices` - Create device
- `PUT /api/user-devices/:id` - Update device

## Project Structure

```
node_server/
├── config/
│   ├── firebase.ts      # Firebase Admin configuration
│   ├── supabase.ts      # Supabase client configuration
│   └── env.ts         # Environment configuration helper
├── dist/                # Compiled JavaScript (generated)
├── server.ts           # Main server file
├── tsconfig.json       # TypeScript configuration
├── package.json        # Dependencies and scripts
└── .env                # Environment variables (not in git)
```

## Best Practices

1. **Separate Projects**: Use different Supabase and Firebase projects for dev and prod
2. **Environment Variables**: Never commit secrets to git
3. **Type Safety**: All code is typed with TypeScript
4. **Error Handling**: All endpoints have proper error handling

## Deployment to Render

### Prerequisites

1. Push your code to GitHub
2. Have a Render account (free tier available)

### Deployment Steps

1. **Connect Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: `ai-cleaner-node-server` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: `20.x` (or latest LTS)

3. **Set Environment Variables**
   
   In the Render dashboard, go to Environment → Add Environment Variable:
   
   ```
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=your_production_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
   ```
   
   **For Firebase Service Account:**
   
   Since you can't upload files directly, you have two options:
   
   **Option 1: Store as Environment Variable (Recommended)**
   - Copy the entire contents of your Firebase service account JSON file
   - In Render, add environment variable:
     - Key: `FIREBASE_SERVICE_ACCOUNT`
     - Value: Paste the entire JSON as a single-line string
   - Update `config/firebase.ts` to read from this env var (see below)
   
   **Option 2: Use Render Disk (Alternative)**
   - Upload the JSON file to Render's persistent disk
   - Update the path in your code

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your app
   - Your service will be available at `https://your-service-name.onrender.com`

### Updating Firebase Config for Render

If using Option 1 (environment variable), update `config/firebase.ts`:

```typescript
import * as admin from 'firebase-admin';

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Read from environment variable (Render)
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Read from file (local development)
  serviceAccount = require('../mobile-ai-storage-cleaner-firebase-adminsdk-fbsvc-3dc69c8622.json');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
  });
}

export const firebaseAdmin = admin;
export const messaging = admin.messaging();
```

### Render Configuration File

The `render.yaml` file is included for infrastructure-as-code deployment. You can use it to:
- Deploy via Render CLI
- Version control your deployment configuration
- Set up multiple environments

## License

ISC

