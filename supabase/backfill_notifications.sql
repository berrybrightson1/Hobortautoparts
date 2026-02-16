-- RETROACTIVE NOTIFICATION BACKFILL
-- This script populates the notifications table based on existing records

-- 1. Sourcing Requests
INSERT INTO notifications (user_id, title, message, type, read, created_at)
SELECT 
    user_id, 
    'Request Status Update',
    CASE 
        WHEN status = 'processing' THEN 'Your request for ' || part_name || ' is being reviewed by our agents.'
        WHEN status = 'quoted' THEN 'A new quote is available for your request: ' || part_name
        WHEN status = 'shipped' THEN 'Your parts for ' || part_name || ' have been shipped.'
        WHEN status = 'completed' THEN 'Sourcing completed for ' || part_name
        ELSE 'Status update for your request: ' || part_name
    END,
    'request',
    false,
    created_at + interval '1 second'
FROM sourcing_requests
WHERE status IN ('processing', 'quoted', 'shipped', 'completed')
ON CONFLICT DO NOTHING;

-- 2. Orders
INSERT INTO notifications (user_id, title, message, type, read, created_at)
SELECT 
    o.user_id, 
    'Order Status Update',
    CASE 
        WHEN o.status = 'paid' THEN 'Order confirmed and payment verified for ' || r.part_name
        WHEN o.status = 'processing' THEN 'Your order for ' || r.part_name || ' is being prepared.'
        WHEN o.status = 'completed' THEN 'Your order for ' || r.part_name || ' is complete.'
        ELSE 'Order update: ' || r.part_name
    END,
    'order',
    false,
    o.created_at + interval '2 seconds'
FROM orders o
JOIN quotes q ON o.quote_id = q.id
JOIN sourcing_requests r ON q.request_id = r.id
WHERE o.status IN ('paid', 'processing', 'completed')
ON CONFLICT DO NOTHING;

-- 3. Shipments
INSERT INTO notifications (user_id, title, message, type, read, created_at)
SELECT 
    o.user_id, 
    'Shipment Update',
    CASE 
        WHEN s.status = 'received_at_hub' THEN 'Package arrived at sorting facility (Ref: ' || s.tracking_number || ')'
        WHEN s.status = 'in_transit_air' THEN 'Package in transit via AIR (Ref: ' || s.tracking_number || ')'
        WHEN s.status = 'in_transit_sea' THEN 'Package in transit via SEA (Ref: ' || s.tracking_number || ')'
        WHEN s.status = 'ready_for_pickup' THEN 'Package ready for collection at ' || s.destination_hub
        WHEN s.status = 'delivered' THEN 'Package successfully delivered (Ref: ' || s.tracking_number || ')'
        ELSE 'Shipment status update: ' || s.tracking_number
    END,
    'order',
    false,
    s.created_at + interval '3 seconds'
FROM shipments s
JOIN orders o ON s.order_id = o.id
ON CONFLICT DO NOTHING;
