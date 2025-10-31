'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useCart } from '@/hooks/use-cart';
import { createOrder } from '@/services/order-service';
import { uploadPaymentProof, validatePaymentProofFile } from '@/services/payment-proof-service';
import { CreditCard, MapPin, User, Phone, Upload, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

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

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [orderData, setOrderData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    paymentMethod: 'cash',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  // Calculate total with delivery fee
  const totalWithDelivery = totalPrice + 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (value: string) => {
    setOrderData(prev => ({ ...prev, paymentMethod: value as 'cash' | 'qris' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPaymentProof(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!orderData.customerName || !orderData.customerPhone || !orderData.customerAddress) {
      alert('Silakan lengkapi semua informasi pemesanan');
      return;
    }

    if (!agreedToTerms) {
      alert('Silakan setujui syarat dan ketentuan');
      return;
    }

    setIsSubmitting(true);

    try {
      let paymentProofUrl = null;

      if (orderData.paymentMethod === 'qris') {
        if (!paymentProof) {
          alert('Silakan unggah bukti pembayaran QRIS');
          setIsSubmitting(false);
          return;
        }

        // Validate the payment proof file
        const validation = validatePaymentProofFile(paymentProof);
        if (!validation.isValid) {
          alert(validation.error);
          setIsSubmitting(false);
          return;
        }

        // Upload the payment proof to storage
        const uploadResult = await uploadPaymentProof(paymentProof);
        if (!uploadResult.success) {
          alert(`Gagal mengupload bukti pembayaran: ${uploadResult.error}`);
          setIsSubmitting(false);
          return;
        }

        paymentProofUrl = uploadResult.url;
      }

      // Prepare order data for the API
      const orderPayload = {
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        customer_address: orderData.customerAddress,
        payment_method: orderData.paymentMethod,
        total_amount: totalWithDelivery,
        order_items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price_at_order: item.price,
        })),
        payment_proof_url: paymentProofUrl || undefined,
      };

      // Create the order in the database
      const result = await createOrder(orderPayload);

      if (result.success) {
        // Clear cart after successful order
        clearCart();

        // Create order object with payment proof info
        const orderInfo = {
          ...orderData,
          total: totalWithDelivery,
          items,
          hasPaymentProof: !!paymentProofUrl,
          orderId: result.orderId,
        };

        // Store order info in session storage for use in confirmation page
        sessionStorage.setItem('currentOrder', JSON.stringify(orderInfo));

        // Redirect to confirmation page
        router.push(`/confirmation?method=${orderData.paymentMethod}`);
      } else {
        throw new Error(result.error || 'Failed to create order');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error creating order:', error);
      alert(`Error creating order: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <header className="bg-dark-900 text-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-10 w-10" />
          </Button>
          <div className="text-lg font-bold">Checkout</div>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pemesan</CardTitle>
                <CardDescription>Silakan isi informasi pemesan dengan lengkap</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Nama Lengkap</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="customerName"
                        name="customerName"
                        value={orderData.customerName}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama lengkap"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Nomor WhatsApp</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="customerPhone"
                        name="customerPhone"
                        value={orderData.customerPhone}
                        onChange={handleInputChange}
                        placeholder="Contoh: 081234567890"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerAddress">Alamat Pengiriman</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea
                      id="customerAddress"
                      name="customerAddress"
                      value={orderData.customerAddress}
                      onChange={handleInputChange}
                      placeholder="Contoh: Jl. Merdeka No. 123, Kel. Sukajadi, Kec. Coblong, Kota Bandung"
                      className="pl-10 min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pilih Metode Pembayaran</Label>
                  <RadioGroup
                    value={orderData.paymentMethod}
                    onValueChange={handlePaymentMethodChange}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem
                        value="cash"
                        id="cash"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="cash"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-red-200 bg-white p-4 hover:bg-red-50 hover:border-red-300 peer-data-[state=checked]:border-red-700 peer-data-[state=checked]:bg-red-50 cursor-pointer"
                      >
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 mr-2 text-black" />
                          <span className="font-medium text-black">Cash (Bayar di Tempat)</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Bayar saat kurir tiba</p>
                      </Label>
                    </div>

                    <div>
                      <RadioGroupItem
                        value="qris"
                        id="qris"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="qris"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-red-200 bg-white p-4 hover:bg-red-50 hover:border-red-300 peer-data-[state=checked]:border-red-700 peer-data-[state=checked]:bg-red-50 cursor-pointer"
                      >
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 mr-2 text-black" />
                          <span className="font-medium text-black">QRIS</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Scan QR untuk pembayaran</p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {orderData.paymentMethod === 'qris' && (
                  <div className="space-y-2">
                    <Label htmlFor="paymentProof">Upload Bukti Pembayaran</Label>
                    <div className="border-2 border-dashed border-amber-300 rounded-lg p-6 text-center">
                      <Upload className="h-10 w-10 mx-auto text-amber-500" />
                      <p className="mt-2 font-medium">Upload Screenshot Bukti Pembayaran QRIS</p>
                      <p className="text-sm text-gray-500">Lakukan pembayaran melalui e-wallet, lalu unggah screenshot bukti transfer</p>

                      <Input
                        id="paymentProof"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="mt-4"
                      />

                      {proofPreview && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Pratinjau Bukti Pembayaran:</p>
                          <div className="border rounded-md p-2 inline-block">
                            <img
                              src={proofPreview}
                              alt="Bukti Pembayaran Preview"
                              className="max-h-40 rounded"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-2 pt-4">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    Saya menyetujui <a href="#" className="text-amber-700 hover:underline">syarat dan ketentuan</a> serta <a href="#" className="text-amber-700 hover:underline">kebijakan privasi</a>.
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {orderData.paymentMethod === 'qris' && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>QRIS Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-48 h-48 flex items-center justify-center mb-4">
                    <Image
                      className='p-3'
                      src="/qris.png"
                      width={450}
                      height={450}
                      alt="qris"
                    />
                  </div>
                  <p className="text-center text-sm text-gray-600">
                    Scan QRIS ini untuk melakukan pembayaran
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.quantity} x Rp {item.price.toLocaleString()}</p>
                    </div>
                    <p className="font-medium">Rp {(item.quantity * item.price).toLocaleString()}</p>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <span>Rp {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Biaya Antar</span>
                    <span>Rp 0</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-2">
                    <span>Total</span>
                    <span>Rp {totalWithDelivery.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-[#630000] hover:bg-[#7a0000]"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Memproses Pesanan...' : 'Konfirmasi Pesanan'}
                </Button>
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