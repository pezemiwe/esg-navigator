import { useMemo } from "react";
import { useScenarioStore } from "@/store/scenarioStore";
import {
  getIndustryConfig,
  isNonFinancialIndustry,
  isTailoredSector,
} from "@/config/industryConfig";
import type { IndustryConfig } from "@/config/industryConfig";

interface UseIndustryResult {
  sectorId: string | null;
  config: IndustryConfig;
  isNonFinancial: boolean;
  /** False when the sector falls back to the financial-services baseline config. */
  isTailored: boolean;
  industryName: string;
}

const INDUSTRY_DISPLAY_NAMES: Record<string, string> = {
  financial_services: "Financial Services",
  telecommunications: "Telecommunications",
  oil_gas: "Oil & Gas",
};

export function useIndustry(): UseIndustryResult {
  const sectorId = useScenarioStore((s) => s.selectedSectorId);

  return useMemo(() => {
    const config = getIndustryConfig(sectorId);
    const name =
      INDUSTRY_DISPLAY_NAMES[config.id] ??
      config.id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      sectorId,
      config,
      isNonFinancial: isNonFinancialIndustry(sectorId),
      isTailored: isTailoredSector(sectorId),
      industryName: name,
    };
  }, [sectorId]);
}
