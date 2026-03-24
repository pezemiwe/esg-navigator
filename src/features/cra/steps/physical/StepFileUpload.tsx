import { useState, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Grid,
  Chip,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  LinearProgress,
  alpha,
  useTheme,
} from "@mui/material";
import { Upload, FileSpreadsheet, CheckCircle, MapPin } from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { batchGeocode } from "../../services/geocoding";
import type { MappedAsset } from "../../domain/physicalRisk/types";

function cleanNumeric(value: unknown): number {
  if (typeof value === "number") return value;
  const cleaned = String(value ?? "0")
    .trim()
    .replace(/[,\s]/g, "")
    .replace(/[₦$£€]/g, "")
    .replace(/NGN|USD|GHS|KES|ZAR/gi, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') inQuotes = !inQuotes;
      else if (ch === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else current += ch;
    }
    values.push(current.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    return row;
  });
}

const fmtVal = (value: number, currency?: string): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency === "USD" ? "USD" : "NGN",
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);

export default function StepFileUpload() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const {
    config,
    mappedAssets,
    geocodeProgress,
    setMappedAssets,
    setGeocodeProgress,
  } = usePhysicalRiskStore();
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const cardBg = isDark ? alpha("#0F1623", 0.85) : "#FFFFFF";
  const borderColor = isDark ? alpha("#fff", 0.1) : alpha("#000", 0.08);

  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(file.name);
      setParseError("");
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const text = ev.target?.result as string;
          const rows = parseCSV(text);
          if (rows.length === 0) {
            setParseError("File is empty or has no data rows.");
            return;
          }
          const requiredCols = ["asset_name", "asset_type", "address", "value"];
          const headers = Object.keys(rows[0]);
          const missing = requiredCols.filter((c) => !headers.includes(c));
          if (missing.length > 0) {
            setParseError(`Missing required columns: ${missing.join(", ")}`);
            return;
          }
          const mapped: MappedAsset[] = rows.map((row, idx) => {
            const rawValue = cleanNumeric(row.value);
            const currency = (row.currency || "").toUpperCase();
            const valueLocal =
              currency === "USD" ? rawValue * config.usdRate : rawValue;
            return {
              id: `asset_${idx}`,
              name: row.asset_name || `Asset ${idx + 1}`,
              assetType: row.asset_type || "Office Building",
              value: valueLocal,
              latitude: parseFloat(row.latitude || row.lat || "0") || 0,
              longitude: parseFloat(row.longitude || row.lon || "0") || 0,
              region: row.address || row.region || "",
              sector: row.sector || "",
            };
          });
          setMappedAssets(mapped);
        } catch (err) {
          setParseError(
            err instanceof Error ? err.message : "Failed to parse CSV",
          );
        }
      };
      reader.readAsText(file);
      if (e.target) e.target.value = "";
    },
    [config.usdRate, setMappedAssets],
  );

  const handleGeocode = useCallback(async () => {
    if (mappedAssets.length === 0) return;
    setIsGeocoding(true);
    setGeocodeProgress(0);
    try {
      const geoResults = await batchGeocode(
        mappedAssets.map((a) => ({
          address: a.region,
          lat: a.latitude,
          lon: a.longitude,
        })),
        (done, total) => setGeocodeProgress(Math.round((done / total) * 100)),
      );
      if (geoResults.size > 0) {
        const updated = mappedAssets.map((a, idx) => {
          const geo = geoResults.get(idx);
          if (geo) return { ...a, latitude: geo.lat, longitude: geo.lon };
          return a;
        });
        setMappedAssets(updated);
      }
    } catch {
      /* geocoding is best-effort */
    }
    setIsGeocoding(false);
    setGeocodeProgress(100);
  }, [mappedAssets, setMappedAssets, setGeocodeProgress]);

  const needsGeocode = mappedAssets.some(
    (a) => a.latitude === 0 && a.longitude === 0 && a.region.trim().length > 0,
  );

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          background: "linear-gradient(135deg, #1B3A5C 0%, #0F1623 100%)",
          color: "#fff",
          border: `1px solid ${alpha("#fff", 0.1)}`,
          borderRadius: 3,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha("#fff", 0.1),
              display: "flex",
            }}
          >
            <FileSpreadsheet size={24} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Upload Asset Register
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
              Import your physical asset portfolio as a CSV file. Required
              columns: asset_name, asset_type, address, value.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Upload area */}
      <Paper
        sx={{
          p: 3,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
        }}
      >
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Optional columns: latitude, longitude, currency, sector, floors,
            has_basement, build_year. Addresses will be automatically geocoded
            using OpenStreetMap Nominatim.
          </Typography>
          <input
            type="file"
            accept=".csv"
            ref={inputRef}
            style={{ display: "none" }}
            onChange={handleUpload}
          />
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="contained"
              startIcon={<Upload size={16} />}
              onClick={() => inputRef.current?.click()}
              sx={{
                bgcolor: DELOITTE_COLORS.green.DEFAULT,
                "&:hover": { bgcolor: DELOITTE_COLORS.green.dark },
              }}
            >
              Upload assets.csv
            </Button>
            {fileName && (
              <Stack direction="row" spacing={1} alignItems="center">
                <FileSpreadsheet
                  size={16}
                  color={DELOITTE_COLORS.green.DEFAULT}
                />
                <Typography variant="body2" fontWeight={500}>
                  {fileName}
                </Typography>
                {mappedAssets.length > 0 && (
                  <CheckCircle
                    size={16}
                    color={DELOITTE_COLORS.green.DEFAULT}
                  />
                )}
              </Stack>
            )}
          </Stack>
          {parseError && <Alert severity="error">{parseError}</Alert>}
        </Stack>
      </Paper>

      {/* Geocoding */}
      {mappedAssets.length > 0 && needsGeocode && (
        <Paper
          sx={{
            p: 3,
            bgcolor: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: 2,
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <MapPin size={18} color={DELOITTE_COLORS.info} />
              <Typography variant="subtitle1" fontWeight={700}>
                Auto-Geocode Addresses
              </Typography>
            </Stack>
            <Alert severity="info">
              {
                mappedAssets.filter(
                  (a) => a.latitude === 0 && a.longitude === 0,
                ).length
              }{" "}
              assets are missing coordinates. Click below to geocode them using
              their address field.
            </Alert>
            <Button
              variant="outlined"
              startIcon={<MapPin size={16} />}
              onClick={handleGeocode}
              disabled={isGeocoding}
              sx={{
                alignSelf: "flex-start",
                borderColor: DELOITTE_COLORS.info,
                color: DELOITTE_COLORS.info,
              }}
            >
              {isGeocoding
                ? `Geocoding... ${geocodeProgress}%`
                : "Geocode Missing Coordinates"}
            </Button>
            {isGeocoding && (
              <LinearProgress
                variant="determinate"
                value={geocodeProgress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: alpha(DELOITTE_COLORS.info, 0.15),
                  "& .MuiLinearProgress-bar": {
                    bgcolor: DELOITTE_COLORS.info,
                    borderRadius: 3,
                  },
                }}
              />
            )}
          </Stack>
        </Paper>
      )}

      {/* Asset summary */}
      {mappedAssets.length > 0 && (
        <>
          <Alert severity="success">
            {mappedAssets.length} assets loaded successfully
          </Alert>
          <Grid container spacing={2}>
            {[
              {
                label: "Total Assets",
                value: mappedAssets.length,
                color: DELOITTE_COLORS.green.DEFAULT,
              },
              {
                label: "Total Exposure",
                value: fmtVal(
                  mappedAssets.reduce((s, a) => s + a.value, 0),
                  config.currency,
                ),
                color: DELOITTE_COLORS.info,
              },
              {
                label: "Asset Types",
                value: new Set(mappedAssets.map((a) => a.assetType)).size,
                color: "#F59E0B",
              },
              {
                label: "With Coordinates",
                value: mappedAssets.filter(
                  (a) => a.latitude !== 0 || a.longitude !== 0,
                ).length,
                color: "#8B5CF6",
              },
            ].map((kpi) => (
              <Grid size={{ xs: 6, md: 3 }} key={kpi.label}>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: alpha(kpi.color, 0.08),
                    textAlign: "center",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {kpi.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {kpi.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Paper
            sx={{
              p: 2,
              bgcolor: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 2,
            }}
          >
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {[
                      "Name",
                      "Asset Type",
                      `Value (${config.currency})`,
                      "Coordinates",
                      "Address",
                    ].map((h) => (
                      <TableCell
                        key={h}
                        sx={{
                          fontWeight: 600,
                          bgcolor: isDark ? "#1B2838" : "#F8FAFC",
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mappedAssets.slice(0, 100).map((asset) => (
                    <TableRow
                      key={asset.id}
                      sx={{
                        "&:nth-of-type(even)": {
                          bgcolor: alpha(borderColor, 0.3),
                        },
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 200 }}
                        >
                          {asset.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={asset.assetType}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {fmtVal(asset.value, config.currency)}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color={
                            asset.latitude === 0 && asset.longitude === 0
                              ? "error"
                              : "text.secondary"
                          }
                        >
                          {asset.latitude === 0 && asset.longitude === 0
                            ? "Missing"
                            : `${asset.latitude.toFixed(4)}, ${asset.longitude.toFixed(4)}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 200 }}
                        >
                          {asset.region}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {mappedAssets.length > 100 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block", textAlign: "center" }}
              >
                Showing first 100 of {mappedAssets.length} assets
              </Typography>
            )}
          </Paper>
        </>
      )}
    </Stack>
  );
}
