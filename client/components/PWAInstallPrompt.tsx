import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor, Share, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  className?: string;
}

export default function PWAInstallPrompt({ className }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop');
  const [isIOS, setIsIOS] = useState(false);
  const [showManualInstructions, setShowManualInstructions] = useState(false);

  useEffect(() => {
    // Detect device type and platform
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isIOSDevice = /ipad|iphone|ipod/.test(userAgent);
    
    setDeviceType(isMobile ? 'mobile' : 'desktop');
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
    setIsInstalled(isStandalone || isFullscreen);

    // Listen for beforeinstallprompt event (Chrome, Edge, Samsung Internet)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For browsers that don't support beforeinstallprompt (iOS Safari, Firefox)
    const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed');
    if (!isInstalled && !hasBeenDismissed && !deferredPrompt) {
      // Show manual instructions after a delay for iOS or unsupported browsers
      const timer = setTimeout(() => {
        if (!isInstalled) {
          setIsVisible(true);
        }
      }, 5000);

      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt, isInstalled]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Chrome/Edge installation
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          setIsVisible(false);
          setDeferredPrompt(null);
        }
      } catch (error) {
        console.error('Error during PWA installation:', error);
      }
    } else {
      // Show manual instructions for other browsers
      setShowManualInstructions(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    
    // Clear dismissal after 24 hours
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed');
    }, 24 * 60 * 60 * 1000);
  };

  const renderManualInstructions = () => {
    if (isIOS) {
      return (
        <div className="space-y-4">
          <div className="text-center">
            <Smartphone className="h-12 w-12 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold">Install on iOS</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span>Tap the</span>
                  <Share className="h-4 w-4" />
                  <span>share button in Safari</span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span>Scroll down and tap</span>
                  <Plus className="h-4 w-4" />
                  <span>"Add to Home Screen"</span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
              <div>Tap "Add" to install the app</div>
            </div>
          </div>
        </div>
      );
    }

    if (deviceType === 'mobile') {
      return (
        <div className="space-y-4">
          <div className="text-center">
            <Smartphone className="h-12 w-12 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold">Install on Android</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
              <div>Open your browser menu (⋮)</div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
              <div>Look for "Add to Home screen" or "Install app"</div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
              <div>Tap "Add" or "Install" to confirm</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="text-center">
          <Monitor className="h-12 w-12 mx-auto mb-2 text-blue-600" />
          <h3 className="font-semibold">Install on Desktop</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
            <div>Look for the install icon in your browser's address bar</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
            <div>Or go to browser menu → "Install App" or "Add to Apps"</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
            <div>Click "Install" to add to your applications</div>
          </div>
        </div>
      </div>
    );
  };

  // Don't show if already installed
  if (isInstalled || !isVisible) {
    return null;
  }

  if (showManualInstructions) {
    return (
      <Card className={cn("fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 shadow-lg border-2", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Install App</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowManualInstructions(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {renderManualInstructions()}
          <div className="mt-4 flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowManualInstructions(false)}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button 
              size="sm" 
              onClick={handleDismiss}
              className="flex-1"
            >
              Got It
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 shadow-lg border-2 bg-gradient-to-r from-blue-50 to-indigo-50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Install App</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Get the best experience by installing our app on your {deviceType === 'mobile' ? 'phone' : 'computer'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            ✓ Works offline<br />
            ✓ Faster loading<br />
            ✓ Native app experience
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDismiss}
              className="flex-1"
            >
              Not Now
            </Button>
            <Button 
              onClick={handleInstall}
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Install
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
