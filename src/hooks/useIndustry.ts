import { useMemo } from "react";
import { useScenarioStore } from "@/store/scenarioStore";
import {
  getIndustryConfig,
  isNonFinancialIndustry,
} from "@/config/industryConfig";
import type { IndustryConfig } from "@/config/industryConfig";

interface UseIndustryResult {
  sectorId: string | null;
  config: IndustryConfig;
  isNonFinancial: boolean;
  industryName: string;
}

export function useIndustry(): UseIndustryResult {
  const sectorId = useScenarioStore((s) => s.selectedSectorId);

  return useMemo(() => {
    const config = getIndustryConfig(sectorId);
    const name =
      sectorId === "telecommunications"
        ? "Telecommunications"
        : sectorId === "financial_services"
          ? "Financial Services"
          : config.id
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      sectorId,
      config,
      isNonFinancial: isNonFinancialIndustry(sectorId),
      industryName: name,
    };
  }, [sectorId]);
}
