// services/order-service.ts
import { createClient } from '@/lib/supabase/client';

export interface OrderItem {
  product_id: number;
  quantity: number;
  price_at_order: number;
}

export interface OrderData {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  payment_method: string;
  total_amount: number;
  order_items: OrderItem[];
  payment_proof_url?: string;
}

export const createOrder = async (orderData: OrderData) => {
  const supabase = createClient();
  
  try {
    // Insert the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_address: orderData.customer_address,
        payment_method: orderData.payment_method,
        total_amount: orderData.total_amount,
        payment_status: orderData.payment_method === 'cash' ? 'cash' : 'pending',
        payment_proof_url: orderData.payment_proof_url,
      }])
      .select('order_id')
      .single();

    if (orderError) {
      throw new Error(`Error creating order: ${orderError.message}`);
    }

    // Insert order items
    const orderItemsData = orderData.order_items.map(item => ({
      order_id: order.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_order: item.price_at_order,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      throw new Error(`Error creating order items: ${itemsError.message}`);
    }

    return { success: true, orderId: order.order_id };
  } catch (error: any) {
    console.error('Error creating order:', error);
    return { success: false, error: error.message };
  }
};

export const getProducts = async () => {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true);
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return [];
  }
};