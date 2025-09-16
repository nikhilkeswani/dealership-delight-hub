import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DealerSiteConfig } from '@/types/theme';

interface ThemeDebugPanelProps {
  config: DealerSiteConfig;
  storageKey: string;
  onClearData: () => void;
}

export function ThemeDebugPanel({ config, storageKey, onClearData }: ThemeDebugPanelProps) {
  const [showDebug, setShowDebug] = React.useState(false);
  
  // Hide debug panel in production
  if (import.meta.env.PROD) {
    return null;
  }
  
  const getStorageData = () => {
    try {
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };

  if (!showDebug) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowDebug(true)}
        className="mb-4"
      >
        🐛 Debug Theme
      </Button>
    );
  }

  const storageData = getStorageData();

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Theme Debug Panel</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowDebug(false)}
          >
            ✕
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div>
          <strong>Storage Key:</strong> <Badge variant="secondary">{storageKey}</Badge>
        </div>
        
        <div>
          <strong>Current Config Colors:</strong>
          <div className="flex gap-2 mt-1">
            <div className="flex items-center gap-1">
              <div 
                className="w-4 h-4 rounded border" 
                style={{ backgroundColor: config.colors.primary }}
              />
              <span>{config.colors.primary}</span>
            </div>
            <div className="flex items-center gap-1">
              <div 
                className="w-4 h-4 rounded border" 
                style={{ backgroundColor: config.colors.accent }}
              />
              <span>{config.colors.accent}</span>
            </div>
          </div>
        </div>

        <div>
          <strong>Storage Data:</strong>
          <pre className="mt-1 p-2 bg-white rounded border text-xs overflow-auto max-h-20">
            {JSON.stringify(storageData, null, 2)}
          </pre>
        </div>

        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onClearData}
          className="w-full"
        >
          Clear Theme Data (Emergency Reset)
        </Button>
      </CardContent>
    </Card>
  );
}