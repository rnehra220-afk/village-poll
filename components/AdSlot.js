import { ADS_ENABLED, AD_SLOTS } from "@/lib/ads";

/**
 * Placeholder ad container. Layouts are designed around real ad sizes so a
 * network tag can be dropped in later (see lib/ads.js + README).
 * Ads never cover voting controls or essential content.
 */
export default function AdSlot({ id }) {
  const slot = AD_SLOTS[id];
  if (!slot || !ADS_ENABLED) return null;
  return (
    <div className={`${slot.className} my-6`} role="complementary" aria-label="Advertisement">
      <div className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center py-8 px-4 text-center">
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Advertisement</span>
        <span className="text-xs text-slate-400 mt-1">{slot.label}</span>
        <span className="text-xs text-slate-400">{slot.sizes.join(" · ")}</span>
      </div>
    </div>
  );
}
