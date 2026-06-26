import DEFAULT_USER from '../../assets/dev_icon.png';
import { useState, useEffect, useRef } from 'react';
import {
  XIcon,
  PlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowClockwiseIcon,
  HouseIcon,
  GlobeIcon,
  ShieldCheckIcon,
  LockSimpleIcon,
} from '@phosphor-icons/react';

interface WebViewAppProp {
  url: string;
  onTitleChange?: (title: string) => void;
  onFaviconChange?: (favicon: string) => void;
  onNavigationStateChange?: (canGoBack: boolean, canGoForward: boolean) => void;
  onLoadingChange?: (loading: boolean) => void;
}

function WebViewApps({ url, onTitleChange, onFaviconChange, onNavigationStateChange, onLoadingChange }: WebViewAppProp) {
  const webviewRef = useRef<Electron.WebviewTag | null>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    const webview = webviewRef.current;
    if (webview) {
      const handleDidStartLoading = () => onLoadingChange?.(true);
      const handleDidStopLoading = () => onLoadingChange?.(false);

      const handleDidFinishLoad = async () => {
        if (isLoadingRef.current) return;
        isLoadingRef.current = true;

        try {
          const title = await webview.executeJavaScript('document.title');
          onTitleChange?.(title || 'New Tab');

          const faviconUrl = await webview.executeJavaScript(`
            (function() {
              const icon = document.querySelector('link[rel*="icon"]');
              return icon ? icon.href : '';
            })()
          `);
          onFaviconChange?.(faviconUrl || '');

          onNavigationStateChange?.(webview.canGoBack(), webview.canGoForward());
        } catch (error) {
          console.error('Error updating webview state:', error);
        } finally {
          isLoadingRef.current = false;
        }
      };

      const handleDidNavigate = () => {
        handleDidFinishLoad();
      };

      const handlePageTitleUpdated = (event: any) => {
        onTitleChange?.(event.title || 'New Tab');
      };

      const handlePageFaviconUpdated = (event: any) => {
        if (event.favicons && event.favicons.length > 0) {
          onFaviconChange?.(event.favicons[0]);
        }
      };

      webview.addEventListener('did-start-loading', handleDidStartLoading);
      webview.addEventListener('did-stop-loading', handleDidStopLoading);
      webview.addEventListener('did-finish-load', handleDidFinishLoad);
      webview.addEventListener('did-navigate', handleDidNavigate);
      webview.addEventListener('page-title-updated', handlePageTitleUpdated);
      webview.addEventListener('page-favicon-updated', handlePageFaviconUpdated);

      return () => {
        webview.removeEventListener('did-start-loading', handleDidStartLoading);
        webview.removeEventListener('did-stop-loading', handleDidStopLoading);
        webview.removeEventListener('did-finish-load', handleDidFinishLoad);
        webview.removeEventListener('did-navigate', handleDidNavigate);
        webview.removeEventListener('page-title-updated', handlePageTitleUpdated);
        webview.removeEventListener('page-favicon-updated', handlePageFaviconUpdated);
      };
    }
  }, [onTitleChange, onFaviconChange, onNavigationStateChange, onLoadingChange]);

  return (
    <webview
      ref={webviewRef}
      src={url}
      className={`size-full ${url.includes('vs') && 'bg-[#161616]'}`}
      webpreferences="contextIsolation=yes,nodeIntegration=no,sandbox=yes"
      allowpopups={true}
      partition="persist:webcontent"
      httpreferrer="same-origin"
    />
  );
}

interface Tab {
  id: string;
  url: string;
  title: string;
  favicon: string;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
}

export default function ChromeBrowser() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      url: 'https://www.google.com',
      title: 'New Tab',
      favicon: '',
      canGoBack: false,
      canGoForward: false,
      isLoading: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [addressBarValue, setAddressBarValue] = useState('https://www.google.com');
  const [isAddressFocused, setIsAddressFocused] = useState(false);
  const webviewRefs = useRef<{ [key: string]: Electron.WebviewTag }>({});
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsInitialized(true);
    return () => setIsInitialized(false);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    let isMoving = false;
    const moveWindowControls = () => {
      if (isMoving) return;
      isMoving = true;

      try {
        const controlsPlaceholder = controlsRef.current;
        const exportedControls = document.querySelector('.window-controls-export');

        if (!controlsPlaceholder || !exportedControls) return;

        if (controlsPlaceholder.children.length > 0) {
          const firstControl = controlsPlaceholder.children[0] as HTMLElement;
          if (firstControl.onclick) return;
        }

        controlsPlaceholder.innerHTML = '';

        const controls = Array.from(exportedControls.children);
        const fragment = document.createDocumentFragment();

        controls.forEach((control) => {
          const clonedControl = control.cloneNode(false) as HTMLElement;
          const originalButton = control as HTMLElement;

          ['class', 'title', 'aria-label'].forEach((attr) => {
            if (originalButton.hasAttribute(attr)) {
              clonedControl.setAttribute(attr, originalButton.getAttribute(attr)!);
            }
          });

          clonedControl.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            originalButton.click();
          };

          fragment.appendChild(clonedControl);
        });

        controlsPlaceholder.appendChild(fragment);
      } finally {
        isMoving = false;
      }
    };

    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedMove = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(moveWindowControls, 100);
    };

    moveWindowControls();
    const retryTimeout = setTimeout(moveWindowControls, 500);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.target.nodeName === 'BODY' ||
          (mutation.target as Element).classList?.contains('window-controls-export')
        ) {
          debouncedMove();
          break;
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
    });

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(retryTimeout);
      observer.disconnect();

      const controlsPlaceholder = controlsRef.current;
      if (controlsPlaceholder) {
        controlsPlaceholder.innerHTML = '';
      }
    };
  }, [isInitialized]);

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  const addNewTab = () => {
    const newId = Date.now().toString();
    const newTab: Tab = {
      id: newId,
      url: 'https://www.google.com',
      title: 'New Tab',
      favicon: '',
      canGoBack: false,
      canGoForward: false,
      isLoading: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setAddressBarValue('https://www.google.com');
  };

  const closeTab = (tabId: string) => {
    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    if (newTabs.length === 0) {
      addNewTab();
      return;
    }

    setTabs(newTabs);
    if (activeTabId === tabId) {
      const activeIndex = tabs.findIndex((tab) => tab.id === tabId);
      const newActiveIndex = activeIndex > 0 ? activeIndex - 1 : 0;
      const newActiveTab = newTabs[newActiveIndex];
      setActiveTabId(newActiveTab.id);
      setAddressBarValue(newActiveTab.url);
    }
  };

  const updateTab = (tabId: string, updates: Partial<Tab>) => {
    setTabs((prev) => prev.map((tab) => (tab.id === tabId ? { ...tab, ...updates } : tab)));
  };

  const navigateToUrl = (url: string) => {
    let finalUrl = url.trim();
    const looksLikeUrl = /^([\w-]+\.)+[a-z]{2,}(\/.*)?$/i.test(finalUrl) || finalUrl.startsWith('http');

    if (!looksLikeUrl) {
      finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}`;
    } else if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    updateTab(activeTabId, { url: finalUrl });
    setAddressBarValue(finalUrl);
  };

  const handleAddressBarSubmit = (e: React.KeyboardEvent | React.FormEvent) => {
    e.preventDefault();
    navigateToUrl(addressBarValue);
    (e.target as HTMLElement).blur?.();
  };

  const goBack = () => {
    const webview = webviewRefs.current[activeTabId];
    if (webview && webview.canGoBack()) {
      webview.goBack();
    }
  };

  const goForward = () => {
    const webview = webviewRefs.current[activeTabId];
    if (webview && webview.canGoForward()) {
      webview.goForward();
    }
  };

  const reload = () => {
    const webview = webviewRefs.current[activeTabId];
    if (webview) {
      webview.reload();
    }
  };

  const goHome = () => {
    navigateToUrl('https://www.google.com');
  };

  const switchTab = (tabId: string) => {
    setActiveTabId(tabId);
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) {
      setAddressBarValue(tab.url);
    }
  };

  const isSecure = activeTab?.url.startsWith('https://');

  if (!isInitialized) {
    return null;
  }

  return (
    <div className="flex flex-col size-full bg-white">
      {/* Tab Bar */}
      <div className="flex items-center bg-gray-100 px-2">
        <div className="flex flex-1 pt-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                className={`group relative flex items-center min-w-0 max-w-64 px-3.5 py-2 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-white rounded-t-xl'
                    : 'rounded-xl hover:bg-gray-200/70 mx-0.5 mb-2'
                }`}
                onClick={() => switchTab(tab.id)}
              >
                <div className="flex items-center min-w-0 flex-1 gap-2">
                  {tab.isLoading ? (
                    <div className="size-3.5 flex-shrink-0 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" />
                  ) : tab.favicon ? (
                    <img
                      src={tab.favicon}
                      alt=""
                      className="w-3.5 h-3.5 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <GlobeIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className="text-[13px] text-gray-700 truncate">{tab.title || 'New Tab'}</span>
                </div>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className={`ml-1.5 flex-shrink-0 rounded-full p-0.5 hover:bg-gray-200 transition-opacity ${
                      isActive ? 'opacity-60 hover:opacity-100' : 'opacity-0 group-hover:opacity-60 hover:opacity-100'
                    }`}
                  >
                    <XIcon className="w-3.5 h-3.5 text-gray-700" />
                  </button>
                )}
              </div>
            );
          })}
          <button
            onClick={addNewTab}
            className="p-2 mx-1 mb-2 hover:bg-gray-200/70 transition-colors rounded-full flex-shrink-0"
            title="New Tab"
          >
            <PlusIcon className="w-4 h-4 text-gray-700" />
          </button>
        </div>
        <div ref={controlsRef} className="flex items-center gap-1.5 ms-auto mb-2"></div>
      </div>

      {/* Navigation Bar */}
      <div className="relative flex items-center px-3 py-2 bg-white border-b border-gray-200 gap-1">
        <button
          onClick={goBack}
          disabled={!activeTab?.canGoBack}
          className={`p-2 rounded-full transition-colors ${
            activeTab?.canGoBack ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Back"
        >
          <ArrowLeftIcon className="w-[18px] h-[18px]" />
        </button>
        <button
          onClick={goForward}
          disabled={!activeTab?.canGoForward}
          className={`p-2 rounded-full transition-colors ${
            activeTab?.canGoForward ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Forward"
        >
          <ArrowRightIcon className="w-[18px] h-[18px]" />
        </button>
        <button
          onClick={reload}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
          title="Reload"
        >
          <ArrowClockwiseIcon className={`w-[18px] h-[18px] ${activeTab?.isLoading ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={goHome}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors mr-2"
          title="Home"
        >
          <HouseIcon className="w-[18px] h-[18px]" />
        </button>

        {/* Address Bar */}
        <div
          className={`flex-1 flex gap-2.5 items-center w-full text-gray-500 px-3 py-2 rounded-full border transition-all ${
            isAddressFocused
              ? 'border-blue-400 ring-2 ring-blue-100 bg-white'
              : 'border-transparent bg-gray-100 hover:bg-gray-200/70'
          }`}
        >
          {isSecure ? (
            <LockSimpleIcon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" weight="fill" />
          ) : (
            <ShieldCheckIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          )}
          <input
            type="text"
            value={addressBarValue}
            onChange={(e) => setAddressBarValue(e.target.value)}
            onFocus={(e) => {
              setIsAddressFocused(true);
              e.target.select();
            }}
            onBlur={() => setIsAddressFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddressBarSubmit(e);
              }
            }}
            className="outline-none w-full text-sm bg-transparent text-gray-800"
            placeholder="Search Google or type a URL"
          />
        </div>

        <img
          src={DEFAULT_USER}
          width={30}
          height={30}
          className="size-8 rounded-full border border-gray-200 ms-3 flex-shrink-0"
          alt="User Profile Image"
        />
      </div>

      {/* Loading progress bar */}
      {activeTab?.isLoading && (
        <div className="h-0.5 bg-blue-100 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1/3 bg-blue-500 animate-[loading-bar_1.2s_ease-in-out_infinite]" />
        </div>
      )}

      {/* Web Content */}
      <div className="flex-1 relative bg-white">
        {tabs.map((tab) => (
          <div key={tab.id} className={`absolute inset-0 ${tab.id === activeTabId ? 'block' : 'hidden'}`}>
            <WebViewApps
              url={tab.url}
              onTitleChange={(title) => updateTab(tab.id, { title })}
              onFaviconChange={(favicon) => updateTab(tab.id, { favicon })}
              onNavigationStateChange={(canGoBack, canGoForward) => updateTab(tab.id, { canGoBack, canGoForward })}
              onLoadingChange={(isLoading) => updateTab(tab.id, { isLoading })}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { left: -33%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}