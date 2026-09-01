# NIRIKSHAN Database Setup Guide

This guide will help you set up the PostgreSQL database with PostGIS and configure the backend to use it.

## Prerequisites

1. **PostgreSQL 15+** with PostGIS extension
2. **Python 3.11+**
3. **pip** (Python package manager)

## Step 1: Install PostgreSQL and PostGIS

### Windows

1. Download and install PostgreSQL from: https://www.postgresql.org/download/windows/
2. During installation, set a password for the `postgres` user (default: `postgres`)
3. After installation, open **Stack Builder** (installed with PostgreSQL)
4. Select your PostgreSQL installation
5. Navigate to **Spatial Extensions** → **PostGIS** and install it

### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install postgresql postgis postgresql-contrib
```

### macOS

```bash
brew install postgresql
brew install postgis
```

## Step 2: Create the Database

### Using pgAdmin (Windows GUI)

1. Open pgAdmin (installed with PostgreSQL)
2. Connect to your PostgreSQL server
3. Right-click on **Databases** → **Create** → **Database**
4. Name it `nirikshan`
5. Click **Save**

### Using Command Line

```bash
# On Windows (from PostgreSQL bin directory)
psql -U postgres -c "CREATE DATABASE nirikshan;"

# On Linux/macOS
sudo -u postgres psql -c "CREATE DATABASE nirikshan;"
```

## Step 3: Enable PostGIS Extension

```bash
# On Windows
psql -U postgres -d nirikshan -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# On Linux/macOS
sudo -u postgres psql -d nirikshan -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

## Step 4: Configure Backend Environment

1. Navigate to the backend directory:
```bash
cd C:\Users\acer\OneDrive\Desktop\NIRAKSHAN\backend
```

2. The `.env` file is already configured with:
```
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/nirikshan
```

3. If you used a different password or database name, update the `.env` file:
```
DATABASE_URL=postgresql+psycopg://your_username:your_password@localhost:5432/your_database
```

## Step 5: Install Python Dependencies

```bash
cd C:\Users\acer\OneDrive\Desktop\NIRAKSHAN\backend
pip install -r requirements.txt
```

## Step 6: Run Database Migrations

```bash
cd C:\Users\acer\OneDrive\Desktop\NIRAKSHAN\backend
alembic upgrade head
```

This will create all the database tables according to the schema defined in the database models.

## Step 7: Seed the Database

```bash
cd C:\Users\acer\OneDrive\Desktop\NIRAKSHAN\backend
python database/seed.py
```

This will populate the database with sample data for testing.

## Step 8: Test the Backend

```bash
cd C:\Users\acer\OneDrive\Desktop\NIRAKSHAN\backend
python main.py
```

The backend should start on `http://localhost:8000`

## Step 9: Verify Database Connection

1. Open your browser and go to: `http://localhost:8000/docs`
2. This is the FastAPI automatic documentation
3. Try the `/health` endpoint to verify the backend is running
4. Try the `/inspections` endpoint to verify database connectivity

## Troubleshooting

### Connection Error: "could not connect to server"

- Ensure PostgreSQL is running
- Check that the database name, username, and password in `.env` are correct
- Verify PostgreSQL is listening on port 5432

### Error: "extension 'postgis' does not exist"

- Make sure PostGIS is installed (Step 1)
- Enable the extension using the command in Step 3

### Migration Error: "target database is not up to date"

- Run `alembic upgrade head` to apply pending migrations
- If that fails, run `alembic downgrade base` then `alembic upgrade head`

### Error: "No module named 'database'"

- Ensure you're in the backend directory
- Check that the database folder was copied correctly

## Alternative: SQLite (No PostGIS)

If you don't want to install PostgreSQL, you can use SQLite for development:

1. Update `.env` file:
```
DATABASE_URL=sqlite:///./nirikshan.db
```

2. Run migrations (SQLite doesn't support PostGIS, so spatial features will be limited):
```bash
alembic upgrade head
```

3. Seed the database:
```bash
python database/seed.py
```

**Note:** SQLite does not support PostGIS spatial queries. For full functionality, use PostgreSQL with PostGIS.

## Database Schema Overview

The database includes the following tables:

### Supporting Tables
- `departments` - Government departments
- `users` - All user roles (Citizen, Inspector, Supervisor, Admin)
- `sites` - Inspection locations with spatial data

### Core Tables
- `inspections` - Inspection records with spatial data
- `evidence` - Photo/video evidence with spatial data
- `evidence_similarity_results` - ML similarity detection results
- `risk_scores` - ML-generated risk assessments
- `complaints` - Citizen complaints with spatial data
- `tickets` - Actionable tickets from complaints/inspections
- `audit_events` - Append-only audit log

All spatial data uses PostGIS `GEOMETRY(Point, 4326)` for geographic coordinates.

## Next Steps

Once the database is set up and running:

1. Start the backend: `python main.py`
2. Start the frontend: `cd ../nirikshan-frontend && npm run dev`
3. Access the application at `http://localhost:5173`
4. Login with mock credentials (see frontend documentation)

## Support

If you encounter issues:

1. Check the backend console output for error messages
2. Verify PostgreSQL is running: Check Windows Services or use `pg_isready`
3. Check database exists: `\l` in psql
4. Check PostGIS is installed: `\dx` in psql to list extensions
