# Quick Setup Guide for Local Development

## Step-by-Step Installation

### 1. Prerequisites
- Node.js (version 18 or higher)
- PostgreSQL database

### 2. Download and Extract
- Download all project files to your local directory
- Open terminal/command prompt in the project directory

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup

**Option A: Local PostgreSQL**
```bash
# Create database
createdb url_shortener

# Create .env file
cp .env.example .env
```

Edit `.env` file with your database credentials:
```
DATABASE_URL=postgresql://yourusername:yourpassword@localhost:5432/url_shortener
NODE_ENV=development
```

**Option B: Cloud Database (Recommended)**
- Sign up for free at [Neon](https://neon.tech) or [Supabase](https://supabase.com)
- Create a new database
- Copy the connection string to your `.env` file

### 5. Initialize Database
```bash
npm run db:push
```

### 6. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:5000

## Testing the Application

1. **Create a short URL**: Enter any valid URL (e.g., https://google.com)
2. **Test redirection**: Click the generated short link
3. **View analytics**: Click the chart icon next to any link
4. **Add tags**: Use comma-separated tags like "marketing, social"
5. **Set expiry**: Use the date picker for expiration

## Common Issues

**Database connection error**: Verify your DATABASE_URL is correct and the database exists

**Port 5000 in use**: The app will automatically try the next available port

**Module errors**: Delete `node_modules` and run `npm install` again

## File Structure Summary
```
url-shortener/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types
├── package.json     # Dependencies
├── .env            # Your database config
└── README.md       # Full documentation
```