"use client";

import { useEffect, useRef } from "react";
import { ADS_ENABLED, AD_SLOTS } from "@/lib/ads";

/**
 * Adsterra Ad container for Next.js.
 * Loads 300x250 or 728x90 banners based on the slot configuration.
 */
export default function AdSlot({ id }) {
  const slot = AD_SLOTS[id];
  const containerRef = useRef(null);
  const adLoaded = useRef(false);

  useEffect(() => {
    if (!slot || !ADS_ENABLED || !containerRef.current || adLoaded.current) return;
    
    const container = containerRef.current;
    
    if (slot.type === 'native' && slot.nativeId) {
      // Native Ad format
      container.innerHTML = `<div id="container-${slot.nativeId}"></div>`;
      
      const loaderScript = document.createElement("script");
      loaderScript.type = "text/javascript";
      loaderScript.async = true;
      loaderScript.setAttribute('data-cfasync', 'false');
      loaderScript.src = `https://${slot.nativeDomain}/${slot.nativeId}/invoke.js`;
      container.appendChild(loaderScript);
      
      adLoaded.current = true;
    } else if (slot.type === 'banner' && slot.adsterraId) {
      // Standard Banner format (atOptions)
      container.innerHTML = "";
      
      const confScript = document.createElement("script");
      confScript.type = "text/javascript";
      confScript.text = `
        atOptions = {
          'key' : '${slot.adsterraId}',
          'format' : 'iframe',
          'height' : ${slot.height},
          'width' : ${slot.width},
          'params' : {}
        };
      `;
      container.appendChild(confScript);

      const loaderScript = document.createElement("script");
      loaderScript.type = "text/javascript";
      loaderScript.src = `//www.highrevenueformat.com/${slot.adsterraId}/invoke.js`;
      container.appendChild(loaderScript);
      
      adLoaded.current = true;
    }
    
    // Cleanup on unmount (important for SPA navigation)
    return () => {
      adLoaded.current = false;
      if (containerRef.current) {
         containerRef.current.innerHTML = "";
      }
    };
  }, [slot, id]);

  if (!slot || !ADS_ENABLED) return null;

  return (
    <div className={`${slot.className} my-6 flex justify-center`} role="complementary" aria-label="Advertisement">
      <div 
        ref={containerRef} 
        className="overflow-hidden bg-slate-50 min-h-[50px] flex items-center justify-center"
        style={{ minWidth: slot.width, minHeight: slot.height }}
      >
        {/* Adsterra ad will be injected here */}
        {!slot.adsterraId && (
            <div className="border-2 border-dashed border-slate-200 rounded-xl w-full h-full flex flex-col items-center justify-center py-8 px-4 text-center">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Advertisement Placeholder</span>
              <span className="text-xs text-slate-400 mt-1">{slot.label}</span>
              <span className="text-xs text-slate-400">{slot.sizes.join(" · ")}</span>
            </div>
        )}
      </div>
    </div>
  );
}
