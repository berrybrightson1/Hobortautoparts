-- Check if there are any shipments
SELECT COUNT(*) as result, 'shipments' as table_name FROM shipments;

-- Check if there are any orders, and their statuses
SELECT status, COUNT(*) as count FROM orders GROUP BY status;

-- List top 5 recent orders to see details
SELECT id, status, created_at, user_id FROM orders ORDER BY created_at DESC LIMIT 5;
