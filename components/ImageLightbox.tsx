/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ imageUrl, onClose }) => {
  // Handle closing on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged image view"
    >
      <div
        className="relative transform transition-transform animate-scale-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image itself
      >
        <img
          src={imageUrl}
          alt="Enlarged avatar"
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 h-8 w-8 bg-white/80 hover:bg-white text-stone-800 rounded-full flex items-center justify-center shadow-lg transition-colors"
          aria-label="Close image view"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default ImageLightbox;