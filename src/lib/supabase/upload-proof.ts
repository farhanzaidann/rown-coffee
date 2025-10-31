import { SUPABASE_CONFIG } from '@/config/supabase';

/**
 * Uploads proof (like payment proof) to Supabase storage via edge function
 * 
 * This function makes a POST request to a Supabase edge function that handles
 * the actual file upload to Supabase storage. The edge function is expected to:
 * 1. Authenticate the request using the Supabase API key
 * 2. Process the uploaded file
 * 3. Store it in the appropriate Supabase storage bucket
 * 4. Return the public URL of the uploaded file
 * 
 * @param file - The file to upload
 * @param fileName - The name to save the file under
 * @param folderPath - Optional folder path within storage (e.g., 'payment-proofs', 'user-uploads')
 * @returns The URL of the uploaded file or an error object
 */
export const uploadProofToStorage = async (
  file: File | Blob,
  fileName: string,
  folderPath?: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // Validate inputs
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    if (!fileName) {
      return { success: false, error: 'No file name provided' };
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file, fileName);
    
    // Include folder path if provided
    if (folderPath) {
      formData.append('folder', folderPath);
    }

    // Set up headers with Supabase credentials
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
      'apikey': SUPABASE_CONFIG.key,
    };

    // Call the Supabase edge function
    const response = await fetch(
      'https://wphhejmvdbeynljpuvuj.supabase.co/functions/v1/storage-upload', 
      {
        method: 'POST',
        headers,
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error:', errorText);
      return { 
        success: false, 
        error: `Upload failed with status ${response.status}: ${errorText}` 
      };
    }

    const responseData = await response.json();
    
    // Return the uploaded file URL
    return { 
      success: true, 
      url: responseData.url || responseData.publicUrl || responseData.path 
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
    console.error('Upload error:', error);
    return { success: false, error: errorMessage };
  }
};

/**
 * Alternative function for uploading base64 encoded data
 * @param base64Data - Base64 encoded string of the file
 * @param fileName - The name to save the file under
 * @param mimeType - The MIME type of the file
 * @param folderPath - Optional folder path within storage
 * @returns The URL of the uploaded file or an error object
 */
export const uploadBase64ProofToStorage = async (
  base64Data: string,
  fileName: string,
  mimeType: string,
  folderPath?: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // Convert base64 to blob
    const byteCharacters = atob(base64Data.split(',')[1] || base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: mimeType });
    
    return await uploadProofToStorage(blob, fileName, folderPath);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
    console.error('Base64 upload error:', error);
    return { success: false, error: errorMessage };
  }
};