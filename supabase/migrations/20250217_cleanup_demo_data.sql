-- CLEANUP SCRIPT: Wipe all test/demo data for production start
-- WARNING: This will delete all records in the tables below.

DO $$ 
BEGIN
    -- Disable triggers temporarily to avoid RLS/Foreign Key friction during mass delete
    SET session_replication_role = 'replica';

    -- Truncate Tables
    TRUNCATE TABLE public.notifications CASCADE;
    TRUNCATE TABLE public.messages CASCADE;
    TRUNCATE TABLE public.request_messages CASCADE;
    TRUNCATE TABLE public.audit_logs CASCADE;
    TRUNCATE TABLE public.shipment_events CASCADE;
    TRUNCATE TABLE public.shipments CASCADE;
    TRUNCATE TABLE public.orders CASCADE;
    TRUNCATE TABLE public.quotes CASCADE;
    TRUNCATE TABLE public.sourcing_requests CASCADE;

    -- Reset Triggers
    SET session_replication_role = 'origin';
END $$;

-- Optional: Delete all profiles that aren't the primary admin if needed
-- DELETE FROM public.profiles WHERE role != 'admin'; 

-- Verification log
INSERT INTO public.audit_logs (action, details) 
VALUES ('SYSTEM_CLEANUP', '{"message": "All demo/test data wiped. System initialized for production."}'::jsonb);
