'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { uploadPaymentProof, validatePaymentProofFile } from '@/services/payment-proof-service';

export default function PaymentProofUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate the file
      const validation = validatePaymentProofFile(selectedFile);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploadStatus('uploading');
    setError(null);

    try {
      const result = await uploadPaymentProof(file);
      
      if (result.success) {
        setUploadStatus('success');
        setUploadedUrl(result.url || null);
      } else {
        setUploadStatus('error');
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setUploadStatus('error');
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadedUrl(null);
    setError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTryAgain = () => {
    handleRemoveFile();
    setUploadStatus('idle');
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Upload Payment Proof</CardTitle>
            <CardDescription>Upload a screenshot of your payment confirmation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!file ? (
              <div className="border-2 border-dashed border-gray-500 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2 font-medium">Upload Payment Proof</p>
                <p className="text-sm text-gray-500 mt-1">JPEG, PNG, or PDF (Max 5MB)</p>
                
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="mt-4"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Selected File</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
                
                {previewUrl && (
                  <div className="border rounded-lg p-2 inline-block">
                    {file.type.startsWith('image/') ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-h-60 rounded"
                      />
                    ) : (
                      <div className="bg-gray-800 p-4 rounded text-center">
                        <div className="mx-auto bg-gray-700 w-16 h-16 rounded flex items-center justify-center">
                          <span className="text-lg">PDF</span>
                        </div>
                        <p className="mt-2 text-sm">{file.name}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-sm">
                  <p><span className="font-medium">Name:</span> {file.name}</p>
                  <p><span className="font-medium">Size:</span> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <p><span className="font-medium">Type:</span> {file.type}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {uploadStatus === 'success' && uploadedUrl && (
              <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
                <p className="text-green-400 font-medium">Upload successful!</p>
                <p className="text-sm mt-1 break-words">URL: <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{uploadedUrl}</a></p>
              </div>
            )}

            {uploadStatus === 'uploading' && (
              <div className="p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                <p className="text-blue-400">Uploading payment proof...</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {file && uploadStatus !== 'success' && (
              <Button 
                className="w-full bg-[#630000] hover:bg-[#7a0000]"
                onClick={handleUpload}
                disabled={uploadStatus === 'uploading'}
              >
                {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Payment Proof'}
              </Button>
            )}
            
            {uploadStatus === 'success' && (
              <div className="w-full flex gap-2">
                <Button 
                  className="flex-1 bg-[#630000] hover:bg-[#7a0000]"
                  onClick={handleTryAgain}
                >
                  Upload Another
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}