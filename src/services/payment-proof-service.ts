// services/payment-proof-service.ts

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const validatePaymentProofFile = (file: File): ValidationResult => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.'
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Ukuran file terlalu besar. Maksimal 5MB.'
    };
  }

  return { isValid: true };
};

export const uploadPaymentProof = async (file: File): Promise<UploadResult> => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    // Call the Next.js API route which forwards to Supabase function
    const response = await fetch('/api/upload-payment-proof', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Gagal mengupload bukti pembayaran'
      };
    }

    // Return the path from the response
    return {
      success: true,
      url: result.data?.path ? `/payment-proof/${result.data.path}` : undefined
    };
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Terjadi kesalahan saat upload bukti pembayaran'
    };
  }
};