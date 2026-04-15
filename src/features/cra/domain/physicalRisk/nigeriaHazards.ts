type HLevel = "H" | "M" | "L";

interface NigeriaLocation {
  name: string;
  lat: number;
  lon: number;
  radius: number;
  state: string;
  hazards: Partial<Record<string, HLevel>>;
}

interface NigeriaState {
  bbox: [number, number, number, number]; // [latMin, latMax, lonMin, lonMax]
  hazards: Partial<Record<string, HLevel>>;
}


export const NIGERIA_LEVEL_SCORES: Record<HLevel, [number, number]> = {
  H: [0.72, 0.62], // → score 4-5 on 5×5 matrix → "High"/"Very High"
  M: [0.48, 0.36], // → score ~3 on 5×5 matrix  → "Medium"/"High"
  L: [0.22, 0.15], // → score ~2 on 5×5 matrix  → "Low"/"Medium"
};
export const NIGERIA_ABSENT_SCORES: [number, number] = [0.03, 0.02];


const NIGERIA_LOCATIONS: NigeriaLocation[] = [


  { name: "Lagos Island / Lagos City Centre", lat: 6.45, lon: 3.39, radius: 0.18, state: "Lagos",
    hazards: { "Coastal Flooding": "H", "Storm Surge": "H", "Sea Level Rise": "H", "Heavy Rainfall": "H",
               "Flash Flooding": "H", "Coastal & Riverbank Erosion": "H", "Groundwater Flooding": "M",
               "Thunderstorms & Lightning": "M" } },

  { name: "Ikeja / Lagos Mainland", lat: 6.60, lon: 3.35, radius: 0.22, state: "Lagos",
    hazards: { "Flash Flooding": "H", "Heavy Rainfall": "H", "Thunderstorms & Lightning": "M",
               "Extreme Heat": "M" } },

  { name: "Lekki Peninsula", lat: 6.43, lon: 3.63, radius: 0.25, state: "Lagos",
    hazards: { "Coastal Flooding": "H", "Storm Surge": "H", "Sea Level Rise": "H",
               "Coastal & Riverbank Erosion": "H", "Heavy Rainfall": "M", "Groundwater Flooding": "M" } },

  { name: "Badagry", lat: 6.42, lon: 2.89, radius: 0.27, state: "Lagos",
    hazards: { "Coastal Flooding": "H", "Storm Surge": "H", "Sea Level Rise": "H",
               "Coastal & Riverbank Erosion": "H", "Heavy Rainfall": "H" } },

  { name: "Ikorodu", lat: 6.62, lon: 3.52, radius: 0.22, state: "Lagos",
    hazards: { "River Flooding": "H", "Flash Flooding": "H", "Heavy Rainfall": "H",
               "Thunderstorms & Lightning": "M" } },

  { name: "Apapa / Tin Can Island", lat: 6.45, lon: 3.36, radius: 0.13, state: "Lagos",
    hazards: { "Coastal Flooding": "H", "Storm Surge": "H", "Heavy Rainfall": "H",
               "Flash Flooding": "M", "Groundwater Flooding": "M" } },

  { name: "Epe", lat: 6.59, lon: 3.98, radius: 0.22, state: "Lagos",
    hazards: { "River Flooding": "M", "Heavy Rainfall": "M", "Thunderstorms & Lightning": "M" } },

  { name: "Abeokuta", lat: 7.16, lon: 3.35, radius: 0.28, state: "Ogun",
    hazards: { "Flash Flooding": "M", "River Flooding": "M", "Heavy Rainfall": "M",
               "Thunderstorms & Lightning": "M" } },

  { name: "Ijebu-Ode", lat: 6.82, lon: 3.93, radius: 0.22, state: "Ogun",
    hazards: { "Heavy Rainfall": "M", "Thunderstorms & Lightning": "M", "Flash Flooding": "L" } },

  { name: "Sagamu", lat: 6.84, lon: 3.65, radius: 0.20, state: "Ogun",
    hazards: { "Flash Flooding": "M", "Heavy Rainfall": "M", "Thunderstorms & Lightning": "M" } },

  { name: "Ota", lat: 6.69, lon: 3.21, radius: 0.20, state: "Ogun",
    hazards: { "Flash Flooding": "M", "Heavy Rainfall": "M", "Thunderstorms & Lightning": "M" } },

  { name: "Ibadan", lat: 7.38, lon: 3.90, radius: 0.35, state: "Oyo",
    hazards: { "Flash Flooding": "H", "Heavy Rainfall": "H", "Thunderstorms & Lightning": "M",
               "River Flooding": "M", "Extreme Heat": "L" } },

  { name: "Ogbomoso", lat: 8.13, lon: 4.25, radius: 0.25, state: "Oyo",
    hazards: { "Extreme Heat": "M", "Thunderstorms & Lightning": "M", "Flash Flooding": "L" } },

  { name: "Oyo Town", lat: 7.85, lon: 3.93, radius: 0.22, state: "Oyo",
    hazards: { "Extreme Heat": "M", "Thunderstorms & Lightning": "M", "Flash Flooding": "L" } },

  { name: "Saki", lat: 8.67, lon: 3.38, radius: 0.22, state: "Oyo",
    hazards: { "Extreme Heat": "M", "Drought": "L", "Wildfire / Bushfire": "L" } },

  { name: "Akure", lat: 7.25, lon: 5.19, radius: 0.25, state: "Ondo",
    hazards: { "Thunderstorms & Lightning": "H", "Heavy Rainfall": "H", "Flash Flooding": "M" } },

  { name: "Ondo City", lat: 7.10, lon: 4.83, radius: 0.22, state: "Ondo",
    hazards: { "Heavy Rainfall": "M", "Thunderstorms & Lightning": "M", "Flash Flooding": "L" } },

  { name: "Owo", lat: 7.20, lon: 5.59, radius: 0.22, state: "Ondo",
    hazards: { "Thunderstorms & Lightning": "M", "Heavy Rainfall": "M", "Flash Flooding": "L" } },

  { name: "Ikare-Akoko", lat: 7.52, lon: 5.76, radius: 0.20, state: "Ondo",
    hazards: { "Heavy Rainfall": "M", "Thunderstorms & Lightning": "M" } },

  { name: "Ilaje / Igbokoda (coastal)", lat: 6.43, lon: 4.86, radius: 0.28, state: "Ondo",
    hazards: { "Coastal Flooding": "M", "Heavy Rainfall": "M", "Coastal & Riverbank Erosion": "M",
               "Storm Surge": "L" } },

  { name: "Ado-Ekiti", lat: 7.63, lon: 5.22, radius: 0.25, state: "Ekiti",
    hazards: { "Thunderstorms & Lightning": "M", "Heavy Rainfall": "M", "Flash Flooding": "L" } },

  { name: "Ikere-Ekiti", lat: 7.51, lon: 5.38, radius: 0.20, state: "Ekiti",
    hazards: { "Heavy Rainfall": "M", "Thunderstorms & Lightning": "M" } },

  { name: "Osogbo", lat: 7.77, lon: 4.56, radius: 0.22, state: "Osun",
    hazards: { "Thunderstorms & Lightning": "M", "Heavy Rainfall": "M", "Flash Flooding": "L" } },

  { name: "Ile-Ife", lat: 7.47, lon: 4.56, radius: 0.22, state: "Osun",
    hazards: { "Thunderstorms & Lightning": "M", "Flash Flooding": "L", "Heavy Rainfall": "M" } },

  { name: "Ilesa", lat: 7.62, lon: 4.74, radius: 0.20, state: "Osun",
    hazards: { "Thunderstorms & Lightning": "M", "Heavy Rainfall": "M" } },


  { name: "Port Harcourt", lat: 4.83, lon: 7.03, radius: 0.30, state: "Rivers",
    hazards: { "Coastal Flooding": "H", "River Flooding": "H", "Flash Flooding": "H",
               "Heavy Rainfall": "H", "Storm Surge": "M", "Groundwater Flooding": "M",
               "Thunderstorms & Lightning": "M", "Extreme Heat": "M" } },

  { name: "Bonny Island", lat: 4.44, lon: 7.16, radius: 0.18, state: "Rivers",
    hazards: { "Coastal Flooding": "H", "Storm Surge": "H", "Sea Level Rise": "H",
               "Heavy Rainfall": "H", "Coastal & Riverbank Erosion": "H", "Groundwater Flooding": "H" } },

  { name: "Okrika", lat: 4.74, lon: 7.10, radius: 0.18, state: "Rivers",
    hazards: { "River Flooding": "H", "Coastal Flooding": "M", "Heavy Rainfall": "H",
               "Groundwater Flooding": "M" } },

  { name: "Ahoada", lat: 5.12, lon: 6.64, radius: 0.22, state: "Rivers",
    hazards: { "River Flooding": "H", "Flash Flooding": "M", "Heavy Rainfall": "H",
               "Thunderstorms & Lightning": "M" } },

  { name: "Omoku / Ogba", lat: 5.37, lon: 6.66, radius: 0.22, state: "Rivers",
    hazards: { "River Flooding": "M", "Flash Flooding": "M", "Heavy Rainfall": "M" } },

  { name: "Degema", lat: 4.75, lon: 6.77, radius: 0.18, state: "Rivers",
    hazards: { "Coastal Flooding": "H", "River Flooding": "H", "Storm Surge": "M",
               "Sea Level Rise": "M", "Heavy Rainfall": "H" } },

  { name: "Yenagoa", lat: 4.92, lon: 6.26, radius: 0.25, state: "Bayelsa",
    hazards: { "Coastal Flooding": "H", "Storm Surge": "H", "Sea Level Rise": "H",
               "River Flooding": "H", "Heavy Rainfall": "H", "Groundwater Flooding": "H",
               "Thunderstorms & Lightning": "M", "Extreme Heat": "M" } },

  { name: "Brass / Nembe (island)", lat: 4.31, lon: 6.23, radius: 0.22, state: "Bayelsa",
    hazards: { "Coastal Flooding": "H", "Storm Surge": "H", "Sea Level Rise": "H",
               "Heavy Rainfall": "H", "Coastal & Riverbank Erosion": "H",
               "Groundwater Flooding": "H" } },

  { name: "Ogbia / Oloibiri", lat: 4.70, lon: 6.47, radius: 0.22, state: "Bayelsa",
    hazards: { "River Flooding": "H", "Coastal Flooding": "M", "Heavy Rainfall": "H",
               "Groundwater Flooding": "M" } },

  { name: "Sagbama", lat: 5.12, lon: 6.03, radius: 0.20, state: "Bayelsa",
    hazards: { "River Flooding": "H", "Coastal Flooding": "M", "Heavy Rainfall": "H",
               "Coastal & Riverbank Erosion": "M" } },

  { name: "Warri", lat: 5.52, lon: 5.75, radius: 0.25, state: "Delta",
    hazards: { "River Flooding": "H", "Coastal Flooding": "M", "Heavy Rainfall": "H",
               "Flash Flooding": "M", "Coastal & Riverbank Erosion": "M",
               "Thunderstorms & Lightning": "M", "Extreme Heat": "M" } },

  { name: "Asaba", lat: 6.20, lon: 6.73, radius: 0.22, state: "Delta",
    hazards: { "River Flooding": "H", "Flash Flooding": "M", "Heavy Rainfall": "M",
               "Thunderstorms & Lightning": "M" } },

  { name: "Sapele", lat: 5.90, lon: 5.68, radius: 0.20, state: "Delta",
    hazards: { "River Flooding": "M", "Coastal & Riverbank Erosion": "M", "Heavy Rainfall": "M",
               "Thunderstorms & Lightning": "M" } },

  { name: "Burutu", lat: 5.35, lon: 5.50, radius: 0.22, state: "Delta",
    hazards: { "Coastal Flooding": "H", "River Flooding": "H", "Storm Surge": "H",
               "Sea Level Rise": "H", "Coastal & Riverbank Erosion": "H",
               "Heavy Rainfall": "H" } },

  { name: "Ughelli", lat: 5.49, lon: 5.98, radius: 0.22, state: "Delta",
    hazards: { "River Flooding": "M", "Heavy Rainfall": "M", "Flash Flooding": "L",
               "Thunderstorms & Lightning": "M" } },

  { name: "Agbor", lat: 6.25, lon: 6.19, radius: 0.20, state: "Delta",
    hazards: { "Heavy Rainfall": "M", "Flash Flooding": "L", "Thunderstorms & Lightning": "M" } },

  { name: "Ozoro", lat: 5.55, lon: 6.29, radius: 0.20, state: "Delta",
    hazards: { "River Flooding": "M", "Heavy Rainfall": "M", "Coastal Flooding": "L" } },

  { name: "Benin City", lat: 6.34, lon: 5.63, radius: 0.30, state: "Edo",
    hazards: { "Flash Flooding": "M", "Heavy Rainfall": "M", "Thunderstorms & Lightning": "M",
               "Extreme Heat": "M" } },

  { name: "Auchi", lat: 7.07, lon: 6.27, radius: 0.22, state: "Edo",
    hazards: { "Heavy Rainfall": "M", "Thunderstorms & Lightning": "M", "Flash Flooding": "L" } },

  { name: "Ekpoma", lat: 6.74, lon: 6.13, radius: 0.20, state: "Edo",
    hazards: { "Heavy Rainfall": "M", "Thunderstorms & Lightning": "M" } },

  { name: "Agenebode / Fugar", lat: 7.29, lon: 6.64, radius: 0.22, state: "Edo",
    hazards: { "River Flooding": "M", "Heavy Rainfall": "M", "Thunderstorms & Lightning": "M" } },

  { name: "Uyo", lat: 5.05, lon: 7.92, radius: 0.25, state: "Akwa Ibom",
    hazards: { "Heavy Rainfall": "H", "Flash Flooding": "M", "Coastal Flooding": "L",
               "Thunderstorms & Lightning": "M", "Coastal & Riverbank Erosion": "L" } },

  { name: "Eket", lat: 4.64, lon: 7.93, radius: 0.20, state: "Akwa Ibom",
    hazards: { "Coastal Flooding": "H", "Storm Surge": "H", "Heavy Rainfall": "H",
               "Sea Level Rise": "M", "Groundwater Flooding": "M" } },

  { name: "Oron", lat: 4.80, lon: 8.24, radius: 0.18, state: "Akwa Ibom",
    hazards: { "Coastal Flooding": "M", "River Flooding": "M", "Heavy Rainfall": "H",
               "Coastal & Riverbank Erosion": "M" } },

  { name: "Ikot Ekpene", lat: 5.18, lon: 7.71, radius: 0.22, state: "Akwa Ibom",
    hazards: { "Heavy Rainfall": "M", "Flash Flooding": "L", "Thunderstorms & Lightning": "M" } },

  { name: "Itu / Mbaise", lat: 5.20, lon: 8.03, radius: 0.20, state: "Akwa Ibom",
    hazards: { "Heavy Rainfall": "M", "River Flooding": "L", "Thunderstorms & Lightning": "M" } },

  { name: "Calabar", lat: 4.96, lon: 8.33, radius: 0.28, state: "Cross River",
    hazards: { "River Flooding": "M", "Heavy Rainfall": "H", "Coastal Flooding": "L",
               "Thunderstorms & Lightning": "M", "Coastal & Riverbank Erosion": "M" } },

  { name: "Ikom", lat: 5.97, lon: 8.72, radius: 0.22, state: "Cross River",
    hazards: { "River Flooding": "H", "Landslides": "M", "Heavy Rainfall": "H",
               "Thunderstorms & Lightning": "M" } },

  { name: "Ogoja", lat: 6.65, lon: 8.80, radius: 0.22, state: "Cross River",
    hazards: { "Flash Flooding": "M", "Heavy Rainfall": "M", "Thunderstorms & Lightning": "M" } },

  { name: "Obudu Plateau", lat: 6.67, lon: 9.17, radius: 0.22, state: "Cross River",
    hazards: { "Landslides": "H", "Heavy Rainfall": "H", "Thunderstorms & Lightning": "H" } },

  { name: "Ugep / Yakurr", lat: 5.82, lon: 8.06, radius: 0.22, state: "Cross River",
    hazards: { "Heavy Rainfall": "M", "River Flooding": "M", "Thunderstorms & Lightning": "M" } },


  { name: "Onitsha", lat: 6.14, lon: 6.78, radius: 0.22, state: "Anambra",
    hazards: { "River Flooding": "H", "Coastal & Riverbank Erosion": "H", "Flash Flooding": "M",
               "Heavy Rainfall": "M", "Thunderstorms & Lightning": "M" } },

  { name: "Awka", lat: 6.21, lon: 7.07, radius: 0.25, state: "Anambra",
    hazards: { "Coastal & Riverbank Erosion": "H", "Flash Flooding": "M", "Heavy Rainfall": "M",
               "Thunderstorms & Lightning": "M" } },

  { name: "Nnewi", lat: 6.02, lon: 6.92, radius: 0.22, state: "Anambra",
    hazards: { "Heavy Rainfall": "M", "Coastal & Riverbank Erosion": "M", "Flash Flooding": "L",
               "Thunderstorms & Lightning": "M" } },

  { name: "Agulu / Nanka (gully belt)", lat: 6.09, lon: 7.07, radius: 0.20, state: "Anambra",
    hazards: { "Coastal & Riverbank Erosion": "H", "Flash Flooding": "M", "Heavy Rainfall": "M" } },

  { name: "Ekwulobia / Aguata", lat: 5.93, lon: 7.17, radius: 0.22, state: "Anambra",
    hazards: { "Coastal & Riverbank Erosion": "H", "Heavy Rainfall": "M", "Flash Flooding": "L" } },

  { name: "Ogidi / Otuocha (Niger bank)", lat: 6.17, lon: 6.87, radius: 0.20, state: "Anambra",
    hazards: { "River Flooding": "H", "Coastal & Riverbank Erosion": "H", "Heavy Rainfall": "M" } },

  { name: "Owerri", lat: 5.49, lon: 7.03, radius: 0.28, state: "Imo",
    hazards: { "Heavy Rainfall": "H", "Coastal & Riverbank Erosion": "H", "Flash Flooding": "M",
               "River Flooding": "M", "Thunderstorms & Lightning": "M" } },

  { name: "Orlu", lat: 5.79, lon: 7.03, radius: 0.22, state: "Imo",
    hazards: { "Coastal & Riverbank Erosion": "H", "Heavy Rainfall": "M", "Thunderstorms & Lightning": "M" } },

  { name: "Okigwe", lat: 5.86, lon: 7.35, radius: 0.22, state: "Imo",
    hazards: { "Coastal & Riverbank Erosion": "M", "Heavy Rainfall": "M", "Flash Flooding": "L" } },

  { name: "Oguta", lat: 5.73, lon: 6.79, radius: 0.18, state: "Imo",
    hazards: { "River Flooding": "M", "Coastal & Riverbank Erosion": "M", "Heavy Rainfall": "M" } },

  { name: "Aba", lat: 5.11, lon: 7.35, radius: 0.25, state: "Abia",
    hazards: { "Coastal & Riverbank Erosion": "H", "Heavy Rainfall": "H", "Flash Flooding": "M",
               "River Flooding": "L", "Thunderstorms & Lightning": "M" } },

  { name: "Umuahia", lat: 5.53, lon: 7.49, radius: 0.22, state: "Abia",
    hazards: { "Coastal & Riverbank Erosion": "M", "Heavy Rainfall": "M", "Thunderstorms & Lightning": "M" } },

  { name: "Arochukwu", lat: 5.36, lon: 7.92, radius: 0.20, state: "Abia",
    hazards: { "Heavy Rainfall": "M", "Coastal & Riverbank Erosion": "M", "Thunderstorms & Lightning": "M" } },

  { name: "Enugu City", lat: 6.46, lon: 7.51, radius: 0.28, state: "Enugu",
    hazards: { "Coastal & Riverbank Erosion": "H", "Flash Flooding": "M", "Thunderstorms & Lightning": "M",
               "Heavy Rainfall": "M" } },

  { name: "Nsukka", lat: 6.86, lon: 7.40, radius: 0.22, state: "Enugu",
    hazards: { "Coastal & Riverbank Erosion": "M", "Heavy Rainfall": "M", "Thunderstorms & Lightning": "M" } },

  { name: "Awgu", lat: 6.07, lon: 7.50, radius: 0.20, state: "Enugu",
    hazards: { "Coastal & Riverbank Erosion": "H", "Heavy Rainfall": "M", "Flash Flooding": "L" } },

  { name: "Oji River", lat: 6.59, lon: 7.33, radius: 0.18, state: "Enugu",
    hazards: { "River Flooding": "M", "Coastal & Riverbank Erosion": "M", "Heavy Rainfall": "M" } },

  { name: "Abakaliki", lat: 6.33, lon: 8.12, radius: 0.25, state: "Ebonyi",
    hazards: { "River Flooding": "H", "Heavy Rainfall": "H", "Flash Flooding": "M",
               "Coastal & Riverbank Erosion": "M", "Thunderstorms & Lightning": "M" } },

  { name: "Onueke / Ezza", lat: 6.06, lon: 8.03, radius: 0.22, state: "Ebonyi",
    hazards: { "Heavy Rainfall": "H", "Flash Flooding": "M", "River Flooding": "M" } },


  { name: "Abuja (FCT)", lat: 9.07, lon: 7.40, radius: 0.35, state: "FCT",
    hazards: { "Flash Flooding": "M", "Thunderstorms & Lightning": "M", "Extreme Heat": "M",
               "Wildfire / Bushfire": "L" } },

  { name: "Gwagwalada", lat: 8.94, lon: 7.08, radius: 0.25, state: "FCT",
    hazards: { "Flash Flooding": "M", "River Flooding": "L", "Extreme Heat": "M",
               "Thunderstorms & Lightning": "M" } },

  { name: "Suleja (Niger, near FCT)", lat: 9.18, lon: 7.18, radius: 0.22, state: "Niger",
    hazards: { "Flash Flooding": "L", "Thunderstorms & Lightning": "M", "Extreme Heat": "M" } },

  { name: "Lokoja (Niger–Benue confluence)", lat: 7.80, lon: 6.74, radius: 0.28, state: "Kogi",
    hazards: { "River Flooding": "H", "Flash Flooding": "M", "Extreme Heat": "M",
               "Thunderstorms & Lightning": "M" } },

  { name: "Okene", lat: 7.55, lon: 6.24, radius: 0.22, state: "Kogi",
    hazards: { "Flash Flooding": "M", "Thunderstorms & Lightning": "M", "Heavy Rainfall": "M" } },

  { name: "Kabba", lat: 7.83, lon: 6.07, radius: 0.22, state: "Kogi",
    hazards: { "Heavy Rainfall": "M", "Thunderstorms & Lightning": "M", "Flash Flooding": "L" } },

  { name: "Idah (Niger R. bank)", lat: 7.12, lon: 6.74, radius: 0.20, state: "Kogi",
    hazards: { "River Flooding": "H", "Extreme Heat": "M", "Thunderstorms & Lightning": "M" } },

  { name: "Ankpa", lat: 7.38, lon: 7.65, radius: 0.20, state: "Kogi",
    hazards: { "Thunderstorms & Lightning": "M", "Flash Flooding": "L", "Extreme Heat": "M" } },

  { name: "Ilorin", lat: 8.50, lon: 4.55, radius: 0.30, state: "Kwara",
    hazards: { "Extreme Heat": "M", "Thunderstorms & Lightning": "M", "Flash Flooding": "M",
               "Heavy Rainfall": "M" } },

  { name: "Offa", lat: 8.15, lon: 4.72, radius: 0.22, state: "Kwara",
    hazards: { "Extreme Heat": "M", "Drought": "L", "Thunderstorms & Lightning": "M" } },

  { name: "Jebba (Niger R. dam)", lat: 9.14, lon: 4.82, radius: 0.22, state: "Kwara",
    hazards: { "River Flooding": "H", "Extreme Heat": "M", "Wildfire / Bushfire": "L" } },

  { name: "Kaiama", lat: 9.58, lon: 3.96, radius: 0.22, state: "Kwara",
    hazards: { "Extreme Heat": "M", "Drought": "L", "Wildfire / Bushfire": "M" } },

  { name: "Minna", lat: 9.61, lon: 6.56, radius: 0.28, state: "Niger",
    hazards: { "Flash Flooding": "M", "Thunderstorms & Lightning": "M", "Extreme Heat": "M",
               "Heavy Rainfall": "M" } },

  { name: "Bida (Niger R. floodplain)", lat: 9.08, lon: 6.01, radius: 0.25, state: "Niger",
    hazards: { "River Flooding": "H", "Flash Flooding": "M", "Extreme Heat": "M",
               "Thunderstorms & Lightning": "M" } },

  { name: "Mokwa (Niger plains)", lat: 9.30, lon: 5.05, radius: 0.30, state: "Niger",
    hazards: { "River Flooding": "H", "Extreme Heat": "M", "Wildfire / Bushfire": "M",
               "Drought": "L" } },

  { name: "Kontagora", lat: 10.40, lon: 5.46, radius: 0.25, state: "Niger",
    hazards: { "Extreme Heat": "M", "Sandstorms / Harmattan": "L", "Drought": "L",
               "Wildfire / Bushfire": "M" } },

  { name: "New Bussa / Kainji", lat: 10.12, lon: 4.55, radius: 0.25, state: "Niger",
    hazards: { "River Flooding": "M", "Extreme Heat": "M", "Wildfire / Bushfire": "M" } },

  { name: "Lafia", lat: 8.49, lon: 8.52, radius: 0.25, state: "Nasarawa",
    hazards: { "Thunderstorms & Lightning": "M", "Heavy Rainfall": "M", "Flash Flooding": "M",
               "Extreme Heat": "M" } },

  { name: "Keffi", lat: 8.85, lon: 7.87, radius: 0.22, state: "Nasarawa",
    hazards: { "Thunderstorms & Lightning": "M", "Flash Flooding": "M", "Extreme Heat": "M" } },

  { name: "Akwanga", lat: 8.93, lon: 8.39, radius: 0.22, state: "Nasarawa",
    hazards: { "Thunderstorms & Lightning": "M", "Flash Flooding": "M" } },

  { name: "Jos", lat: 9.92, lon: 8.90, radius: 0.32, state: "Plateau",
    hazards: { "Thunderstorms & Lightning": "H", "Flash Flooding": "H", "Heavy Rainfall": "H",
               "Landslides": "M" } },

  { name: "Pankshin", lat: 9.34, lon: 9.44, radius: 0.22, state: "Plateau",
    hazards: { "Thunderstorms & Lightning": "M", "Landslides": "L", "Heavy Rainfall": "M" } },

  { name: "Shendam", lat: 8.88, lon: 9.55, radius: 0.22, state: "Plateau",
    hazards: { "River Flooding": "M", "Heavy Rainfall": "M", "Thunderstorms & Lightning": "L" } },

  { name: "Wase (Plateau foothills)", lat: 9.18, lon: 10.10, radius: 0.22, state: "Plateau",
    hazards: { "Thunderstorms & Lightning": "M", "Flash Flooding": "M", "Extreme Heat": "M" } },

  { name: "Makurdi (Benue R. — heavily flooded)", lat: 7.73, lon: 8.54, radius: 0.30, state: "Benue",
    hazards: { "River Flooding": "H", "Heavy Rainfall": "H", "Flash Flooding": "M",
               "Thunderstorms & Lightning": "M", "Extreme Heat": "M" } },

  { name: "Gboko", lat: 7.32, lon: 9.00, radius: 0.22, state: "Benue",
    hazards: { "Heavy Rainfall": "M", "Flash Flooding": "M", "Thunderstorms & Lightning": "M" } },

  { name: "Otukpo", lat: 7.19, lon: 8.13, radius: 0.22, state: "Benue",
    hazards: { "Flash Flooding": "M", "Heavy Rainfall": "M", "Thunderstorms & Lightning": "M" } },

  { name: "Katsina-Ala (Benue R. tributary)", lat: 7.17, lon: 9.29, radius: 0.22, state: "Benue",
    hazards: { "River Flooding": "H", "Heavy Rainfall": "H", "Thunderstorms & Lightning": "M" } },

  { name: "Yandev / Gboko South", lat: 7.05, lon: 8.90, radius: 0.20, state: "Benue",
    hazards: { "Heavy Rainfall": "M", "Flash Flooding": "M", "Wildfire / Bushfire": "L" } },


  { name: "Kaduna City", lat: 10.52, lon: 7.44, radius: 0.30, state: "Kaduna",
    hazards: { "Flash Flooding": "M", "Thunderstorms & Lightning": "M", "Heavy Rainfall": "M",
               "Extreme Heat": "M" } },

  { name: "Zaria", lat: 11.06, lon: 7.70, radius: 0.25, state: "Kaduna",
    hazards: { "Extreme Heat": "M", "Flash Flooding": "M", "Drought": "L",
               "Thunderstorms & Lightning": "M" } },

  { name: "Kafanchan", lat: 9.59, lon: 8.30, radius: 0.22, state: "Kaduna",
    hazards: { "Thunderstorms & Lightning": "M", "Heavy Rainfall": "M", "Flash Flooding": "M" } },

  { name: "Kagoro / Kaura", lat: 9.97, lon: 8.37, radius: 0.22, state: "Kaduna",
    hazards: { "Thunderstorms & Lightning": "M", "Heavy Rainfall": "M", "Landslides": "L" } },

  { name: "Birnin Gwari", lat: 10.75, lon: 6.68, radius: 0.22, state: "Kaduna",
    hazards: { "Extreme Heat": "M", "Flash Flooding": "M", "Wildfire / Bushfire": "L" } },

  { name: "Kano City", lat: 12.00, lon: 8.52, radius: 0.32, state: "Kano",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Sandstorms / Harmattan": "H",
               "Flash Flooding": "H", "Heavy Rainfall": "M", "Desertification": "M",
               "Water Scarcity": "M" } },

  { name: "Wudil", lat: 11.79, lon: 8.84, radius: 0.22, state: "Kano",
    hazards: { "Extreme Heat": "H", "Flash Flooding": "M", "Drought": "M",
               "Sandstorms / Harmattan": "M" } },

  { name: "Dambatta", lat: 12.49, lon: 8.52, radius: 0.22, state: "Kano",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Desertification": "M",
               "Sandstorms / Harmattan": "H", "Water Scarcity": "M" } },

  { name: "Gaya", lat: 11.88, lon: 9.01, radius: 0.22, state: "Kano",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Flash Flooding": "L",
               "Sandstorms / Harmattan": "M" } },

  { name: "Rano", lat: 11.56, lon: 8.56, radius: 0.20, state: "Kano",
    hazards: { "Extreme Heat": "H", "Drought": "M", "Sandstorms / Harmattan": "M" } },

  { name: "Katsina City", lat: 12.99, lon: 7.60, radius: 0.28, state: "Katsina",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Sandstorms / Harmattan": "H",
               "Desertification": "H", "Water Scarcity": "H", "Flash Flooding": "L" } },

  { name: "Daura", lat: 13.03, lon: 8.32, radius: 0.22, state: "Katsina",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Sandstorms / Harmattan": "H",
               "Desertification": "H", "Water Scarcity": "H" } },

  { name: "Dutsin-Ma", lat: 12.45, lon: 7.50, radius: 0.22, state: "Katsina",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Sandstorms / Harmattan": "M",
               "Desertification": "M", "Water Scarcity": "M" } },

  { name: "Kankia / Mashi (far north)", lat: 13.50, lon: 7.80, radius: 0.25, state: "Katsina",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Desertification": "H",
               "Sandstorms / Harmattan": "H", "Water Scarcity": "H" } },

  { name: "Dutse", lat: 11.69, lon: 9.34, radius: 0.25, state: "Jigawa",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Sandstorms / Harmattan": "H",
               "Desertification": "M", "Flash Flooding": "M", "Water Scarcity": "M" } },

  { name: "Hadejia (floodplain)", lat: 12.45, lon: 10.04, radius: 0.25, state: "Jigawa",
    hazards: { "River Flooding": "H", "Extreme Heat": "H", "Drought": "H",
               "Sandstorms / Harmattan": "M", "Water Scarcity": "M" } },

  { name: "Gumel", lat: 12.62, lon: 9.38, radius: 0.22, state: "Jigawa",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Desertification": "M",
               "Sandstorms / Harmattan": "M" } },

  { name: "Gusau", lat: 12.17, lon: 6.66, radius: 0.25, state: "Zamfara",
    hazards: { "Extreme Heat": "H", "Sandstorms / Harmattan": "H", "Drought": "M",
               "Desertification": "M", "Flash Flooding": "L" } },

  { name: "Talata Mafara", lat: 12.55, lon: 6.07, radius: 0.22, state: "Zamfara",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Desertification": "M",
               "Sandstorms / Harmattan": "M" } },

  { name: "Anka", lat: 12.07, lon: 5.92, radius: 0.20, state: "Zamfara",
    hazards: { "Extreme Heat": "H", "Drought": "M", "Sandstorms / Harmattan": "M" } },

  { name: "Birnin Kebbi", lat: 12.45, lon: 4.20, radius: 0.25, state: "Kebbi",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Sandstorms / Harmattan": "H",
               "Water Scarcity": "M", "River Flooding": "M", "Desertification": "M" } },

  { name: "Argungu", lat: 12.74, lon: 4.52, radius: 0.22, state: "Kebbi",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Sandstorms / Harmattan": "H",
               "River Flooding": "L" } },

  { name: "Yauri (Kainji Lake)", lat: 11.61, lon: 4.25, radius: 0.22, state: "Kebbi",
    hazards: { "River Flooding": "M", "Extreme Heat": "H", "Drought": "M", "Wildfire / Bushfire": "M" } },

  { name: "Sokoto City", lat: 13.07, lon: 5.24, radius: 0.30, state: "Sokoto",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Sandstorms / Harmattan": "H",
               "Desertification": "H", "Water Scarcity": "H" } },

  { name: "Tambuwal", lat: 12.40, lon: 4.64, radius: 0.22, state: "Sokoto",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Desertification": "M",
               "Sandstorms / Harmattan": "M" } },

  { name: "Gwadabawa (far north)", lat: 13.37, lon: 5.23, radius: 0.22, state: "Sokoto",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Desertification": "H",
               "Sandstorms / Harmattan": "H", "Water Scarcity": "H" } },


  { name: "Bauchi City", lat: 10.31, lon: 9.84, radius: 0.28, state: "Bauchi",
    hazards: { "Extreme Heat": "M", "Thunderstorms & Lightning": "M", "Flash Flooding": "M",
               "Heavy Rainfall": "L" } },

  { name: "Azare", lat: 11.67, lon: 10.19, radius: 0.22, state: "Bauchi",
    hazards: { "Extreme Heat": "M", "Drought": "M", "Sandstorms / Harmattan": "L" } },

  { name: "Alkaleri", lat: 10.91, lon: 10.95, radius: 0.20, state: "Bauchi",
    hazards: { "Thunderstorms & Lightning": "M", "Heavy Rainfall": "L" } },

  { name: "Dass / Tafawa Balewa (hills)", lat: 10.15, lon: 10.16, radius: 0.22, state: "Bauchi",
    hazards: { "Thunderstorms & Lightning": "M", "Heavy Rainfall": "M", "Landslides": "L" } },

  { name: "Gombe City", lat: 10.29, lon: 11.17, radius: 0.25, state: "Gombe",
    hazards: { "Extreme Heat": "H", "Drought": "M", "Sandstorms / Harmattan": "M",
               "Flash Flooding": "L" } },

  { name: "Dukku", lat: 10.82, lon: 11.00, radius: 0.22, state: "Gombe",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Sandstorms / Harmattan": "M" } },

  { name: "Kaltungo", lat: 9.82, lon: 11.32, radius: 0.20, state: "Gombe",
    hazards: { "Thunderstorms & Lightning": "M", "Heavy Rainfall": "M", "Flash Flooding": "L" } },

  { name: "Yola", lat: 9.20, lon: 12.48, radius: 0.25, state: "Adamawa",
    hazards: { "River Flooding": "M", "Extreme Heat": "M", "Thunderstorms & Lightning": "M",
               "Heavy Rainfall": "M" } },

  { name: "Mubi", lat: 10.26, lon: 13.27, radius: 0.22, state: "Adamawa",
    hazards: { "Thunderstorms & Lightning": "M", "Heavy Rainfall": "L", "Extreme Heat": "M",
               "Landslides": "L" } },

  { name: "Numan", lat: 9.47, lon: 12.04, radius: 0.22, state: "Adamawa",
    hazards: { "River Flooding": "M", "Thunderstorms & Lightning": "M", "Extreme Heat": "M" } },

  { name: "Michika (Mandara Mts)", lat: 10.65, lon: 13.38, radius: 0.20, state: "Adamawa",
    hazards: { "Landslides": "M", "Heavy Rainfall": "M", "Thunderstorms & Lightning": "M" } },

  { name: "Jalingo", lat: 8.90, lon: 11.37, radius: 0.25, state: "Taraba",
    hazards: { "Heavy Rainfall": "H", "Thunderstorms & Lightning": "M", "River Flooding": "M",
               "Flash Flooding": "M" } },

  { name: "Wukari", lat: 7.87, lon: 9.78, radius: 0.22, state: "Taraba",
    hazards: { "Heavy Rainfall": "M", "Thunderstorms & Lightning": "M", "Flash Flooding": "L" } },

  { name: "Bali", lat: 7.87, lon: 11.58, radius: 0.20, state: "Taraba",
    hazards: { "Heavy Rainfall": "H", "Thunderstorms & Lightning": "M", "River Flooding": "M",
               "Landslides": "L" } },

  { name: "Maiduguri", lat: 11.85, lon: 13.16, radius: 0.30, state: "Borno",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Desertification": "H",
               "Sandstorms / Harmattan": "H", "Water Scarcity": "H", "Flash Flooding": "M" } },

  { name: "Bama", lat: 11.52, lon: 13.70, radius: 0.25, state: "Borno",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Desertification": "H",
               "Sandstorms / Harmattan": "H", "Water Scarcity": "H" } },

  { name: "Monguno (far north)", lat: 13.11, lon: 13.37, radius: 0.25, state: "Borno",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Desertification": "H",
               "Sandstorms / Harmattan": "H", "Water Scarcity": "H" } },

  { name: "Gwoza (Mandara Mts)", lat: 10.97, lon: 13.68, radius: 0.22, state: "Borno",
    hazards: { "Landslides": "H", "Heavy Rainfall": "H", "Thunderstorms & Lightning": "M" } },

  { name: "Dikwa", lat: 12.02, lon: 13.93, radius: 0.22, state: "Borno",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Desertification": "H",
               "Sandstorms / Harmattan": "H" } },

  { name: "Kukawa (Lake Chad fringe)", lat: 12.93, lon: 13.58, radius: 0.28, state: "Borno",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Desertification": "H",
               "Water Scarcity": "H", "Sandstorms / Harmattan": "H" } },

  { name: "Damaturu", lat: 11.75, lon: 11.96, radius: 0.25, state: "Yobe",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Desertification": "H",
               "Sandstorms / Harmattan": "H", "Water Scarcity": "H" } },

  { name: "Potiskum", lat: 11.71, lon: 11.08, radius: 0.25, state: "Yobe",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Sandstorms / Harmattan": "H",
               "Wildfire / Bushfire": "M" } },

  { name: "Nguru", lat: 12.88, lon: 10.45, radius: 0.22, state: "Yobe",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Desertification": "H",
               "Water Scarcity": "H", "Sandstorms / Harmattan": "H", "Wildfire / Bushfire": "M" } },

  { name: "Gashua", lat: 12.87, lon: 11.04, radius: 0.22, state: "Yobe",
    hazards: { "Extreme Heat": "H", "Drought": "H", "Desertification": "H",
               "Sandstorms / Harmattan": "H", "Water Scarcity": "H" } },
];


const NIGERIA_STATES: Record<string, NigeriaState> = {
  Lagos: {
    bbox: [6.35, 6.75, 2.7, 4.05],
    hazards: {
      "Coastal Flooding": "H",
      "Storm Surge": "H",
      "Sea Level Rise": "H",
      "Heavy Rainfall": "H",
      "River Flooding": "H",
      "Flash Flooding": "H",
      "Coastal & Riverbank Erosion": "H",
      "Groundwater Flooding": "M",
      "Thunderstorms & Lightning": "M",
      "Extreme Heat": "M",
    },
  },
  Ekiti: {
    bbox: [7.15, 8.1, 4.85, 5.9],
    hazards: {
      "Thunderstorms & Lightning": "M",
      "Heavy Rainfall": "M",
      "Flash Flooding": "L",
      Landslides: "L",
    },
  },
  Osun: {
    bbox: [7.15, 8.2, 3.95, 5.0],
    hazards: {
      "Thunderstorms & Lightning": "M",
      "Heavy Rainfall": "M",
      "Flash Flooding": "L",
      "Extreme Heat": "L",
    },
  },
  Ogun: {
    bbox: [6.3, 7.95, 2.74, 4.2],
    hazards: {
      "Thunderstorms & Lightning": "M",
      "Heavy Rainfall": "M",
      "River Flooding": "M",
      "Flash Flooding": "L",
    },
  },
  Ondo: {
    bbox: [5.7, 7.9, 4.5, 6.1],
    hazards: {
      "Thunderstorms & Lightning": "M",
      "Heavy Rainfall": "H",
      "River Flooding": "M",
      "Flash Flooding": "L",
      "Coastal Flooding": "L",
    },
  },
  Oyo: {
    bbox: [7.15, 9.35, 2.9, 4.85],
    hazards: {
      "Extreme Heat": "M",
      "Thunderstorms & Lightning": "M",
      "Heavy Rainfall": "M",
      "Flash Flooding": "L",
      "Wildfire / Bushfire": "L",
    },
  },
  Bayelsa: {
    bbox: [4.2, 5.0, 5.6, 7.2],
    hazards: {
      "Heavy Rainfall": "H",
      "River Flooding": "H",
      "Coastal Flooding": "H",
      "Storm Surge": "H",
      "Coastal & Riverbank Erosion": "H",
      "Groundwater Flooding": "H",
      "Sea Level Rise": "H",
      "Thunderstorms & Lightning": "M",
      "Extreme Heat": "M",
    },
  },
  Rivers: {
    bbox: [4.3, 5.55, 6.5, 7.8],
    hazards: {
      "Heavy Rainfall": "H",
      "River Flooding": "H",
      "Coastal Flooding": "H",
      "Storm Surge": "H",
      "Coastal & Riverbank Erosion": "H",
      "Sea Level Rise": "H",
      "Flash Flooding": "M",
      "Groundwater Flooding": "M",
      "Thunderstorms & Lightning": "M",
      "Extreme Heat": "M",
    },
  },
  Delta: {
    bbox: [5.0, 6.6, 5.2, 7.0],
    hazards: {
      "Heavy Rainfall": "H",
      "River Flooding": "H",
      "Coastal Flooding": "H",
      "Coastal & Riverbank Erosion": "H",
      "Sea Level Rise": "H",
      "Storm Surge": "M",
      "Flash Flooding": "M",
      "Thunderstorms & Lightning": "M",
      "Extreme Heat": "M",
    },
  },
  "Akwa Ibom": {
    bbox: [4.4, 5.5, 7.3, 8.4],
    hazards: {
      "Heavy Rainfall": "H",
      "Coastal Flooding": "H",
      "Storm Surge": "H",
      "Sea Level Rise": "H",
      "River Flooding": "M",
      "Coastal & Riverbank Erosion": "M",
      "Thunderstorms & Lightning": "M",
      "Extreme Heat": "M",
    },
  },
  "Cross River": {
    bbox: [4.3, 6.9, 7.9, 9.5],
    hazards: {
      "Heavy Rainfall": "H",
      "River Flooding": "H",
      "Thunderstorms & Lightning": "M",
      "Flash Flooding": "M",
      Landslides: "M",
      "Coastal & Riverbank Erosion": "M",
      "Coastal Flooding": "L",
    },
  },
  Edo: {
    bbox: [5.75, 7.75, 5.1, 6.8],
    hazards: {
      "Thunderstorms & Lightning": "M",
      "Heavy Rainfall": "M",
      "River Flooding": "M",
      "Flash Flooding": "L",
      "Extreme Heat": "M",
    },
  },
  Imo: {
    bbox: [4.9, 5.9, 6.6, 7.6],
    hazards: {
      "Heavy Rainfall": "H",
      "Coastal & Riverbank Erosion": "H",
      "River Flooding": "M",
      "Flash Flooding": "M",
      "Thunderstorms & Lightning": "M",
    },
  },
  Abia: {
    bbox: [5.0, 5.85, 7.1, 7.95],
    hazards: {
      "Heavy Rainfall": "H",
      "Coastal & Riverbank Erosion": "H",
      "River Flooding": "M",
      "Flash Flooding": "M",
      "Thunderstorms & Lightning": "M",
    },
  },
  Anambra: {
    bbox: [5.7, 6.85, 6.5, 7.5],
    hazards: {
      "Heavy Rainfall": "H",
      "River Flooding": "H",
      "Coastal & Riverbank Erosion": "H",
      "Flash Flooding": "M",
      "Thunderstorms & Lightning": "M",
    },
  },
  Enugu: {
    bbox: [6.1, 7.2, 7.0, 8.0],
    hazards: {
      "Coastal & Riverbank Erosion": "H",
      "Heavy Rainfall": "M",
      "Flash Flooding": "M",
      "Thunderstorms & Lightning": "M",
    },
  },
  Ebonyi: {
    bbox: [5.7, 6.7, 7.7, 8.6],
    hazards: {
      "Heavy Rainfall": "H",
      "River Flooding": "H",
      "Flash Flooding": "M",
      "Coastal & Riverbank Erosion": "M",
      "Thunderstorms & Lightning": "M",
    },
  },
  FCT: {
    bbox: [8.4, 9.3, 6.7, 7.8],
    hazards: {
      "Extreme Heat": "M",
      "Thunderstorms & Lightning": "M",
      "Heavy Rainfall": "M",
      "Flash Flooding": "M",
      Drought: "L",
      "Wildfire / Bushfire": "L",
    },
  },
  Plateau: {
    bbox: [8.4, 10.5, 8.2, 10.5],
    hazards: {
      "Thunderstorms & Lightning": "H",
      "Heavy Rainfall": "H",
      "Flash Flooding": "H",
      Landslides: "M",
      "Wildfire / Bushfire": "L",
    },
  },
  Nasarawa: {
    bbox: [7.7, 9.1, 7.4, 9.3],
    hazards: {
      "Extreme Heat": "M",
      "Thunderstorms & Lightning": "M",
      "Heavy Rainfall": "M",
      "River Flooding": "M",
      "Flash Flooding": "M",
      "Wildfire / Bushfire": "L",
    },
  },
  Benue: {
    bbox: [6.4, 8.9, 7.8, 10.0],
    hazards: {
      "Heavy Rainfall": "H",
      "River Flooding": "H",
      "Flash Flooding": "M",
      "Thunderstorms & Lightning": "M",
      "Extreme Heat": "M",
      "Wildfire / Bushfire": "L",
    },
  },
  Kogi: {
    bbox: [6.5, 9.1, 5.6, 8.1],
    hazards: {
      "River Flooding": "H",
      "Heavy Rainfall": "M",
      "Flash Flooding": "M",
      "Thunderstorms & Lightning": "M",
      "Extreme Heat": "M",
      "Wildfire / Bushfire": "L",
    },
  },
  Niger: {
    bbox: [8.5, 11.7, 3.3, 7.5],
    hazards: {
      "River Flooding": "H",
      "Heavy Rainfall": "M",
      "Flash Flooding": "M",
      "Thunderstorms & Lightning": "M",
      "Extreme Heat": "M",
      Drought: "L",
      "Wildfire / Bushfire": "M",
    },
  },
  Kwara: {
    bbox: [7.9, 10.0, 3.0, 6.3],
    hazards: {
      "Extreme Heat": "M",
      "Thunderstorms & Lightning": "M",
      "Heavy Rainfall": "M",
      "River Flooding": "M",
      "Flash Flooding": "L",
      Drought: "L",
      "Wildfire / Bushfire": "M",
    },
  },
  Kano: {
    bbox: [11.1, 13.1, 7.7, 9.5],
    hazards: {
      "Extreme Heat": "H",
      Drought: "H",
      "Sandstorms / Harmattan": "H",
      "Flash Flooding": "H",
      "Heavy Rainfall": "M",
      Desertification: "M",
      "Water Scarcity": "M",
    },
  },
  Kaduna: {
    bbox: [9.0, 11.7, 6.5, 9.0],
    hazards: {
      "Extreme Heat": "M",
      "Thunderstorms & Lightning": "M",
      "Heavy Rainfall": "M",
      "Flash Flooding": "M",
      Drought: "L",
      "Sandstorms / Harmattan": "L",
      "Wildfire / Bushfire": "L",
    },
  },
  Katsina: {
    bbox: [11.9, 13.85, 6.5, 9.1],
    hazards: {
      "Extreme Heat": "H",
      Drought: "H",
      "Sandstorms / Harmattan": "H",
      Desertification: "H",
      "Water Scarcity": "H",
      "Flash Flooding": "L",
    },
  },
  Jigawa: {
    bbox: [11.3, 13.5, 9.0, 10.35],
    hazards: {
      "Extreme Heat": "H",
      Drought: "H",
      "Sandstorms / Harmattan": "H",
      Desertification: "H",
      "Water Scarcity": "H",
      "Flash Flooding": "M",
    },
  },
  Zamfara: {
    bbox: [11.4, 13.4, 4.5, 7.5],
    hazards: {
      "Extreme Heat": "H",
      "Sandstorms / Harmattan": "H",
      Drought: "M",
      Desertification: "M",
      "Water Scarcity": "M",
      "Flash Flooding": "L",
    },
  },
  Kebbi: {
    bbox: [10.9, 13.1, 3.3, 6.1],
    hazards: {
      "Extreme Heat": "H",
      Drought: "H",
      "Sandstorms / Harmattan": "H",
      "Water Scarcity": "H",
      "River Flooding": "M",
      Desertification: "M",
      "Flash Flooding": "L",
    },
  },
  Sokoto: {
    bbox: [11.2, 13.9, 4.0, 6.7],
    hazards: {
      "Extreme Heat": "H",
      Drought: "H",
      "Sandstorms / Harmattan": "H",
      Desertification: "H",
      "Water Scarcity": "H",
      "Flash Flooding": "L",
    },
  },
  Bauchi: {
    bbox: [9.3, 12.3, 8.9, 11.2],
    hazards: {
      "Extreme Heat": "M",
      "Thunderstorms & Lightning": "M",
      "Flash Flooding": "M",
      "Heavy Rainfall": "L",
      Drought: "L",
      "Sandstorms / Harmattan": "L",
    },
  },
  Gombe: {
    bbox: [9.4, 11.2, 10.0, 11.7],
    hazards: {
      "Extreme Heat": "H",
      Drought: "M",
      "Sandstorms / Harmattan": "M",
      "Flash Flooding": "L",
      "Thunderstorms & Lightning": "L",
    },
  },
  Adamawa: {
    bbox: [7.8, 10.9, 11.6, 13.7],
    hazards: {
      "Extreme Heat": "M",
      "Thunderstorms & Lightning": "M",
      "Heavy Rainfall": "M",
      "River Flooding": "M",
      "Flash Flooding": "L",
    },
  },
  Taraba: {
    bbox: [6.4, 9.5, 10.0, 12.9],
    hazards: {
      "Thunderstorms & Lightning": "M",
      "Heavy Rainfall": "H",
      "River Flooding": "M",
      "Flash Flooding": "M",
      "Extreme Heat": "L",
    },
  },
  Borno: {
    bbox: [10.0, 13.9, 11.7, 15.1],
    hazards: {
      "Extreme Heat": "H",
      Drought: "H",
      Desertification: "H",
      "Sandstorms / Harmattan": "H",
      "Water Scarcity": "H",
      "Wildfire / Bushfire": "M",
      "Flash Flooding": "L",
    },
  },
  Yobe: {
    bbox: [11.0, 13.9, 9.8, 13.0],
    hazards: {
      "Extreme Heat": "H",
      Drought: "H",
      Desertification: "H",
      "Sandstorms / Harmattan": "H",
      "Water Scarcity": "H",
      "Wildfire / Bushfire": "M",
      "Flash Flooding": "L",
    },
  },
};


function getLocationMatch(lat: number, lon: number): NigeriaLocation | null {
  let best: NigeriaLocation | null = null;
  let bestDist = Infinity;
  for (const loc of NIGERIA_LOCATIONS) {
    const d = Math.sqrt((lat - loc.lat) ** 2 + (lon - loc.lon) ** 2);
    if (d <= loc.radius && d < bestDist) {
      best = loc;
      bestDist = d;
    }
  }
  return best;
}

function getStateName(lat: number, lon: number): string | null {
  if (lat < 4.0 || lat > 14.0 || lon < 2.5 || lon > 15.5) return null;
  for (const [name, s] of Object.entries(NIGERIA_STATES)) {
    const [latMin, latMax, lonMin, lonMax] = s.bbox;
    if (lat >= latMin && lat <= latMax && lon >= lonMin && lon <= lonMax)
      return name;
  }
  return null;
}
export function getStateFromCoords(lat: number, lon: number): string | null {
  const loc = getLocationMatch(lat, lon);
  if (loc) return loc.state;
  return getStateName(lat, lon);
}
export function getNigeriaMatchInfo(
  lat: number,
  lon: number,
): { tier: "location" | "state"; name: string; state: string } | null {
  if (lat < 4.0 || lat > 14.0 || lon < 2.5 || lon > 15.5) return null;
  const loc = getLocationMatch(lat, lon);
  if (loc) return { tier: "location", name: loc.name, state: loc.state };
  const state = getStateName(lat, lon);
  if (state) return { tier: "state", name: state, state };
  return null;
}
export function getNigeriaBaseScores(
  lat: number,
  lon: number,
  risk: string,
): [number, number] | null {
  if (lat < 4.0 || lat > 14.0 || lon < 2.5 || lon > 15.5) return null;

  const loc = getLocationMatch(lat, lon);
  if (loc) {
    const lv = loc.hazards[risk];
    return lv ? NIGERIA_LEVEL_SCORES[lv] : NIGERIA_ABSENT_SCORES;
  }

  const state = getStateName(lat, lon);
  if (state) {
    const profile = NIGERIA_STATES[state];
    const lv = profile?.hazards[risk];
    return lv ? NIGERIA_LEVEL_SCORES[lv] : NIGERIA_ABSENT_SCORES;
  }

  return null; // within Nigeria bounding box but no state matched (lake / border edge)
}
export function getNigeriaHazardSuggestions(
  lat: number,
  lon: number,
): string[] | null {
  if (lat < 4.0 || lat > 14.0 || lon < 2.5 || lon > 15.5) return null;

  const loc = getLocationMatch(lat, lon);
  const hazards = loc
    ? loc.hazards
    : (NIGERIA_STATES[getStateName(lat, lon) ?? ""]?.hazards ?? null);

  if (!hazards) return null;
  return Object.entries(hazards)
    .filter(([, lv]) => lv === "H" || lv === "M")
    .map(([risk]) => risk);
}
export function getNigeriaStateInfo(
  lat: number,
  lon: number,
): {
  state: string;
  location?: string;
  hazardCount: number;
  topHazards: string[];
} | null {
  const info = getNigeriaMatchInfo(lat, lon);
  if (!info) return null;

  const loc = getLocationMatch(lat, lon);
  const hazards = loc
    ? loc.hazards
    : (NIGERIA_STATES[info.state]?.hazards ?? {});

  const topHazards = Object.entries(hazards)
    .filter(([, lv]) => lv === "H")
    .map(([risk]) => risk)
    .slice(0, 4);

  const count = Object.values(hazards).filter(
    (lv) => lv === "H" || lv === "M",
  ).length;

  return {
    state: info.state,
    location: info.tier === "location" ? info.name : undefined,
    hazardCount: count,
    topHazards,
  };
}
