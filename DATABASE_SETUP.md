# PostgreSQL Database Setup Guide

This guide will help you set up PostgreSQL for the Rent & Home project.

## Prerequisites

1. **PostgreSQL** installed on your system
2. **Node.js** and **npm** installed
3. **Git** for version control

## Installation Steps

### 1. Install PostgreSQL

#### macOS (using Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

#### Windows:
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL as postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE rent_and_home;
CREATE USER rent_home_user WITH ENCRYPTED PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE rent_and_home TO rent_home_user;
\q
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://rent_home_user:your_password_here@localhost:5432/rent_and_home?schema=public"

# External API
ZILO_API_KEY="your_zilo_api_key_here"

# Next.js
NEXTAUTH_SECRET="br3OI/mF7Vx97zETLDWIJsvQ+a6fb4rEWHzPS7KKZW0="
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Or use migrations (recommended for production)
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

## Available Scripts

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and apply migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Database Schema

### Tables

1. **houses** - Property listings
2. **users** - User accounts
3. **user_favorites** - User favorite properties (many-to-many)

### Key Features

- Full-text search on addresses and property types
- Geospatial indexing for location-based queries
- Optimized indexes for common queries
- Support for property photos as arrays
- User favorites system

## API Endpoints

### Houses
- `GET /api/houses` - List houses with pagination and filters
- `POST /api/houses` - Create new house
- `GET /api/houses/[id]` - Get specific house
- `PUT /api/houses/[id]` - Update house
- `DELETE /api/houses/[id]` - Delete house

### Query Parameters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search in address, city, state, zipcode, homeType
- `homeStatus` - Filter by status (For Sale, For Rent, etc.)
- `minPrice` / `maxPrice` - Price range filter
- `bedrooms` / `bathrooms` - Exact number filter

## Development Workflow

1. **Schema Changes**: Edit `prisma/schema.prisma`
2. **Generate Client**: `npm run db:generate`
3. **Apply Changes**: `npm run db:push` (dev) or `npm run db:migrate` (prod)
4. **Update Code**: Use the new Prisma client in your API routes

## Production Deployment

1. Set up PostgreSQL on your production server
2. Configure environment variables
3. Run migrations: `npm run db:migrate`
4. Generate client: `npm run db:generate`
5. Build and deploy your application

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure PostgreSQL is running
2. **Authentication Failed**: Check username/password in DATABASE_URL
3. **Database Not Found**: Create the database first
4. **Permission Denied**: Grant proper privileges to the user

### Useful Commands

```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Connect to database
psql -h localhost -U rent_home_user -d rent_and_home

# Reset database (careful!)
npm run db:push --force-reset

# View database in GUI
npm run db:studio
```

## Data Migration

To migrate data from the external API to PostgreSQL:

1. Create a migration script in `scripts/migrate-api-data.ts`
2. Fetch data from external API
3. Transform data to match Prisma schema
4. Insert into PostgreSQL using Prisma client

## Backup and Restore

```bash
# Backup
pg_dump -h localhost -U rent_home_user rent_and_home > backup.sql

# Restore
psql -h localhost -U rent_home_user rent_and_home < backup.sql
```

## Performance Tips

1. Use indexes for frequently queried fields
2. Implement pagination for large datasets
3. Use connection pooling in production
4. Monitor query performance with Prisma Studio
5. Consider caching for read-heavy operations 