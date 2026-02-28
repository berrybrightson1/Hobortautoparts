-- ============================================================
-- Hobort Billing: billing_invoices table
-- Run this in your Supabase SQL Editor
-- ============================================================

create table if not exists public.billing_invoices (
  id                     text primary key,
  user_id                uuid not null references auth.users(id) on delete cascade,
  customer_name          text not null,
  customer_email         text,
  customer_address       text,
  line_items             jsonb not null default '[]',
  status                 text not null default 'balance_due' check (status in ('paid', 'balance_due')),
  created_at             text not null,
  due_date               text,
  currency               text,
  purchase_order         text,
  payment_instructions   text,
  tax_percent            numeric,
  discount_amount        numeric,
  shipping_fee           numeric,
  exchange_rate_at_payment numeric,
  updated_at             timestamptz default now()
);

-- Index for fast per-user queries
create index if not exists billing_invoices_user_id_idx on public.billing_invoices(user_id);

-- Enable Row Level Security
alter table public.billing_invoices enable row level security;

-- RLS Policies: users can only access their own invoices
create policy "Users can view own invoices"
  on public.billing_invoices for select
  using (auth.uid() = user_id);

create policy "Users can create own invoices"
  on public.billing_invoices for insert
  with check (auth.uid() = user_id);

create policy "Users can update own invoices"
  on public.billing_invoices for update
  using (auth.uid() = user_id);

create policy "Users can delete own invoices"
  on public.billing_invoices for delete
  using (auth.uid() = user_id);

-- Enable realtime for this table (run in Supabase dashboard under Database > Replication if needed)
-- alter publication supabase_realtime add table billing_invoices;
