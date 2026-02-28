-- Backfill historical users into the Audit Logs
-- This script safely injects a "sign_up" action for every existing user in your profiles table
-- that doesn't already have one.

INSERT INTO public.audit_logs (user_id, action, details, ip_address)
SELECT 
    p.id as user_id, 
    'sign_up' as action, 
    jsonb_build_object('email', au.email, 'role', p.role) as details,
    'Historical Data Upload' as ip_address
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE NOT EXISTS (
    SELECT 1 FROM public.audit_logs al
    WHERE al.user_id = p.id AND al.action = 'sign_up'
);
