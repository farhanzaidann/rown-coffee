'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, MessageCircle, ExternalLink } from 'lucide-react';
import { formatOrderMessage } from '@/utils/whatsapp';

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentMethod = searchParams.get('method');
  const [countdown, setCountdown] = useState(5);
  type OrderItem = {
    id: number;
    name: string;
    price: number;
    quantity: number;
  };

  type OrderInfo = {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    paymentMethod: string;
    total: number;
    items: OrderItem[];
    hasPaymentProof: boolean;
    orderId?: string;
  };

  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  
  useEffect(() => {
    // Start countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Automatically redirect after countdown
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 5000);
    
    // Retrieve order info from session storage
    const storedOrder = sessionStorage.getItem('currentOrder');
    if (storedOrder) {
      const parsedOrder = JSON.parse(storedOrder);
      setOrderInfo(parsedOrder);
      
      // Create WhatsApp message
      const message = formatOrderMessage(
        parsedOrder.customerName,
        parsedOrder.customerPhone,
        parsedOrder.customerAddress,
        parsedOrder.items,
        parsedOrder.paymentMethod,
        parsedOrder.hasPaymentProof
      );
      setWhatsappUrl(`https://wa.me/6285289378734?text=${message}`);
    }
    
    return () => clearInterval(timer);
  }, [router]);

  if (!orderInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p>Memuat informasi pesanan...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-dark-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Pesanan Berhasil!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Terima kasih telah memesan di Rown Coffee. Pesanan Anda telah kami terima.
            </p>
            
            <div className="bg-grey-800 text-white rounded-lg p-4 mb-6 text-left">
              <h3 className="font-bold mb-2">Detail Pesanan:</h3>
              <ul className="space-y-1">
                {(orderInfo.items as OrderItem[]).map((item: OrderItem) => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>Rp {(item.quantity * item.price).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                <span>Total:</span>
                <span>Rp {orderInfo.total.toLocaleString()}</span>
              </div>
            </div>
            
            <p className="mb-2">
              Metode Pembayaran: <span className="font-semibold">
                {paymentMethod === 'cash' ? 'Cash (Bayar di Tempat)' : 'QRIS'}
              </span>
            </p>
            
            <p className="text-gray-600 mb-6">
              Anda akan dialihkan ke halaman utama dalam {countdown} detik...
            </p>
            
            <div className="space-y-4">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Konfirmasi via WhatsApp
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
              
              <Button className='mt-3' variant="outline" onClick={() => router.push('/')}>
                Kembali ke Beranda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}