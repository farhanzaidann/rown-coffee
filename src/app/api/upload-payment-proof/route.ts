// app/api/upload-payment-proof/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    
    // Extract the file from form data
    const file = formData.get('file');
    
    if (!file || typeof file === 'string') {
      return new Response(
        JSON.stringify({ error: 'File not found in form data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Define type for the file object
    interface FileObject {
      name?: string;
      type?: string;
      arrayBuffer?: () => Promise<ArrayBuffer>;
    }
    
    // For Next.js App Router, file might be a File-like object
    // Create a unique filename
    const fileObj = file as FileObject;
    const fileName = `${Date.now()}-${fileObj.name || 'payment-proof'}`;
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // This should be a service role key for file uploads
    );

    // Convert to ArrayBuffer if necessary and then to Buffer
    let fileBuffer: ArrayBuffer;
    
    if (file instanceof Uint8Array) {
      // If file is already a buffer-like object
      fileBuffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer;
    } else if (file instanceof ArrayBuffer) {
      fileBuffer = file;
    } else if (file instanceof SharedArrayBuffer) {
      // Convert SharedArrayBuffer to ArrayBuffer
      fileBuffer = new ArrayBuffer(file.byteLength);
      const sharedArray = new Uint8Array(file);
      const bufferArray = new Uint8Array(fileBuffer);
      bufferArray.set(sharedArray);
    } else if (fileObj.arrayBuffer) {
      // If it's a File-like object with arrayBuffer method
      fileBuffer = await fileObj.arrayBuffer();
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid file format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from('payment-proof') // Your bucket name
      .upload(fileName, fileBuffer, {
        contentType: fileObj.type || 'application/octet-stream',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error.message);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Error in upload-payment-proof API route:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}