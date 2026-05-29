-- BarberAI initial schema

create table public.profiles (
  id uuid references auth.users(id) primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text check (role in ('barber', 'client')) not null default 'client',
  plan text check (plan in ('free', 'pro')) not null default 'free',
  ai_requests_today integer not null default 0,
  ai_requests_reset_at date not null default current_date,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

create table public.barbers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) unique not null,
  shop_name text not null,
  bio text,
  location text,
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid references public.barbers(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes integer not null,
  price_cents integer not null,
  is_active boolean default true
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id),
  barber_id uuid references public.barbers(id),
  service_id uuid references public.services(id),
  scheduled_at timestamptz not null,
  status text check (status in ('pending', 'confirmed', 'cancelled', 'completed')) default 'pending',
  notes text,
  ai_recommendation text,
  created_at timestamptz default now()
);

create table public.ai_consultations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  prompt text not null,
  response text not null,
  created_at timestamptz default now()
);

create table public.barber_availability (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid references public.barbers(id) on delete cascade,
  day_of_week integer check (day_of_week between 0 and 6) not null,
  start_time time not null,
  end_time time not null,
  unique(barber_id, day_of_week, start_time)
);

-- RLS
alter table public.profiles enable row level security;
alter table public.barbers enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.ai_consultations enable row level security;
alter table public.barber_availability enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Public can view barber profiles" on public.profiles
  for select using (
    exists (select 1 from public.barbers where user_id = profiles.id and is_active = true)
  );

-- Barbers
create policy "Barbers are publicly viewable" on public.barbers
  for select using (true);
create policy "Barbers can insert own profile" on public.barbers
  for insert with check (auth.uid() = user_id);
create policy "Barbers can update own profile" on public.barbers
  for update using (auth.uid() = user_id);
create policy "Barbers can delete own profile" on public.barbers
  for delete using (auth.uid() = user_id);

-- Services
create policy "Services are publicly viewable" on public.services
  for select using (true);
create policy "Barbers manage own services" on public.services
  for all using (
    auth.uid() = (select user_id from public.barbers where id = barber_id)
  );

-- Bookings
create policy "Clients see own bookings" on public.bookings
  for select using (auth.uid() = client_id);
create policy "Barbers see their bookings" on public.bookings
  for select using (
    auth.uid() = (select user_id from public.barbers where id = barber_id)
  );
create policy "Clients can create bookings" on public.bookings
  for insert with check (auth.uid() = client_id);
create policy "Clients can update own bookings" on public.bookings
  for update using (auth.uid() = client_id);
create policy "Barbers can update their bookings" on public.bookings
  for update using (
    auth.uid() = (select user_id from public.barbers where id = barber_id)
  );

-- AI consultations
create policy "Users see own consultations" on public.ai_consultations
  for select using (auth.uid() = user_id);
create policy "Users insert own consultations" on public.ai_consultations
  for insert with check (auth.uid() = user_id);

-- Availability
create policy "Availability is publicly viewable" on public.barber_availability
  for select using (true);
create policy "Barbers manage own availability" on public.barber_availability
  for all using (
    auth.uid() = (select user_id from public.barbers where id = barber_id)
  );

-- Signup trigger: auto-create profile (+ barber row if role=barber)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_role text;
  user_shop_name text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'client');
  user_shop_name := new.raw_user_meta_data->>'shop_name';

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    user_role
  );

  if user_role = 'barber' then
    insert into public.barbers (user_id, shop_name)
    values (new.id, coalesce(user_shop_name, 'My Barbershop'));
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
