
-- 2. Create the Broadcast History table to log announcements sent by Admins
create table if not exists public.broadcast_history (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    message text not null,
    admin_id uuid references auth.users(id) on delete set null,
    recipient_count int default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for broadcast_history
alter table public.broadcast_history enable row level security;

-- Only Admins can view broadcast history
create policy "Admins can view broadcast history"
on public.broadcast_history for select
to authenticated
using (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);

-- Only Admins can insert broadcast history (though we bypass this via Service Role anyway)
create policy "Admins can insert broadcast history"
on public.broadcast_history for insert
to authenticated
with check (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);
