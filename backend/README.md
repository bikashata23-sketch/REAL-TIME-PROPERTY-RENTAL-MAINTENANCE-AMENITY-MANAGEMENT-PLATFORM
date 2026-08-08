# Property Platform — Backend (Step 1: Core Skeleton)

## Setup

```bash
cd backend
npm install
```

Edit `.env` and set your real MongoDB Atlas connection string:

```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/property-platform?retryWrites=true&w=majority
```

## Run (dev mode, auto-restart)

```bash
npm run dev
```

## Verify

```bash
curl http://localhost:5000/api/health
```

Expected:
```json
{ "success": true, "message": "Server is healthy", "timestamp": "..." }
```

Test 404 handler:
```bash
curl http://localhost:5000/api/nonexistent
```

## Structure

```
backend/
├── src/
│   ├── config/db.js
│   ├── controllers/     (empty — filled in later steps)
│   ├── routes/          (empty — filled in later steps)
│   ├── middleware/errorHandler.js
│   ├── models/          (empty — filled in later steps)
│   ├── services/        (empty — filled in later steps)
│   ├── utils/logger.js
│   ├── socket/          (empty — filled in later steps)
│   ├── app.js
│   └── server.js
├── .env
├── .env.example
├── .gitignore
└── package.json
```
