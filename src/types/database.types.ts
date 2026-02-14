export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    role: 'admin' | 'agent' | 'customer'
                    full_name: string | null
                    phone_number: string | null
                    country: string | null
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    role?: 'admin' | 'agent' | 'customer'
                    full_name?: string | null
                    phone_number?: string | null
                    country?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    role?: 'admin' | 'agent' | 'customer'
                    full_name?: string | null
                    phone_number?: string | null
                    country?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            agents: {
                Row: {
                    id: string
                    referral_code: string
                    commission_rate: number
                    momo_number: string | null
                    bank_details: Json | null
                    total_earnings: number
                    status: 'active' | 'suspended'
                    created_at: string
                }
                Insert: {
                    id: string
                    referral_code: string
                    commission_rate?: number
                    momo_number?: string | null
                    bank_details?: Json | null
                    total_earnings?: number
                    status?: 'active' | 'suspended'
                    created_at?: string
                }
                Update: {
                    id?: string
                    referral_code?: string
                    commission_rate?: number
                    momo_number?: string | null
                    bank_details?: Json | null
                    total_earnings?: number
                    status?: 'active' | 'suspended'
                    created_at?: string
                }
            }
            sourcing_requests: {
                Row: {
                    id: string
                    user_id: string
                    vin: string | null
                    part_name: string
                    part_number: string | null
                    vehicle_info: string | null
                    budget_min: number | null
                    budget_max: number | null
                    status: 'pending' | 'processing' | 'quoted' | 'shipped' | 'completed' | 'cancelled'
                    agent_id: string | null
                    images: string[] | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    vin?: string | null
                    part_name: string
                    part_number?: string | null
                    vehicle_info?: string | null
                    budget_min?: number | null
                    budget_max?: number | null
                    status?: 'pending' | 'processing' | 'quoted' | 'shipped' | 'completed' | 'cancelled'
                    images?: string[] | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    vin?: string | null
                    part_name?: string
                    part_number?: string | null
                    vehicle_info?: string | null
                    budget_min?: number | null
                    budget_max?: number | null
                    status?: 'pending' | 'processing' | 'quoted' | 'shipped' | 'completed' | 'cancelled'
                    images?: string[] | null
                    created_at?: string
                }
            }
            quotes: {
                Row: {
                    id: string
                    request_id: string
                    admin_id: string | null
                    item_price: number
                    shipping_cost: number
                    service_fee: number
                    total_amount: number
                    currency: 'USD' | 'GHS'
                    valid_until: string | null
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    request_id: string
                    admin_id?: string | null
                    item_price: number
                    shipping_cost: number
                    service_fee: number
                    total_amount: number
                    currency?: 'USD' | 'GHS'
                    valid_until?: string | null
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    request_id?: string
                    admin_id?: string | null
                    item_price?: number
                    shipping_cost?: number
                    service_fee?: number
                    total_amount?: number
                    currency?: 'USD' | 'GHS'
                    valid_until?: string | null
                    notes?: string | null
                    created_at?: string
                }
            }
            orders: {
                Row: {
                    id: string
                    user_id: string
                    quote_id: string
                    agent_id: string | null
                    status: 'pending_payment' | 'paid' | 'processing' | 'completed' | 'cancelled'
                    payment_method: string | null
                    transaction_ref: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    quote_id: string
                    agent_id?: string | null
                    status?: 'pending_payment' | 'paid' | 'processing' | 'completed' | 'cancelled'
                    payment_method?: string | null
                    transaction_ref?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    quote_id?: string
                    agent_id?: string | null
                    status?: 'pending_payment' | 'paid' | 'processing' | 'completed' | 'cancelled'
                    payment_method?: string | null
                    transaction_ref?: string | null
                    created_at?: string
                }
            }
            shipments: {
                Row: {
                    id: string
                    order_id: string
                    tracking_number: string
                    freight_type: 'air' | 'sea'
                    status: 'received_at_hub' | 'in_transit_air' | 'in_transit_sea' | 'clearing_customs' | 'ready_for_pickup' | 'delivered'
                    origin_hub: string | null
                    destination_hub: string | null
                    estimated_arrival: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    tracking_number: string
                    freight_type?: 'air' | 'sea'
                    status?: 'received_at_hub' | 'in_transit_air' | 'in_transit_sea' | 'clearing_customs' | 'ready_for_pickup' | 'delivered'
                    origin_hub?: string | null
                    destination_hub?: string | null
                    estimated_arrival?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    tracking_number?: string
                    freight_type?: 'air' | 'sea'
                    status?: 'received_at_hub' | 'in_transit_air' | 'in_transit_sea' | 'clearing_customs' | 'ready_for_pickup' | 'delivered'
                    origin_hub?: string | null
                    destination_hub?: string | null
                    estimated_arrival?: string | null
                    created_at?: string
                }
            }
            shipment_events: {
                Row: {
                    id: string
                    shipment_id: string
                    status: string
                    location: string
                    description: string | null
                    occurred_at: string
                }
                Insert: {
                    id?: string
                    shipment_id: string
                    status: string
                    location: string
                    description?: string | null
                    occurred_at?: string
                }
                Update: {
                    id?: string
                    shipment_id?: string
                    status?: string
                    location?: string
                    description?: string | null
                    occurred_at?: string
                }
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    message: string
                    type: 'order' | 'promo' | 'system' | 'request'
                    read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    message: string
                    type?: 'order' | 'promo' | 'system' | 'request'
                    read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    message?: string
                    type?: 'order' | 'promo' | 'system' | 'request'
                    read?: boolean
                    created_at?: string
                }
            }
        }
    }
}
