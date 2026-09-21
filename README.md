# Expense Tracker

A personal finance dashboard that imports bank statements from CSV, categorizes transactions and visualizes spending.

## Features

- Signup/login with JWT authentication
- Password hashing with bcrypt
- CSV upload and validation
- Duplicate transaction detection
- Rule-based categorization
- Expense/income summary
- Category and monthly charts
- Date-range and merchant search filters
- CSV export
- PDF report export
- PostgreSQL persistence
- Docker PostgreSQL setup
- Jest/Supertest backend tests
- Security middleware and authentication rate limiting

## Stack

React, Vite, Material UI, Recharts, Axios, Node.js, Express, PostgreSQL, JWT, bcrypt, Multer, csv-parse, Jest and Supertest.

## Run locally

```bash
docker compose up -d postgres
cd backend
cp .env.example .env
npm install
npm run dev
```

In another terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

Import `sample-data/sample-statement.csv` after creating an account.

## Documentation

- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/TESTING.md`
- `docs/DEPLOYMENT.md`
- `docs/SELF-ASSESSMENT.md`

## Production direction

For larger files, move uploads to object storage and process them through Redis/BullMQ workers. For ambiguous merchant descriptions, add an AI fallback classifier instead of sending every transaction to an external model.
