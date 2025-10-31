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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating order:', error);
    return { success: false, error: errorMessage };
  }
};

export const getProducts = async () => {
  // Check if environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Return mock data when Supabase is not configured
    console.warn('Supabase environment variables not set, using mock data');
    return [
      {
        product_id: 1,
        name: 'Kopi Susu Gula Aren',
        description: 'Smooth coffee with rich brown sugar notes. Made from premium Arabica beans sourced from high-altitude farms in Central Java. Features notes of caramel, vanilla, and a subtle hint of spice.',
        price: 28000,
        image_url: '/placeholder-coffee1.jpg',
        is_available: true,
      },
      {
        product_id: 2,
        name: 'Americano',
        description: 'Strong and bold traditional espresso. A classic Italian preparation with a perfect balance of bitter and acidic flavors. Made from a double shot of espresso diluted with hot water.',
        price: 24000,
        image_url: '/placeholder-coffee2.jpg',
        is_available: true,
      },
      {
        product_id: 3,
        name: 'V60',
        description: 'Hand-drip with floral and fruity notes. Our baristas carefully prepare this using the pour-over method, allowing for maximum flavor extraction. Features bright acidity and complex flavor notes.',
        price: 32000,
        image_url: '/placeholder-coffee3.jpg',
        is_available: true,
      },
      {
        product_id: 4,
        name: 'Cold Brew',
        description: 'Smooth and refreshing cold-brewed coffee. Steamed for 18 hours in cold water for a less acidic and smoother taste. Served over ice with a rich, chocolatey finish.',
        price: 30000,
        image_url: '/placeholder-coffee4.jpg',
        is_available: true,
      },
      {
        product_id: 5,
        name: 'Cappuccino',
        description: 'Espresso with steamed milk foam. A perfect blend of strong espresso, velvety steamed milk, and a thick layer of microfoam. Dust with cinnamon for an extra touch.',
        price: 26000,
        image_url: '/placeholder-coffee5.jpg',
        is_available: true,
      },
      {
        product_id: 6,
        name: 'Latte',
        description: 'Creamy espresso with steamed milk. Made with a shot of espresso and steamed milk, finished with a small amount of foam. Perfect for those who prefer a milder coffee flavor.',
        price: 28000,
        image_url: '/placeholder-coffee6.jpg',
        is_available: false,
      },
    ];
  }

  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true);
      
    if (error) {
      console.error('Supabase error:', error);
      // Return mock data on Supabase error
      return [
        {
          product_id: 1,
          name: 'Kopi Susu Gula Aren',
          description: 'Smooth coffee with rich brown sugar notes. Made from premium Arabica beans sourced from high-altitude farms in Central Java. Features notes of caramel, vanilla, and a subtle hint of spice.',
          price: 28000,
          image_url: '/placeholder-coffee1.jpg',
          is_available: true,
        },
        {
          product_id: 2,
          name: 'Americano',
          description: 'Strong and bold traditional espresso. A classic Italian preparation with a perfect balance of bitter and acidic flavors. Made from a double shot of espresso diluted with hot water.',
          price: 24000,
          image_url: '/placeholder-coffee2.jpg',
          is_available: true,
        },
        {
          product_id: 3,
          name: 'V60',
          description: 'Hand-drip with floral and fruity notes. Our baristas carefully prepare this using the pour-over method, allowing for maximum flavor extraction. Features bright acidity and complex flavor notes.',
          price: 32000,
          image_url: '/placeholder-coffee3.jpg',
          is_available: true,
        },
        {
          product_id: 4,
          name: 'Cold Brew',
          description: 'Smooth and refreshing cold-brewed coffee. Steamed for 18 hours in cold water for a less acidic and smoother taste. Served over ice with a rich, chocolatey finish.',
          price: 30000,
          image_url: '/placeholder-coffee4.jpg',
          is_available: true,
        },
        {
          product_id: 5,
          name: 'Cappuccino',
          description: 'Espresso with steamed milk foam. A perfect blend of strong espresso, velvety steamed milk, and a thick layer of microfoam. Dust with cinnamon for an extra touch.',
          price: 26000,
          image_url: '/placeholder-coffee5.jpg',
          is_available: true,
        },
        {
          product_id: 6,
          name: 'Latte',
          description: 'Creamy espresso with steamed milk. Made with a shot of espresso and steamed milk, finished with a small amount of foam. Perfect for those who prefer a milder coffee flavor.',
          price: 28000,
          image_url: '/placeholder-coffee6.jpg',
          is_available: false,
        },
      ];
    }
    
    return data || [];
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching products:', error);
    // Return mock data on any error
    return [
      {
        product_id: 1,
        name: 'Kopi Susu Gula Aren',
        description: 'Smooth coffee with rich brown sugar notes. Made from premium Arabica beans sourced from high-altitude farms in Central Java. Features notes of caramel, vanilla, and a subtle hint of spice.',
        price: 28000,
        image_url: '/placeholder-coffee1.jpg',
        is_available: true,
      },
      {
        product_id: 2,
        name: 'Americano',
        description: 'Strong and bold traditional espresso. A classic Italian preparation with a perfect balance of bitter and acidic flavors. Made from a double shot of espresso diluted with hot water.',
        price: 24000,
        image_url: '/placeholder-coffee2.jpg',
        is_available: true,
      },
      {
        product_id: 3,
        name: 'V60',
        description: 'Hand-drip with floral and fruity notes. Our baristas carefully prepare this using the pour-over method, allowing for maximum flavor extraction. Features bright acidity and complex flavor notes.',
        price: 32000,
        image_url: '/placeholder-coffee3.jpg',
        is_available: true,
      },
      {
        product_id: 4,
        name: 'Cold Brew',
        description: 'Smooth and refreshing cold-brewed coffee. Steamed for 18 hours in cold water for a less acidic and smoother taste. Served over ice with a rich, chocolatey finish.',
        price: 30000,
        image_url: '/placeholder-coffee4.jpg',
        is_available: true,
      },
      {
        product_id: 5,
        name: 'Cappuccino',
        description: 'Espresso with steamed milk foam. A perfect blend of strong espresso, velvety steamed milk, and a thick layer of microfoam. Dust with cinnamon for an extra touch.',
        price: 26000,
        image_url: '/placeholder-coffee5.jpg',
        is_available: true,
      },
      {
        product_id: 6,
        name: 'Latte',
        description: 'Creamy espresso with steamed milk. Made with a shot of espresso and steamed milk, finished with a small amount of foam. Perfect for those who prefer a milder coffee flavor.',
        price: 28000,
        image_url: '/placeholder-coffee6.jpg',
        is_available: false,
      },
    ];
  }
};