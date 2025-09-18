import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  onLoad?: () => void;
  onError?: () => void;
  // Vehicle-specific props
  vehicleId?: string;
  imageType?: 'thumbnail' | 'medium' | 'large' | 'original';
}

/**
 * Optimized image component with lazy loading, responsive images, and blur placeholders
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  quality = 85,
  placeholder = 'blur',
  onLoad,
  onError,
  vehicleId,
  imageType = 'medium',
  ...imgProps
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  // Generate srcset for different sizes using actual optimized image paths
  const generateSrcSet = (baseSrc: string): string => {
    if (!vehicleId || !baseSrc.includes('/vehicles/')) return baseSrc;
    
    // Extract the base URL structure: .../vehicles/{vehicleId}/{currentSize}/{filename}
    const urlParts = baseSrc.split('/vehicles/');
    if (urlParts.length !== 2) return baseSrc;
    
    const [baseUrl, pathPart] = urlParts;
    const pathSegments = pathPart.split('/');
    
    if (pathSegments.length < 3) return baseSrc;
    
    const [vehicleIdFromUrl, currentSize, ...filenameParts] = pathSegments;
    const filename = filenameParts.join('/');
    
    // Generate URLs for different sizes
    const baseStorageUrl = `${baseUrl}/vehicles/${vehicleIdFromUrl}`;
    const srcSet = [
      `${baseStorageUrl}/thumbnail/${filename} 400w`,
      `${baseStorageUrl}/medium/${filename} 800w`,
      `${baseStorageUrl}/large/${filename} 1200w`,
    ];
    
    return srcSet.join(', ');
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Fallback to original image if optimized version fails
  const getFallbackSrc = (originalSrc: string): string => {
    if (!vehicleId || !originalSrc.includes('/vehicles/')) return originalSrc;
    
    // If we're already showing the original size, no fallback needed
    if (originalSrc.includes('/original/')) return originalSrc;
    
    // Convert to original size path
    return originalSrc.replace(/\/(thumbnail|medium|large)\//, '/original/');
  };

  // Don't render image until it's in view (unless priority)
  const shouldLoad = priority || isInView;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={shouldLoad ? src : undefined}
        srcSet={shouldLoad && vehicleId ? generateSrcSet(src) : undefined}
        sizes={shouldLoad && vehicleId ? sizes : undefined}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          hasError && 'hidden'
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...imgProps}
      />
      
      {/* Fallback image for when optimized version fails */}
      {hasError && vehicleId && (
        <img
          src={getFallbackSrc(src)}
          alt={alt}
          className="transition-opacity duration-300 opacity-100"
          onLoad={() => {
            setHasError(false);
            setIsLoaded(true);
          }}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...imgProps}
        />
      )}
      
      {/* Error fallback */}
      {hasError && !vehicleId && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-muted-foreground text-sm text-center">
            <div className="w-8 h-8 mx-auto mb-2 opacity-50">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
            Failed to load image
          </div>
        </div>
      )}
      
      {/* Loading skeleton */}
      {!isLoaded && !hasError && shouldLoad && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
};

export default OptimizedImage;