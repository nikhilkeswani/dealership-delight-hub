# Subdomain Implementation for Dealer Websites

## Overview
This guide explains how subdomain routing works for dealer websites (e.g., `mydealership.dealerdelight.com`).

## Current Implementation

### 1. **Development Environment (Current)**
- **Current URL**: `yourdomain.com/dealer/dealername`
- **Status**: ✅ Working now in Lovable
- **Use case**: Perfect for development and testing

### 2. **Production Subdomain (Future)**
- **Target URL**: `dealername.dealerdelight.com`
- **Status**: 🔄 Ready for implementation when hosting on custom domain
- **Use case**: Professional customer-facing URLs

## Technical Implementation

### Files Added/Modified:
1. **`src/utils/subdomain.ts`** - Subdomain detection utilities
2. **`src/App.tsx`** - Subdomain routing logic
3. **`src/components/configure/SubdomainPreview.tsx`** - URL preview component
4. **`src/components/configure/DomainConfig.tsx`** - Updated with subdomain preview

### Key Features:
- ✅ Automatic subdomain detection
- ✅ Fallback to path-based routing in development
- ✅ URL generation utilities
- ✅ Preview component showing both URLs

## DNS Configuration (When Moving to Production)

### For `dealerdelight.com` domain:

1. **Wildcard A Record**:
   ```
   Type: A
   Name: *
   Value: 185.158.133.1
   TTL: 300
   ```

2. **Root A Record**:
   ```
   Type: A
   Name: @
   Value: 185.158.133.1
   TTL: 300
   ```

### Server-Side Requirements (Production):
- **Reverse Proxy**: nginx/Apache to handle subdomain routing
- **SSL Wildcard Certificate**: For `*.dealerdelight.com`
- **Dynamic Routing**: Server logic to detect subdomain and serve appropriate content

## Usage Examples

### For Dealers:
```javascript
// Generate dealer subdomain URL
const dealerUrl = generateSubdomainUrl('johns-auto-sales');
// Returns: https://johns-auto-sales.dealerdelight.com (production)
// Returns: https://yourdomain.com/dealer/johns-auto-sales (development)
```

### Subdomain Detection:
```javascript
const subdomainInfo = getSubdomainInfo();
if (subdomainInfo.isSubdomain) {
  // User is on johns-auto-sales.dealerdelight.com
  const dealerSlug = subdomainInfo.dealerSlug; // "johns-auto-sales"
}
```

## Hosting Solutions

### Option 1: Vercel/Netlify + Custom Domain
- Set up wildcard domain
- Configure build to handle dynamic routing
- Environment variables for subdomain detection

### Option 2: Traditional Hosting + Reverse Proxy
- nginx/Apache configuration
- Wildcard SSL certificate
- Server-side subdomain routing

### Option 3: Keep Path-Based (Current)
- No server changes needed
- Works with any static hosting
- URLs: `dealerdelight.com/dealer/dealername`

## Benefits of Subdomain Approach

### For Dealers:
- ✅ **Professional URLs**: `johns-auto.dealerdelight.com` vs `/dealer/johns-auto`
- ✅ **Brand Recognition**: Easier to remember and share
- ✅ **SEO Benefits**: Each subdomain can be optimized independently
- ✅ **Marketing**: Cleaner URLs for business cards/advertising

### For Platform:
- ✅ **Scalability**: Unlimited dealer websites
- ✅ **Isolation**: Each dealer gets their own subdomain
- ✅ **Analytics**: Easier to track per-dealer performance
- ✅ **Custom Domains**: Dealers can later point their own domains

## Migration Path

1. **Phase 1 (Current)**: Path-based URLs working in development
2. **Phase 2**: Deploy to custom domain with subdomain support
3. **Phase 3**: Migrate existing dealers to subdomain URLs
4. **Phase 4**: Allow dealers to connect custom domains

## Testing

The subdomain preview component shows both URLs and indicates which is currently active. Dealers can:
- Copy current working URL
- See future subdomain URL
- Understand the migration path

This implementation is ready for production subdomain hosting while maintaining full functionality in the current environment.