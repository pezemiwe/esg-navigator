import codecs

content = '''import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
  Autocomplete,
  CircularProgress,
  ListItemText,
  Grid,
} from "@mui/material";
import { MapPin, Building2, DollarSign, ArrowRight } from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { SECTORS } from "../../domain/physicalRisk/constants";

/* -- Address suggestion from Nominatim -- */
interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/* -- Asset type groups -- */
const ASSET_GROUPS: Record<string, string[]> = {
  Buildings: [
    "Office Building",
    "Industrial Building",
    "Warehouse / Storage",
    "Retail Outlet / Branch",
    "Healthcare Facility",
    "Educational Facility",
    "Hospitality Building",
    "Religious / Assembly Hall",
    "Military / Security Post",
  ],
  "Critical Infrastructure": [
    "Data Centre",
    "Telecoms Mast / Tower",
    "Power Generation Plant",
    "Electrical Substation",
    "Transmission Line / Pylon",
    "Water Treatment Plant",
    "Water Distribution Network",
    "Server Room / Network Hub",
    "ATM / POS Terminal Network",
    "Broadcasting / Transmission Equipment",
  ],
  "Oil & Gas": [
    "Onshore Refinery / Process Plant",
    "LNG / LPG Terminal",
    "Offshore Platform",
    "Floating Production Vessel (FPSO)",
    "Storage Tank / Tank Farm",
    "Petrol Station / Depot",
    "Pipeline — Onshore",
    "Pipeline — Offshore / Subsea",
    "Underground Cable / Duct",
  ],
  Transport: [
    "Road / Bridge / Culvert",
    "Rail Track / Rail Infrastructure",
    "Port / Jetty / Quay",
    "Airport Terminal / Runway",
    "Vessel / Barge / Tug",
    "Vehicle Fleet / Rolling Stock",
  ],
  "Land & Agriculture": [
    "Cropland / Farmland",
    "Irrigation System",
    "Aquaculture Facility",
    "Plantation / Forest",
  ],
  "Mining & Processing": [
    "Mine / Quarry Site",
    "Mineral Processing Plant",
    "Tailings Dam / Waste Facility",
  ],
  Other: [
    "Outdoor Plant & Equipment",
    "Semi-outdoor Kiosk / Booth",
    "Open Yard / Storage Compound",
    "Solar Farm / Wind Farm",
    "Construction Site / Temporary Camp",
    "Modular / Prefabricated Unit",
  ],
};

/* Flatten for lookup */
const GROUPED_OPTIONS = Object.entries(ASSET_GROUPS).flatMap(([group, types]) =>
  types.map((t) => ({ group, type: t })),
);

export default function SingleAssetForm() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const {
    config,
    mappedAssets,
    setConfig,
    setMappedAssets,
    setActiveStep,
    setGeoConfidence,
  } = usePhysicalRiskStore();

  const existingAsset = mappedAssets[0];
  const [assetName, setAssetName] = useState(existingAsset?.name ?? "");
  const [address, setAddress] = useState(existingAsset?.region ?? "");
  const [assetType, setAssetType] = useState(existingAsset?.assetType ?? "");
  const [replValue, setReplValue] = useState(
    existingAsset?.value ? String(existingAsset.value) : "",
  );
  const [currency, setCurrency] = useState<"NGN" | "USD">(
    (config.currency as "NGN" | "USD") || "NGN",
  );
  const [sectorId, setSectorId] = useState(config.sectorId || "1");
  const [subsector, setSubsector] = useState(config.subsector || "");

  /* Address typeahead */
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<AddressSuggestion | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          format: "json",
          limit: "6",
          addressdetails: "1",
        });
        const res = await fetch(\\?\\, {
          headers: { "User-Agent": "GCB-ESG-Navigator/1.0" },
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(Array.isArray(data) ? data : []);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  /* Sector subsectors */
  const sectorDef = SECTORS[sectorId];
  const subsectors = useMemo(() => sectorDef?.subsectors ?? [], [sectorDef]);

  useEffect(() => {
    if (subsectors.length > 0 && !subsectors.includes(subsector)) {
      setSubsector(subsectors[0]);
    }
  }, [sectorId, subsectors, subsector]);

  const isValid =
    assetName.trim().length > 0 &&
    address.trim().length > 0 &&
    assetType.length > 0 &&
    parseFloat(replValue) > 0;

  const handleSubmit = async () => {
    if (!isValid) return;

    const lat = selectedSuggestion ? parseFloat(selectedSuggestion.lat) : 0;
    const lon = selectedSuggestion ? parseFloat(selectedSuggestion.lon) : 0;

    /* Save config */
    setConfig({
      sectorId,
      subsector,
      currency,
      matrixSize: 6,
    });

    /* Create single mapped asset */
    const asset = {
      id: \SA-\\,
      name: assetName.trim(),
      assetType,
      value: parseFloat(replValue),
      latitude: lat,
      longitude: lon,
      region: selectedSuggestion?.display_name ?? address,
      sector: sectorDef?.name ?? "",
    };

    setMappedAssets([asset]);

    /* If we already have a geocoded suggestion, pre-populate geoConfidence */
    if (selectedSuggestion) {
      /* Fetch elevation from open-elevation API */
      let elevation = 0;
      try {
        const elRes = await fetch(
          \https://api.opentopodata.org/v1/srtm90m?locations=\,\\,
        );
        if (elRes.ok) {
          const elData = await elRes.json();
          elevation = elData?.results?.[0]?.elevation ?? 0;
        }
      } catch {
        /* ignore */
      }

      const importance = selectedSuggestion.importance ?? 0;
      const level =
        importance > 0.7
          ? "Exact Address"
          : importance > 0.4
            ? "Street Level"
            : "City Level";

      const coastDist = Math.abs(
        lat - (lon >= 2 && lon < 5 ? 6 : lon >= 5 && lon < 10 ? 5 : 5.5),
      );
      const isCoastal = coastDist < 2.5;

      setGeoConfidence({
        lat,
        lon,
        elevation,
        isCoastal,
        isUrban:
          selectedSuggestion.type === "city" ||
          selectedSuggestion.type === "administrative",
        level,
        displayName: selectedSuggestion.display_name,
      });
    }

    setActiveStep(1);
  };

  const textFieldProps = {
    fullWidth: true,
    variant: "outlined" as const,
    InputProps: {
      sx: { borderRadius: "6px" }
    }
  };

  return (
    <Box sx={{ width: "100%", py: 4, px: 2 }}>
      <Box 
        sx={{ 
          maxWidth: 800, 
          mx: "auto", 
          bgcolor: "background.paper",
          boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
          borderRadius: 2,
          p: 5,
          border: "1px solid", 
          borderColor: "divider"
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "6px",
              background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Building2 size={24} color={isDark ? "#fff" : "#000"} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Single Asset Assessment
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", mt: 0.5 }}
            >
              Five fields. One click. Full climate risk report.
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={3}>
          {/* Row 1: Asset Name (6), Asset Type (6) */}
          <Grid item xs={12} sm={6}>
            <TextField
              {...textFieldProps}
              label="Asset Name"
              placeholder="e.g. Lagos Head Office"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={GROUPED_OPTIONS}
              groupBy={(opt) => opt.group}
              getOptionLabel={(opt) => opt.type}
              value={GROUPED_OPTIONS.find((o) => o.type === assetType) ?? null}
              onChange={(_, value) => setAssetType(value?.type ?? "")}
              renderInput={(params) => (
                <TextField
                  {...params}
                  {...textFieldProps}
                  label="Asset Type"
                  placeholder="Select building or facility type..."
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.type}>
                  <Typography variant="body2">{option.type}</Typography>
                </li>
              )}
            />
          </Grid>

          {/* Row 2: Street Address (12) */}
          <Grid item xs={12}>
            <Autocomplete
              freeSolo
              options={suggestions}
              getOptionLabel={(opt) =>
                typeof opt === "string" ? opt : opt.display_name
              }
              inputValue={address}
              onInputChange={(_, value) => {
                setAddress(value);
                fetchSuggestions(value);
              }}
              onChange={(_, value) => {
                if (value && typeof value !== "string") {
                  setSelectedSuggestion(value);
                  setAddress(value.display_name);
                }
              }}
              loading={loading}
              filterOptions={(x) => x}
              renderOption={(props, option) => (
                <li {...props} key={option.lat + option.lon}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <MapPin
                      size={16}
                      color={DELOITTE_COLORS.info}
                      style={{ marginTop: 3, flexShrink: 0 }}
                    />
                    <ListItemText
                      primary={option.display_name}
                      primaryTypographyProps={{ fontSize: 13, lineHeight: 1.4 }}
                    />
                  </Stack>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  {...textFieldProps}
                  label="Street Address"
                  placeholder="Start typing an address..."
                  InputProps={{
                    ...params.InputProps,
                    sx: textFieldProps.InputProps.sx,
                    startAdornment: (
                      <InputAdornment position="start">
                        <MapPin
                          size={18}
                          color={isDark ? "#6B7280" : "#9CA3AF"}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {loading && <CircularProgress size={18} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Row 3: Replacement Value (8) + Currency Toggle (4) */}
          <Grid item xs={12} sm={8}>
            <TextField
              {...textFieldProps}
              label="Replacement Value"
              type="number"
              value={replValue}
              onChange={(e) => setReplValue(e.target.value)}
              InputProps={{
                ...textFieldProps.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <DollarSign size={16} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: "flex", alignItems: "center" }}>
            <ToggleButtonGroup
              value={currency}
              exclusive
              onChange={(_, v) => v && setCurrency(v)}
              fullWidth
              sx={{
                height: "56px",
                "& .MuiToggleButton-root": {
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "6px !important",
                  borderColor: "divider",
                  "&.Mui-selected": {
                    bgcolor: isDark ? "rgba(255,255,255,0.1)": "rgba(0,0,0,0.05)",
                    color: "text.primary",
                  },
                },
              }}
            >
              <ToggleButton value="NGN">? NGN</ToggleButton>
              <ToggleButton value="USD">$ USD</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {/* Row 4: Sector (6) / Subsector (6) */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sector</InputLabel>
              <Select
                value={sectorId}
                label="Sector"
                onChange={(e) => setSectorId(e.target.value)}
                sx={{ borderRadius: "6px" }}
              >
                {Object.entries(SECTORS).map(([id, s]) => (
                  <MenuItem key={id} value={id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Subsector</InputLabel>
              <Select
                value={subsector}
                label="Subsector"
                onChange={(e) => setSubsector(e.target.value)}
                sx={{ borderRadius: "6px" }}
              >
                {subsectors.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* CTA Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 5 }}>
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            endIcon={<ArrowRight size={18} />}
            sx={{
              bgcolor: isValid ? "grey.900" : "action.disabledBackground",
              color: isValid ? "white" : "text.disabled",
              borderRadius: "6px",
              px: 4,
              py: 1.5,
              fontWeight: 600,
              fontSize: 15,
              textTransform: "none",
              "&:hover": isValid ? {
                bgcolor: "grey.800",
              } : {},
              "&.Mui-disabled": {
                bgcolor: "action.disabledBackground",
                color: "text.disabled",
              },
            }}
          >
            Geocode & Next Step
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
'''
with codecs.open("src/features/cra/steps/physical/SingleAssetForm.tsx", "w", "utf-8") as f:
    f.write(content)

