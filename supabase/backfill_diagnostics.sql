-- diagnostics.sql
-- Run this to check why the backfill might be empty

-- 1. Check if tables have any data at all
SELECT 'sourcing_requests' as table_name, COUNT(*) FROM sourcing_requests
UNION ALL
SELECT 'orders', COUNT(*) FROM orders;

-- 2. Check current status distributions
SELECT 'sourcing_requests_status' as category, status, COUNT(*) 
FROM sourcing_requests 
GROUP BY status
UNION ALL
SELECT 'orders_status', status, COUNT(*) 
FROM orders 
GROUP BY status;

-- 3. Check if notifications already exist
SELECT COUNT(*) as existing_notifications FROM notifications;
