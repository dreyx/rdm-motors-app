# RDM Motors: Online Deployment & Security Plan

To satisfy your requirement for **100% security against XSS/injections** and **online inventory management**, we must migrate from local file storage (JSON) to a professional Database infrastructure.

## 1. Security Architecture (The "100% Secure" Strategy)

### A. Authentication (Login)
**Current Issue**: Simple password check. Vulnerable to brute force.
**Solution**: **Supabase Auth**.
- **Protection**: Handles session management, password hashing (bcrypt), and rate limiting automatically.
- **XSS Protection**: Uses `HttpOnly` cookies for sessions, making it impossible for scripts to steal credentials.
- **Implementation**: We will replace your current login with Supabase's secure client.

### B. Database (Inventory)
**Current Issue**: Data is saved to `data/vehicles.json`. This **will not work** on Vercel/Cloud hosting (files are read-only).
**Solution**: **Supabase Database (PostgreSQL)**.
- **Injection Protection**: We will use parameterized queries (via the Supabase client) which mathematically prevent SQL Injection.
- **Remote Access**: You can manage inventory from anywhere (phone, laptop) because the data lives in the cloud, not on one computer.

### C. Input Validation
**Solution**: Use **Zod** schema validation.
- Every time you save a vehicle, we validate the data on the server to ensure no malicious scripts are hidden in descriptions.

---

## 2. Deployment Roadmap (Publishing Online)

### Step 1: Create Supabase Project
1. Go to [database.new](https://database.new) (Supabase).
2. Create standard project "RDM Motors".
3. Get the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Step 2: Database Schema
Run this SQL in the Supabase SQL Editor:
```sql
create table vehicles (
  id uuid default gen_random_uuid() primary key,
  year integer not null,
  make text not null,
  model text not null,
  trim text,
  mileage integer not null,
  price numeric(10,2) not null,
  status text default 'available',
  description text,
  images text[] default '{}',
  created_at timestamp with time zone default now()
);

-- Enable Security
alter table vehicles enable row level security;
create policy "Public Read" on vehicles for select using (true);
create policy "Admin Write" on vehicles for all using (auth.role() = 'authenticated');
```

### Step 3: Update Codebase
We need to swap `lib/store.ts` (File System) with `lib/supabase.ts` (Database Cloud).

### Step 4: Deploy to Vercel
1. Push code to GitHub.
2. Connect to Vercel.
3. Add Environment Variables (Supabase Keys).
4. Click Deploy.

## 3. Next Steps for You

**Would you like me to:**
1. Create the **Supabase Client** setup codes now?
2. Write the **SQL Schema** file for you to run?
3. Update the **Admin Dashboard** to talk to the real database?

This is the only way to have a "Gartner Quality" secure backend.
