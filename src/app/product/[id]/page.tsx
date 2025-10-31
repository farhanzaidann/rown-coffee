'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
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

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const productId = Number(id);
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const allProducts = await getProducts();
        const foundProduct = allProducts.find(p => p.product_id === productId);
        
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Failed to load product');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">{error || 'Product not found'}</div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.product_id,
      name: product.name,
      price: product.price,
      image_url: product.image_url
    });
    router.push('/cart');
  };

  const handleDirectOrder = () => {
    addToCart({
      id: product.product_id,
      name: product.name,
      price: product.price,
      image_url: product.image_url
    });
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <header className="bg-dark-900 text-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
          </Button>
          <Link href="/cart">
            <Button variant="outline" size="sm">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <div className="md:flex">
            <div className="md:w-1/2">
              <div className="rounded-t-lg md:rounded-l-lg md:rounded-t-none overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  width={600}
                  height={400}
                />
              </div>
            </div>
            <div className="md:w-1/2 p-6">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                {!product.is_available && (
                  <Badge variant="destructive">Habis</Badge>
                )}
              </div>
              
              <div className="mt-4">
                <p className="text-2xl font-bold text-red-700">Rp {product.price.toLocaleString()}</p>
              </div>
              
              <div className="mt-4">
                <h2 className="text-lg font-semibold">Deskripsi</h2>
                <p className="mt-2 text-gray-600">{product.description}</p>
              </div>
              
              <div className="mt-6">
                <h2 className="text-lg font-semibold">Jumlah</h2>
                <div className="flex items-center mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!product.is_available}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="mx-4 text-lg">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!product.is_available}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-8 flex flex-col gap-3">
                <Button 
                  className="bg-[#630000] hover:bg-[#7a0000]" 
                  onClick={handleDirectOrder}
                  disabled={!product.is_available}
                >
                  Pesan Langsung
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleAddToCart}
                  disabled={!product.is_available}
                >
                  Masukkan Keranjang
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-[#630000] text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Rown Coffee. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}