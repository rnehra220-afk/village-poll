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
    
    // Check if we have an Adsterra ID for this slot
    if (!slot.adsterraId) return;

    // We must append the script elements manually to ensure they run inside the specific div
    const container = containerRef.current;
    
    // Clear any existing content
    container.innerHTML = "";
    
    // 1. Create the options script
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

    // 2. Create the loader script
    const loaderScript = document.createElement("script");
    loaderScript.type = "text/javascript";
    loaderScript.src = `//www.highrevenueformat.com/${slot.adsterraId}/invoke.js`;
    container.appendChild(loaderScript);
    
    adLoaded.current = true;
    
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
