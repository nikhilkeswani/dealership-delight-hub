import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Globe, Copy } from 'lucide-react';
import { useDealer } from '@/hooks/useDealer';
import { generateSubdomainUrl, supportsSubdomains } from '@/utils/subdomain';
import { toast } from 'sonner';

const SubdomainPreview: React.FC = () => {
  const { data: dealer } = useDealer();
  
  if (!dealer) return null;

  const dealerSlug = dealer.business_name
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || "your-dealership";

  const subdomainUrl = generateSubdomainUrl(dealerSlug);
  const pathBasedUrl = `${window.location.origin}/dealer/${dealerSlug}`;
  const isSubdomainSupported = supportsSubdomains();

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Your Dealer Website URLs
        </CardTitle>
        <CardDescription>
          Your dealership website is accessible through multiple URLs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Path-Based URL */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Current</Badge>
            <span className="text-sm font-medium">Path-Based URL</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <code className="flex-1 text-sm">{pathBasedUrl}</code>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(pathBasedUrl)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openUrl(pathBasedUrl)}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Future Subdomain URL */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={isSubdomainSupported ? "default" : "outline"}>
              {isSubdomainSupported ? "Live" : "Future"}
            </Badge>
            <span className="text-sm font-medium">Subdomain URL</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <code className="flex-1 text-sm">{dealerSlug}.dealerdelight.com</code>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(`https://${dealerSlug}.dealerdelight.com`)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            {isSubdomainSupported && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openUrl(`https://${dealerSlug}.dealerdelight.com`)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
          {!isSubdomainSupported && (
            <p className="text-xs text-muted-foreground">
              Subdomain will be available when hosting on a custom domain
            </p>
          )}
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Both URLs show the same content. The subdomain provides a cleaner, 
            more professional appearance for your customers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubdomainPreview;