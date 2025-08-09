-- Phase 1: DB Hardening - unique indexes and updated_at triggers

-- 1) Ensure one dealer per user
create unique index if not exists unique_dealers_user_id on public.dealers(user_id);

-- 2) Ensure one dealer_website per dealer
create unique index if not exists unique_dealer_websites_dealer_id on public.dealer_websites(dealer_id);

-- 3) Automatically maintain updated_at across key tables
-- Dealers
drop trigger if exists update_dealers_updated_at on public.dealers;
create trigger update_dealers_updated_at
before update on public.dealers
for each row execute function public.update_updated_at_column();

-- Vehicles
drop trigger if exists update_vehicles_updated_at on public.vehicles;
create trigger update_vehicles_updated_at
before update on public.vehicles
for each row execute function public.update_updated_at_column();

-- Leads
drop trigger if exists update_leads_updated_at on public.leads;
create trigger update_leads_updated_at
before update on public.leads
for each row execute function public.update_updated_at_column();

-- Customers
drop trigger if exists update_customers_updated_at on public.customers;
create trigger update_customers_updated_at
before update on public.customers
for each row execute function public.update_updated_at_column();

-- Subscriptions
drop trigger if exists update_subscriptions_updated_at on public.subscriptions;
create trigger update_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.update_updated_at_column();

-- Dealer websites
drop trigger if exists update_dealer_websites_updated_at on public.dealer_websites;
create trigger update_dealer_websites_updated_at
before update on public.dealer_websites
for each row execute function public.update_updated_at_column();