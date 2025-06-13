# Advanced URL Shortener with Analytics Dashboard

A comprehensive URL shortening service with advanced analytics, tagging system, and visit tracking built with React and Express.js.

## Features

- **URL Shortening**: Create short URLs with optional custom codes
- **Analytics Dashboard**: Comprehensive analytics with charts and statistics
- **Tagging System**: Organize links with custom tags
- **Visit Tracking**: Track clicks with device detection and referrer analysis
- **Expiry System**: Set expiration dates for short URLs
- **Real-time Dashboard**: Live statistics and recent activity
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Frontend**: React, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui components
- **Charts**: Recharts
- **State Management**: TanStack Query

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **PostgreSQL** (v12 or higher)

## Local Setup Instructions

### 1. Clone or Download the Project

If you have the project files, extract them to your desired directory. If not, create a new directory and copy all the project files.

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database:
```sql
CREATE DATABASE url_shortener;
```

3. Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/url_shortener
NODE_ENV=development
```

Replace `username` and `password` with your PostgreSQL credentials.

#### Option B: Use a Cloud Database (Recommended)

You can use services like:
- **Neon** (Free tier available): https://neon.tech
- **Supabase** (Free tier available): https://supabase.com
- **Railway** (Free tier available): https://railway.app

Create a database and get the connection string, then add it to your `.env` file:

```env
DATABASE_URL=your_database_connection_string_here
NODE_ENV=development
```

### 4. Initialize Database Schema

Run the following command to create the database tables:

```bash
npm run db:push
```

### 5. Start the Application

```bash
npm run dev
```

The application will start on http://localhost:5000

## API Documentation

### Create Short URL
```http
POST /api/shorten
Content-Type: application/json

{
  "originalUrl": "https://example.com",
  "customCode": "my-link",
  "tags": "marketing, social",
  "expiresAt": "2024-12-31T23:59:59.000Z"
}
```

### Redirect Short URL
```http
GET /s/:code
```

### Get Analytics
```http
GET /api/analytics/:code
```

### Get All URLs
```http
GET /api/urls
```

### Get URLs by Tag
```http
GET /api/tags/:tag
```

### Get Overall Statistics
```http
GET /api/stats
```

### Get Recent Activity
```http
GET /api/activity
```

### Delete URL
```http
DELETE /api/urls/:id
```

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Backend Express application
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data access layer
│   └── index.ts          # Server entry point
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema and types
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Available Scripts

- `npm run dev` - Start development server (both frontend and backend)
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Environment Variables

Create a `.env` file in the root directory with:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Environment
NODE_ENV=development
```

## Usage Examples

### Creating a Short URL

1. Open http://localhost:5000 in your browser
2. Enter a valid URL (e.g., https://google.com)
3. Optionally add:
   - Custom short code
   - Tags (comma-separated)
   - Expiry date
4. Click "Shorten URL"
5. Copy and use the generated short URL

### Viewing Analytics

1. Click the analytics icon (📊) next to any link in the dashboard
2. View detailed analytics including:
   - Total visits and unique visitors
   - Device breakdown (desktop, mobile, tablet)
   - Top referrers
   - Time series data
   - Associated tags

### Testing Short URLs

Use the generated short URLs (e.g., http://localhost:5000/s/abc123) to test redirects and view analytics.

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Check your DATABASE_URL is correct
3. Make sure the database exists
4. Run `npm run db:push` to create tables

### Port Already in Use

If port 5000 is already in use, you can change it by modifying the port in `server/index.ts` or killing the process using that port.

### Module Not Found Errors

Make sure all dependencies are installed:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in your environment
2. Use a production PostgreSQL database
3. Build the application: `npm run build`
4. Use a process manager like PM2
5. Set up a reverse proxy (nginx) for the domain
6. Enable HTTPS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.