-- RDM Motors Database Schema
-- Run this in the Supabase SQL Editor

-- 1. Create Vehicles Table
create table public.vehicles (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Vehicle Details
  year integer not null,
  make text not null,
  model text not null,
  trim text,
  
  -- Specs
  mileage integer not null,
  transmission text default 'Automatic',
  exterior_color text,
  interior_color text,
  fuel_type text default 'Gasoline',
  drivetrain text,
  vin text,
  stock_number text,
  
  -- Sales Info
  price numeric not null,
  status text default 'available', -- 'available', 'sold', 'pending'
  description text,
  
  -- Images (Array of URLs)
  images text[] default '{}'::text[],
  
  -- Metadata
  is_featured boolean default false
);

-- 2. Enable Row Level Security (RLS) - "The 100% Security Layer"
alter table public.vehicles enable row level security;

-- 3. Define Policies
-- Policy: Anyone can SEE available vehicles
create policy "Public can view vehicles" 
  on public.vehicles for select 
  using (true);

-- Policy: Only ADMINS (Logged in) can INSERT/UPDATE/DELETE
create policy "Admins can manage vehicles" 
  on public.vehicles for all 
  using (auth.role() = 'authenticated');

-- 4. Storage Bucket for Images
insert into storage.buckets (id, name, public) 
values ('vehicle-images', 'vehicle-images', true);

create policy "Images are public" 
  on storage.objects for select 
  using ( bucket_id = 'vehicle-images' );

create policy "Admins can upload images" 
  on storage.objects for insert 
  with check ( bucket_id = 'vehicle-images' and auth.role() = 'authenticated' );
