import { uploadImageToCloudinary, validateImageFile } from '@/lib/cloudinary';
import { useRef, useState } from 'react';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImageUrl?: string;
  disabled?: boolean;
  label?: string;
}

export function ImageUpload({ 
  onImageUploaded, 
  currentImageUrl, 
  disabled = false,
  label = "Article Image" 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setError(null);

    try {
      setUploading(true);
      const imageUrl = await uploadImageToCloudinary(file);
      onImageUploaded(imageUrl);
      
      // Clean up the preview URL and use the actual uploaded URL
      URL.revokeObjectURL(previewUrl);
      setPreview(imageUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      // Revert to previous preview
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setError(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="space-y-4">
        {/* Upload Area */}
        <div
          onClick={handleClick}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${disabled ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300 hover:border-gray-400'}
            ${uploading ? 'border-blue-300 bg-blue-50' : ''}
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-sm text-blue-600">Uploading image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="material-icons text-4xl text-gray-400 mb-2">cloud_upload</span>
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF, WebP up to 5MB
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <span className="material-icons text-red-500 mr-2">error</span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Preview */}
        {preview && !uploading && (
          <div className="relative">
            <div className="relative overflow-hidden rounded-lg border border-gray-200">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover"
                onLoad={() => {
                  // Clean up object URL if it was a preview
                  if (preview.startsWith('blob:')) {
                    URL.revokeObjectURL(preview);
                  }
                }}
              />
              
              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                disabled={disabled}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
                title="Remove image"
              >
                <span className="material-icons text-sm">close</span>
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              Image uploaded successfully
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 