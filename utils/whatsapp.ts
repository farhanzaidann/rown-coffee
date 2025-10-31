// utils/whatsapp.ts

export const formatOrderMessage = (
  customerName: string,
  customerPhone: string,
  customerAddress: string,
  items: any[],
  paymentMethod: string,
  hasPaymentProof?: boolean
): string => {
  let message = `Halo Rown Coffee, saya ${customerName}, mau pesan:\n`;
  
  items.forEach(item => {
    message += `- ${item.quantity}x ${item.name}\n`;
  });
  
  message += `Alamat: ${customerAddress}\n`;
  message += `HP: ${customerPhone}\n`;
  
  if (paymentMethod === 'cash') {
    message += `Pembayaran: Cash (Bayar di Tempat).`;
  } else {
    message += `Pembayaran: Lunas (via QRIS).`;
    if (hasPaymentProof) {
      message += ' Bukti bayar sudah diupload.';
    }
  }
  
  return encodeURIComponent(message);
};