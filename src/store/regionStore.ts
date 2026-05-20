import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CountryCode = "NG" | "GH";

export interface RegionProfile {
  code: CountryCode;
  country: string;
  demonym: string;
  capital: string;
  largestCity: string;
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
  locale: string;
  centralBank: string;
  centralBankShort: string;
  secRegulator: string;
  stockExchange: string;
  esgGuideline: string;
  deloitteEntity: string;
  mapCenter: [number, number];
}

export const COUNTRY_PROFILES: Record<CountryCode, RegionProfile> = {
  NG: {
    code: "NG",
    country: "Nigeria",
    demonym: "Nigerian",
    capital: "Abuja",
    largestCity: "Lagos",
    currencyCode: "NGN",
    currencyName: "Naira",
    currencySymbol: "\u20A6",
    locale: "en-NG",
    centralBank: "Central Bank of Nigeria",
    centralBankShort: "CBN",
    secRegulator: "SEC Nigeria",
    stockExchange: "Nigerian Exchange (NGX)",
    esgGuideline: "CBN ESRM Guidelines",
    deloitteEntity: "Deloitte Nigeria",
    mapCenter: [9.06, 7.49],
  },
  GH: {
    code: "GH",
    country: "Ghana",
    demonym: "Ghanaian",
    capital: "Accra",
    largestCity: "Accra",
    currencyCode: "GHS",
    currencyName: "Cedi",
    currencySymbol: "\u20B5",
    locale: "en-GH",
    centralBank: "Bank of Ghana",
    centralBankShort: "BoG",
    secRegulator: "SEC Ghana",
    stockExchange: "Ghana Stock Exchange (GSE)",
    esgGuideline: "BoG Sustainable Banking Principles",
    deloitteEntity: "Deloitte Ghana",
    mapCenter: [7.95, -1.03],
  },
};

interface RegionState {
  code: CountryCode;
  setCountry: (code: CountryCode) => void;
  profile: RegionProfile;
}

export const useRegionStore = create<RegionState>()(
  persist(
    (set) => ({
      code: "NG",
      profile: COUNTRY_PROFILES.NG,
      setCountry: (code) => set({ code, profile: COUNTRY_PROFILES[code] }),
    }),
    {
      name: "region-store-v1",
      partialize: (state) => ({ code: state.code }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.profile = COUNTRY_PROFILES[state.code] ?? COUNTRY_PROFILES.NG;
        }
      },
    },
  ),
);

/** Synchronous accessor for non-React modules (formatters, utils). */
export function getRegion(): RegionProfile {
  return useRegionStore.getState().profile;
}
