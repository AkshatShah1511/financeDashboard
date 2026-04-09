# Finance Dashboard API

A backend REST API for a multi-user finance dashboard where users 
can manage financial records and view analytics based on their role. 
Built as part of a backend engineering assessment.

---

## Tech Stack

- Node.js + Express
- SQLite via Prisma ORM
- JWT for authentication
- bcrypt for password hashing
- Zod for request validation
- Swagger UI for API documentation

---

## Getting Started

Clone the repo and install dependencies:

git clone <your repo url>
cd finance-dashboard
npm install

Set up environment variables — create a .env file in root:

DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-secret-key"
PORT=3000

Run database migration and seed:

npx prisma generate
npx prisma migrate deploy
node seed.js

Start the server:

npm run dev

---

## Test Credentials

After running seed.js these accounts are ready to use:

| Role    | Email              | Password |
|---------|--------------------|----------|
| Admin   | admin@test.com     | 123456   |
| Analyst | analyst@test.com   | 123456   |
| Viewer  | viewer@test.com    | 123456   |

---

## API Documentation

Interactive documentation available at:
https://financedashboard-production-1009.up.railway.app/api-docs

You can authorize with a JWT token directly in the Swagger UI 
and test all endpoints without Postman.

---

## Live API

https://financedashboard-production-1009.up.railway.app

---

## API Endpoints

| Method | Endpoint                    | Access         |
|--------|-----------------------------|----------------|
| POST   | /api/auth/register          | Public         |
| POST   | /api/auth/login             | Public         |
| GET    | /api/users                  | Admin          |
| PATCH  | /api/users/:id              | Admin          |
| POST   | /api/records                | Admin          |
| GET    | /api/records                | Analyst, Admin |
| PATCH  | /api/records/:id            | Admin          |
| DELETE | /api/records/:id            | Admin          |
| GET    | /api/dashboard/summary      | Analyst, Admin |
| GET    | /api/dashboard/by-category  | Analyst, Admin |
| GET    | /api/dashboard/trends       | Analyst, Admin |

---

## Access Control

| Action                       | Viewer | Analyst | Admin |
|------------------------------|--------|---------|-------|
| Login / Register             | ✅     | ✅      | ✅    |
| View Records                 | ❌     | ✅      | ✅    |
| View Dashboard               | ❌     | ✅      | ✅    |
| Create / Edit / Delete       | ❌     | ❌      | ✅    |
| Manage Users                 | ❌     | ❌      | ✅    |

Access control is enforced through a permission matrix in 
middleware. Each role maps to a set of allowed permissions 
and every protected route checks this before executing.

---

## Design Decisions

I went with Node.js and Express because it's what I'm most 
comfortable with, and for an assignment like this picking a 
familiar stack meant I could focus on getting the architecture 
right rather than fighting the framework. I used Prisma as the 
ORM because it gives you a clean schema file that acts as 
documentation on its own — anyone reading the codebase can open 
schema.prisma and immediately understand the entire data model 
without digging through code.

For the database I chose SQLite. The main reason is simplicity — 
there's no server to set up, no connection strings to manage, and 
it works out of the box. For a single server finance dashboard at 
this scale it's completely appropriate. If this were a real product 
with multiple servers or heavy concurrent writes I'd switch to 
Postgres, but adding that complexity here would be solving a 
problem that doesn't exist yet.

One decision I'm glad I made early was separating controllers from 
services. Controllers only handle HTTP — they take the request, 
call a service, and send back a response. Services hold all the 
actual business logic and have no idea they're being called from 
an HTTP request. This paid off quickly because when debugging 
logic issues I knew exactly which file to look at.

I used soft delete for financial records instead of actually 
removing them from the database. Financial data feels different 
from other data — if an admin accidentally deletes a record you 
want to be able to recover it. Setting isDeleted to true and 
filtering it out everywhere was a small extra effort that makes 
the system more trustworthy.

---

## Assumptions

- All amounts must be positive — type field determines 
  income vs expense
- Viewers have no access to records or dashboard
- Categories are stored in lowercase for consistency 
  so Food and food don't become separate categories
- Soft delete is used for records — financial data 
  should never be permanently removed
- Only admins can create and manage financial records
- An admin cannot deactivate their own account
- Same error message is returned for wrong email and 
  wrong password to avoid revealing which emails are registered

---

## What I Would Improve With More Time

The part I would rethink is using plain strings for roles 
instead of proper enums at the database level. I made that 
tradeoff early to keep things moving but it means the database 
itself won't reject an invalid role — that validation only 
happens in the application layer. In a production system I'd 
enforce that at the database level too.

I would also add rate limiting on the login endpoint. Right now 
nothing stops someone from hammering it with password attempts 
in a loop. A simple limit of 5 attempts per minute would fix that.

Adding database indexes on records.date and records.category 
would be the first performance improvement I'd make. Those are 
the most common filter fields and without indexes every filter 
query does a full table scan which would degrade badly at scale.

Finally I'd add unit tests for the service layer. The services 
contain all the business logic and are the most important part 
of the system to have test coverage on.
