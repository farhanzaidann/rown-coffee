'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { getProducts } from '@/services/order-service';

// Define types
type Product = {
  product_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
};

export default function HomePage() {
  const { items, addToCart } = useCart();
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  }, [items]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <header className="bg-dark-900 text-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white-800">
            <Link href="/"><img
              src="/rown.png"
              alt="Rown Coffee Logo"
              className="w-8 h-8 object-cover object-center"
              width={50}
              height={50}
            /></Link>
          </div>
          <Link href="/cart">
            <Button variant="outline" size="sm" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 rounded-full h-6 w-6 flex items-center justify-center">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-[#630000] to-[#C90000] text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Premium Coffee Delivered</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Discover our handcrafted selection of premium coffee, sourced ethically and roasted to perfection.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-8">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-white-800">Our Menu</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.product_id} className="overflow-hidden transition-transform hover:scale-101">
                <CardHeader>
                  <div className="rounded-md overflow-hidden">
                    <Link href={`/product/${product.product_id}`}>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover object-center"
                        width={300}
                        height={200}
                      />
                    </Link>
                  </div>
                  <CardTitle className="text-l mt-2">{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2l font-bold text-red-700">Rp {product.price.toLocaleString()}</p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  {!product.is_available ? (
                    <Button disabled className="w-full">
                      <Badge variant="destructive">Habis</Badge>
                    </Button>
                  ) : (
                    <>
                      <Link href={`/product/${product.product_id}`} className="w-full">
                        <Button variant="outline" className="w-full">
                          Lihat Detail
                        </Button>
                      </Link>
                      <Button
                        className="w-full bg-[#630000] hover:bg-[#7a0000]"
                        onClick={() => addToCart({
                          id: product.product_id,
                          image_url: product.image_url,
                          name: product.name,
                          price: product.price,
                        })}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2"></ShoppingCart>
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#630000] text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Rown Coffee. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}