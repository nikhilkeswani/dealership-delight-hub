import { useEffect } from 'react';

/**
 * Component that helps prevent browser caching issues by adding cache-busting headers
 * and forcing component remounts when needed
 */
const CacheBuster: React.FC = () => {
  useEffect(() => {
    // Add no-cache headers to prevent stale JavaScript bundles
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Cache-Control';
    meta.content = 'no-cache, no-store, must-revalidate';
    document.head.appendChild(meta);

    const pragmaMeta = document.createElement('meta');
    pragmaMeta.httpEquiv = 'Pragma';
    pragmaMeta.content = 'no-cache';
    document.head.appendChild(pragmaMeta);

    const expiresMeta = document.createElement('meta');
    expiresMeta.httpEquiv = 'Expires';
    expiresMeta.content = '0';
    document.head.appendChild(expiresMeta);

    // Add timestamp to prevent caching
    const timestamp = Date.now();
    const timestampMeta = document.createElement('meta');
    timestampMeta.name = 'timestamp';
    timestampMeta.content = timestamp.toString();
    document.head.appendChild(timestampMeta);

    return () => {
      // Cleanup meta tags on unmount
      document.head.removeChild(meta);
      document.head.removeChild(pragmaMeta);
      document.head.removeChild(expiresMeta);
      document.head.removeChild(timestampMeta);
    };
  }, []);

  return null;
};

export default CacheBuster;