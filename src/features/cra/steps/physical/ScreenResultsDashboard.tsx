import { useMemo, useState } from "react";
import { MapPin, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import {
  HAZARD_RATING_COLORS, RATING_ORDER, RISK_APPETITE, buildMatrixConfig,
} from "../../domain/physicalRisk/constants";
import type { HazardRating, EnrichedResult } from "../../domain/physicalRisk/types";
import AssetMapView from "../../components/AssetMapView";

const ORDERED_RATINGS: HazardRating[] = ["Extreme","Very High","High","Medium","Low","Negligible"];

const fmt = (v: number, sym: string) =>
  v >= 1e9 ? `${sym}${(v / 1e9).toFixed(2)}B`
  : v >= 1e6 ? `${sym}${(v / 1e6).toFixed(2)}M`
  : v >= 1e3 ? `${sym}${(v / 1e3).toFixed(1)}K`
  : `${sym}${v.toFixed(0)}`;

function RatingPill({ rating }: { rating: HazardRating }) {
  const color = HAZARD_RATING_COLORS[rating] ?? "#888";
  return (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 whitespace-nowrap" style={{ fontFamily:"var(--font-mono)", backgroundColor:`${color}20`, color }}>
      {rating}
    </span>
  );
}

export default function ScreenResultsDashboard() {
  const { config, mappedAssets, results } = usePhysicalRiskStore();
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null);

  const sym = config.currency === "USD" ? "$" : config.currency === "NGN" ? "?" : config.currency;
  const rate = config.usdRate || 1;

  const totalPortfolioValue = useMemo(() => mappedAssets.reduce((s, a) => s + a.value, 0), [mappedAssets]);
  const totalEal = useMemo(() => results.reduce((s, r) => s + r.ealLocal, 0), [results]);
  const maxSsl = useMemo(() => Math.max(...results.map((r) => r.sslLocal), 0), [results]);
  const extremeCount = useMemo(() => results.filter((r) => r.hazardRating === "Extreme").length, [results]);

  const ratingDist = useMemo(() => {
    const dist: Record<string, number> = {};
    ORDERED_RATINGS.forEach((r) => (dist[r] = 0));
    results.forEach((r) => { dist[r.hazardRating] = (dist[r.hazardRating] || 0) + 1; });
    return dist;
  }, [results]);
  const maxBar = Math.max(...Object.values(ratingDist), 1);

  const matrix = useMemo(() => buildMatrixConfig(config.matrixSize), [config.matrixSize]);
  const matrixCells = useMemo(() => {
    const cells: Record<string, EnrichedResult[]> = {};
    results.forEach((r) => {
      const key = `${r.intensityScore}-${r.frequencyScore}`;
      if (!cells[key]) cells[key] = [];
      cells[key].push(r);
    });
    return cells;
  }, [results]);

  const uniqueAssets = useMemo(() => [...new Set(results.map((r) => r.asset))], [results]);
  const uniqueRisks = useMemo(() => [...new Set(results.map((r) => r.risk))], [results]);
  const heatMap = useMemo(() => {
    const map: Record<string, EnrichedResult> = {};
    results.forEach((r) => { map[`${r.asset}||${r.risk}`] = r; });
    return map;
  }, [results]);

  const assetAgg = useMemo(() => {
    const agg: Record<string,{ ealLocal:number; ealUsd:number; sslLocal:number; maxRating:HazardRating; riskCount:number; value:number }> = {};
    results.forEach((r) => {
      if (!agg[r.asset]) {
        const a = mappedAssets.find((a) => a.name === r.asset);
        agg[r.asset] = { ealLocal:0, ealUsd:0, sslLocal:0, maxRating:"Negligible", riskCount:0, value: a?.value ?? 0 };
      }
      agg[r.asset].ealLocal += r.ealLocal;
      agg[r.asset].ealUsd += r.ealUsd;
      agg[r.asset].sslLocal = Math.max(agg[r.asset].sslLocal, r.sslLocal);
      agg[r.asset].riskCount++;
      if (RATING_ORDER[r.hazardRating] > RATING_ORDER[agg[r.asset].maxRating]) agg[r.asset].maxRating = r.hazardRating;
    });
    return Object.entries(agg).sort((a, b) => b[1].ealLocal - a[1].ealLocal);
  }, [results, mappedAssets]);

  const top15 = useMemo(() => [...results].sort((a, b) => b.ealLocal - a.ealLocal).slice(0, 15), [results]);
  const assetTypeAgg = useMemo(() => {
    const agg: Record<string,{ count:number; ealTotal:number }> = {};
    results.forEach((r) => {
      if (!agg[r.assetType]) agg[r.assetType] = { count:0, ealTotal:0 };
      agg[r.assetType].count++; agg[r.assetType].ealTotal += r.ealLocal;
    });
    return Object.entries(agg).sort((a, b) => b[1].ealTotal - a[1].ealTotal).slice(0, 10);
  }, [results]);

  if (results.length === 0) {
    return (
      <div className="flex items-start gap-3 m-6 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 text-amber-700 dark:text-amber-400 text-[13px]">
        <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
        No results yet. Run the assessment pipeline first.
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-[#F4F4F2] dark:bg-[#0D0D0D] min-h-[calc(100vh-140px)]">
      {/* Sidebar */}
      <div className="hidden lg:flex flex-col w-[250px] flex-shrink-0 border-r border-[#D8D8D8] dark:border-white/[0.07] bg-white dark:bg-[#111] px-5 py-8">
        <div className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#86BC25] mb-4" style={{ fontFamily:"var(--font-mono)" }}>Step 05</div>
        <h2 className="text-[15px] font-semibold text-[#111] dark:text-[#F0F0F0] mb-2 leading-tight tracking-tight">Results</h2>
        <p className="text-[17px] text-[#888] dark:text-[#666] leading-relaxed mb-8">Portfolio KPIs, heat map, per-asset drill-downs, and risk distribution.</p>
        <div className="space-y-3 mb-8">
          {[{ num:"01", label:"KPIs" },{ num:"02", label:"Heat map" },{ num:"03", label:"Drill-down" }].map((item) => (
            <div key={item.num} className="flex items-center gap-2.5">
              <span className="text-[17px] font-medium text-[#CCC] dark:text-[#444]" style={{ fontFamily:"var(--font-mono)" }}>{item.num}</span>
              <span className="text-[17px] text-[#888] dark:text-[#666]">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto pt-6 border-t border-[#E5E5E5] dark:border-white/[0.06] space-y-4">
          {[
            { label:"Portfolio Value", value:fmt(totalPortfolioValue, sym) },
            { label:"Total EAL", value:fmt(totalEal, sym), green:true },
            { label:"Max SSL", value:fmt(maxSsl, sym) },
            { label:"Extreme", value:extremeCount, red:true },
          ].map((k) => (
            <div key={k.label}>
              <div className="text-[17px] font-medium uppercase tracking-[0.1em] text-[#888] dark:text-[#555] mb-1" style={{ fontFamily:"var(--font-mono)" }}>{k.label}</div>
              <div className={`text-[15px] font-semibold leading-none ${"green" in k && k.green ? "text-[#86BC25]" : "red" in k && k.red ? "text-red-500" : "text-[#111] dark:text-[#F0F0F0]"}`}>{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 px-6 md:px-10 xl:pr-16 py-8 space-y-8 overflow-y-auto">
        <div>
          <p className="text-[17px] font-medium uppercase tracking-[0.1em] text-[#888] dark:text-[#555] mb-2" style={{ fontFamily:"var(--font-mono)" }}>Portfolio assessment</p>
          <h1 className="text-[28px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight">Results Dashboard</h1>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label:"Total Portfolio Value", v:fmt(totalPortfolioValue, sym), sub:`$${fmt(totalPortfolioValue/rate,"")}`, c:"#3B82F6" },
            { label:"Expected Annual Loss", v:fmt(totalEal, sym), sub:`$${fmt(totalEal/rate,"")}`, c:"#EF4444" },
            { label:"Max Single Significant Loss", v:fmt(maxSsl, sym), sub:`$${fmt(maxSsl/rate,"")}`, c:"#F59E0B" },
            { label:"Extreme Ratings", v:extremeCount, sub:`${results.filter((r)=>RATING_ORDER[r.hazardRating]>=5).length} Extreme/VH`, c:"#DC143C" },
          ].map((k) => (
            <div key={k.label} className="p-4 border border-[#D8D8D8] dark:border-white/[0.07] bg-white dark:bg-[#111]" style={{ borderTop:`2px solid ${k.c}` }}>
              <div className="text-[11px] text-[#888] dark:text-[#555] uppercase tracking-[0.06em] mb-1 leading-tight" style={{ fontFamily:"var(--font-mono)" }}>{k.label}</div>
              <div className="text-[22px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-none mb-0.5">{k.v}</div>
              <div className="text-[11px] text-[#888]">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Map */}
        {mappedAssets.some((a) => a.latitude !== 0 || a.longitude !== 0) && (
          <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/[0.07] p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={14} color="#3B82F6" />
              <span className="text-[13px] font-semibold text-[#333] dark:text-[#CCC]">Portfolio Asset Locations</span>
              <span className="text-[11px] text-[#86BC25] ml-auto" style={{ fontFamily:"var(--font-mono)" }}>
                {mappedAssets.filter((a) => a.latitude !== 0 || a.longitude !== 0).length} mapped
              </span>
            </div>
            <AssetMapView
              pins={mappedAssets.filter((a) => a.latitude !== 0 || a.longitude !== 0).map((a) => {
                const worstRating = assetAgg.find(([name]) => name === a.name)?.[1]?.maxRating ?? "Negligible";
                return { lat:a.latitude, lon:a.longitude, label:a.name, detail:`${a.assetType} — ${worstRating} — EAL: ${fmt(assetAgg.find(([n]) => n === a.name)?.[1]?.ealLocal ?? 0, sym)}` };
              })}
              height={380}
            />
          </div>
        )}

        {/* Asset × Hazard Heat Map */}
        <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/[0.07]">
          <div className="px-5 py-4 border-b border-[#E5E5E5] dark:border-white/[0.06]">
            <span className="text-[13px] font-semibold text-[#333] dark:text-[#CCC]">Asset × Hazard Heat Map</span>
          </div>
          <div className="overflow-auto max-h-[480px]">
            <table className="border-collapse" style={{ width:"max-content" }}>
              <thead className="sticky top-0 z-[2]">
                <tr>
                  <th className="bg-white dark:bg-[#111] border-b border-r border-[#D8D8D8] dark:border-white/[0.07] px-3 py-2 sticky left-0 z-[3] text-left min-w-[140px]">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#888]" style={{ fontFamily:"var(--font-mono)" }}>Asset</span>
                  </th>
                  {uniqueRisks.map((risk) => (
                    <th key={risk} title={risk} className="bg-white dark:bg-[#111] border-b border-r border-[#D8D8D8] dark:border-white/[0.07] p-0 min-w-[26px]">
                      <div className="flex items-end justify-center py-2 px-0.5" style={{ height:72 }}>
                        <span className="text-[9px] font-medium text-[#666] dark:text-[#999]" style={{ writingMode:"vertical-rl", transform:"rotate(180deg)", whiteSpace:"nowrap" }}>{risk}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {uniqueAssets.slice(0, 60).map((assetName, rowIdx) => (
                  <tr key={assetName} className={rowIdx%2===0?"bg-white dark:bg-[#111]":"bg-[#F9F9F8] dark:bg-[#141414]"}>
                    <td className={`sticky left-0 z-[1] border-r border-b border-[#D8D8D8] dark:border-white/[0.07] px-3 py-1 text-[12px] font-semibold text-[#333] dark:text-[#CCC] truncate max-w-[138px] ${rowIdx%2===0?"bg-white dark:bg-[#111]":"bg-[#F9F9F8] dark:bg-[#141414]"}`}>
                      {assetName}
                    </td>
                    {uniqueRisks.map((risk) => {
                      const r = heatMap[`${assetName}||${risk}`];
                      if (!r) return <td key={risk} className="border-r border-b border-[#E5E5E5] dark:border-white/[0.05] w-[26px] h-[26px]" />;
                      const color = HAZARD_RATING_COLORS[r.hazardRating] ?? "#888";
                      return (
                        <td key={risk} title={`${assetName} — ${risk}: ${r.hazardRating}`}
                          className="border-r border-b border-[#E5E5E5] dark:border-white/[0.05] w-[26px] h-[26px] cursor-pointer"
                          style={{ backgroundColor:`${color}88` }}
                        />
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {uniqueAssets.length > 60 && <div className="px-4 py-2 text-center text-[13px] text-[#888] border-t border-[#E5E5E5]">Showing 60 of {uniqueAssets.length} assets</div>}
          </div>
          {/* Legend */}
          <div className="px-5 py-3 border-t border-[#E5E5E5] dark:border-white/[0.06] flex flex-wrap gap-2">
            {ORDERED_RATINGS.map((r) => {
              const color = HAZARD_RATING_COLORS[r];
              return <span key={r} className="text-[10px] font-semibold px-2 py-0.5" style={{ fontFamily:"var(--font-mono)", backgroundColor:`${color}22`, color }}>{r}</span>;
            })}
          </div>
        </div>

        {/* Rating distribution + Risk matrix side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/[0.07] p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#888] mb-4" style={{ fontFamily:"var(--font-mono)" }}>Rating Distribution</div>
            <div className="space-y-2">
              {ORDERED_RATINGS.map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-[12px] font-semibold w-20 text-right shrink-0 text-[#555] dark:text-[#999]">{rating}</span>
                  <div className="flex-1 h-6 bg-[#F4F4F2] dark:bg-white/[0.04]">
                    <div className="h-6 transition-all duration-500" style={{ width:`${Math.max((ratingDist[rating]/maxBar)*100,1)}%`, backgroundColor:HAZARD_RATING_COLORS[rating] }} />
                  </div>
                  <span className="text-[12px] font-semibold w-6 shrink-0 text-[#333] dark:text-[#CCC]" style={{ fontFamily:"var(--font-mono)" }}>{ratingDist[rating]}</span>
                  <span className="text-[10px] text-[#888] w-16 shrink-0">{RISK_APPETITE[rating]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/[0.07] p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#888] mb-4" style={{ fontFamily:"var(--font-mono)" }}>Risk Matrix ({config.matrixSize}×{config.matrixSize})</div>
            <div className="overflow-auto">
              <table className="border-collapse text-[10px]">
                <thead>
                  <tr>
                    <th className="bg-[#F4F4F2] dark:bg-[#141414] border border-[#D8D8D8] dark:border-white/[0.07] px-2 py-1 text-left text-[10px] font-semibold text-[#666]">I?/F?</th>
                    {Array.from({length:config.matrixSize},(_,j)=>j+1).map((f)=>(
                      <th key={f} className="bg-[#F4F4F2] dark:bg-[#141414] border border-[#D8D8D8] dark:border-white/[0.07] px-2 py-1 text-center font-semibold text-[#666] whitespace-nowrap">
                        {matrix.frequencyLabels[f] || `F${f}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({length:config.matrixSize},(_,i)=>config.matrixSize-i).map((intensity)=>(
                    <tr key={intensity}>
                      <td className="bg-[#F4F4F2] dark:bg-[#141414] border border-[#D8D8D8] dark:border-white/[0.07] px-2 py-1 font-semibold text-[#666] whitespace-nowrap">{matrix.intensityLabels[intensity]||`I${intensity}`}</td>
                      {Array.from({length:config.matrixSize},(_,j)=>j+1).map((freq)=>{
                        const key=`${intensity}-${freq}`;
                        const rating=matrix.matrix[key]||"Negligible";
                        const count=matrixCells[key]?.length||0;
                        const color=HAZARD_RATING_COLORS[rating]||"#888";
                        return (
                          <td key={freq} title={count?`${count} risk(s)`:rating} className="border border-[#D8D8D8] dark:border-white/[0.07] text-center min-w-[48px] py-1"
                            style={{ backgroundColor:`${color}${count>0?"88":"28"}`, fontWeight:count>0?700:400 }}>
                            {count>0?count:""}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Per-asset drill-down */}
        <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/[0.07]">
          <div className="px-5 py-4 border-b border-[#E5E5E5] dark:border-white/[0.06]">
            <span className="text-[13px] font-semibold text-[#333] dark:text-[#CCC]">Per-Asset Drill-Down (sorted by EAL)</span>
          </div>
          <div className="divide-y divide-[#E5E5E5] dark:divide-white/[0.06]">
            {assetAgg.slice(0, 30).map(([assetName, agg]) => {
              const isExpanded = expandedAsset === assetName;
              const assetResults = results.filter((r) => r.asset === assetName).sort((a, b) => b.ealLocal - a.ealLocal);
              const headerColor = HAZARD_RATING_COLORS[agg.maxRating] ?? "#888";
              return (
                <div key={assetName}>
                  <div onClick={() => setExpandedAsset(isExpanded?null:assetName)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#F9F9F8] dark:hover:bg-white/[0.02]"
                    style={{ borderLeft:`3px solid ${isExpanded?headerColor:"transparent"}` }}
                  >
                    <span className="text-[13px] font-semibold text-[#333] dark:text-[#CCC] flex-1 truncate">{assetName}</span>
                    <RatingPill rating={agg.maxRating} />
                    <span className="text-[11px] text-[#888] shrink-0">val {fmt(agg.value,sym)}</span>
                    <span className="text-[11px] font-semibold text-red-500 shrink-0">EAL {fmt(agg.ealLocal,sym)}</span>
                    <span className="text-[11px] text-[#F59E0B] shrink-0">SSL {fmt(agg.sslLocal,sym)}</span>
                    <span className="text-[11px] text-[#888] shrink-0">{agg.riskCount}r</span>
                    {isExpanded ? <ChevronUp size={13} className="text-[#888] shrink-0" /> : <ChevronDown size={13} className="text-[#888] shrink-0" />}
                  </div>
                  {isExpanded && (
                    <div className="overflow-auto max-h-[280px] border-t border-[#E5E5E5] dark:border-white/[0.06]">
                      <table className="w-full border-collapse text-[12px]">
                        <thead className="sticky top-0 bg-[#F4F4F2] dark:bg-[#141414]">
                          <tr>
                            {["Risk","Rating","EF","IV","RRF","SSL","EAL","Response"].map((h)=>(
                              <th key={h} className="px-3 py-1.5 text-left text-[11px] font-semibold text-[#888] border-b border-[#D8D8D8] dark:border-white/[0.07]">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {assetResults.map((r, i) => (
                            <tr key={i} className={i%2===0?"":"bg-[#F9F9F8] dark:bg-[#141414]/50"}>
                              <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/[0.05] truncate max-w-[110px]">{r.risk}</td>
                              <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/[0.05]"><RatingPill rating={r.hazardRating} /></td>
                              <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/[0.05] text-[#888]">{(r.exposureFactor*100).toFixed(0)}%</td>
                              <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/[0.05] text-[#888]">{(r.inherentVulnerability*100).toFixed(0)}%</td>
                              <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/[0.05] text-[#888]">{(r.sbraRrf*100).toFixed(0)}%</td>
                              <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/[0.05]">{fmt(r.sslLocal,sym)}</td>
                              <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/[0.05] font-semibold">{fmt(r.ealLocal,sym)}</td>
                              <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/[0.05] text-[#888] truncate max-w-[110px]">{r.responseStrategy}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
            {assetAgg.length > 30 && <div className="px-4 py-2 text-center text-[13px] text-[#888]">Showing 30 of {assetAgg.length} assets</div>}
          </div>
        </div>

        {/* Top 15 + EAL by type */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-3 bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/[0.07]">
            <div className="px-5 py-4 border-b border-[#E5E5E5] dark:border-white/[0.06]">
              <span className="text-[13px] font-semibold text-[#333] dark:text-[#CCC]">Top 15 Risks by EAL</span>
            </div>
            <div className="overflow-auto max-h-[400px]">
              <table className="w-full border-collapse text-[12px]">
                <thead className="sticky top-0 bg-[#F4F4F2] dark:bg-[#141414]">
                  <tr>
                    {["#","Asset","Risk","Rating","Score","EAL","EAL ($)"].map((h)=>(
                      <th key={h} className="px-3 py-1.5 text-left text-[11px] font-semibold text-[#888] border-b border-[#D8D8D8] dark:border-white/[0.07] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {top15.map((r, i) => (
                    <tr key={i} className={i%2===0?"":"bg-[#F9F9F8] dark:bg-[#141414]/50"}>
                      <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/[0.05] text-[#888]">{i+1}</td>
                      <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/[0.05] truncate max-w-[100px]">{r.asset}</td>
                      <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/[0.05] truncate max-w-[100px]">{r.risk}</td>
                      <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/[0.05]"><RatingPill rating={r.hazardRating} /></td>
                      <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/[0.05]" style={{ fontFamily:"var(--font-mono)" }}>{r.riskScoreNorm}</td>
                      <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/[0.05] font-semibold">{fmt(r.ealLocal,sym)}</td>
                      <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/[0.05] text-[#888]">{fmt(r.ealUsd,"$")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="md:col-span-2 bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/[0.07] p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#888] mb-4" style={{ fontFamily:"var(--font-mono)" }}>EAL by Asset Type</div>
            <div className="space-y-3">
              {assetTypeAgg.map(([type, agg]) => {
                const maxEal = assetTypeAgg[0]?.[1]?.ealTotal || 1;
                return (
                  <div key={type}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[12px] text-[#555] dark:text-[#999] truncate max-w-[120px]">{type}</span>
                      <span className="text-[11px] font-semibold text-[#333] dark:text-[#CCC]" style={{ fontFamily:"var(--font-mono)" }}>{fmt(agg.ealTotal,sym)}</span>
                    </div>
                    <div className="h-2 bg-[#F4F4F2] dark:bg-white/[0.04]">
                      <div className="h-2 bg-[#3B82F6] transition-all duration-500" style={{ width:`${(agg.ealTotal/maxEal)*100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
