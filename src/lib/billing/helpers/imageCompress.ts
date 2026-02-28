/**
 * Compress image file to reduce size
 * Simplified version for Next.js
 */
export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate new dimensions (max 800px width/height)
        let width = img.width;
        let height = img.height;
        const maxSize = 800;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression
        // Use original MIME type if possible, fallback to image/png to preserve transparency
        const mimeType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
        const maxBytes = 1024 * 1024; // 1MB

        // Iteratively reduce quality until output fits within maxBytes
        let quality = 0.85;
        let dataUrl = canvas.toDataURL(mimeType, quality);

        while (dataUrl.length > maxBytes && quality > 0.1) {
          quality = Math.round((quality - 0.1) * 10) / 10;
          if (mimeType === 'image/png') break; // PNG compression is lossless, quality parameter is ignored
          dataUrl = canvas.toDataURL(mimeType, quality);
        }

        // Last resort: scale down dimensions
        let currentLoop = 0;
        while (dataUrl.length > maxBytes && currentLoop < 3) {
          canvas.width = Math.round(canvas.width * 0.7);
          canvas.height = Math.round(canvas.height * 0.7);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          dataUrl = canvas.toDataURL(mimeType, 0.7); // Use a fixed quality for scaled images
          currentLoop++;
        }

        resolve(dataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}
