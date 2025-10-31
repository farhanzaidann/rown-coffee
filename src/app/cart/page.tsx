'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, ShoppingBasket, Trash2, ShoppingCart, StepBack, SkipBack, ArrowLeft } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = () => {
    setIsProcessing(true);
    // Redirect to checkout page
    window.location.href = '/checkout';
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-dark-900 text-white o-white flex items-center justify-center mx-4">
        <div className="text-center">
          <ShoppingBasket className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Keranjang Anda Kosong</h2>
          <p className="text-gray-600 mb-6">Tambahkan beberapa kopi lezat ke keranjang Anda</p>
          <Link href="/">
            <Button className="bg-[#630000] hover:bg-[#7a0000]">
              Lanjut Belanja
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <header className="bg-dark-900 text-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="h-10 w-10" />
            </Link>
          </Button>
          <div className="text-lg font-bold">Keranjang</div>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold mb-6">Keranjang Anda</h1>

            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="ml-4 flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-red-700 font-bold">Rp {item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="mx-2 w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="ml-2"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>Rp {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Biaya Antar</span>
                  <span>Rp 0</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
                  <span>Total</span>
                  <span>Rp {(totalPrice).toLocaleString()}</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button
                  className="w-full bg-[#630000] hover:bg-[#7a0000] mb-3"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Memproses...' : 'Checkout'}
                </Button>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Tambah Lagi
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
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