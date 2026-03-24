import { useCallback, useRef, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  Grid,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  alpha,
  useTheme,
  Tooltip,
} from "@mui/material";
import { Grid3x3, Upload, FileSpreadsheet, CheckCircle } from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { ALL_21_RISKS } from "../../domain/physicalRisk/constants";
import { suggestRisksForAsset } from "../../domain/physicalRisk/engine";
import type { ScreeningEntry } from "../../domain/physicalRisk/types";

const RISK_CAT_COLORS: Record<string, string> = {
  Meteorological: "#F59E0B",
  Hydrological: "#3B82F6",
  Climatological: "#10B981",
  Geophysical: "#8B5CF6",
};

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

export default function StepRiskScreening() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { mappedAssets, identifiedRisks, screening, setScreening } =
    usePhysicalRiskStore();
  const [csvFileName, setCsvFileName] = useState("");
  const [csvError, setCsvError] = useState("");
  const csvRef = useRef<HTMLInputElement>(null);

  const cardBg = isDark ? alpha("#0F1623", 0.85) : "#FFFFFF";
  const borderColor = isDark ? alpha("#fff", 0.1) : alpha("#000", 0.08);

  const selectedRisks = ALL_21_RISKS.filter((r) =>
    identifiedRisks.includes(r.risk),
  );

  const isScreenedIn = (assetName: string, riskName: string): boolean => {
    const entry = screening.find((s) => s.assetName === assetName);
    return entry?.risks.includes(riskName) ?? false;
  };

  const toggleCell = (assetId: string, assetName: string, riskName: string) => {
    const existing = screening.find((s) => s.assetName === assetName);
    if (existing) {
      const updated = screening.map((s) => {
        if (s.assetName !== assetName) return s;
        const hasRisk = s.risks.includes(riskName);
        return {
          ...s,
          risks: hasRisk
            ? s.risks.filter((r) => r !== riskName)
            : [...s.risks, riskName],
        };
      });
      setScreening(updated);
    } else {
      setScreening([...screening, { assetId, assetName, risks: [riskName] }]);
    }
  };

  const handleAutoScreen = () => {
    const entries: ScreeningEntry[] = mappedAssets.map((asset) => {
      const suggested = suggestRisksForAsset(asset.latitude, asset.longitude);
      const filtered = suggested.filter((r) => identifiedRisks.includes(r));
      return { assetId: asset.id, assetName: asset.name, risks: filtered };
    });
    setScreening(entries.filter((e) => e.risks.length > 0));
  };

  const handleSelectAll = () => {
    const riskNames = selectedRisks.map((r) => r.risk);
    const entries: ScreeningEntry[] = mappedAssets.map((asset) => ({
      assetId: asset.id,
      assetName: asset.name,
      risks: [...riskNames],
    }));
    setScreening(entries);
  };

  const handleClearAll = () => setScreening([]);

  const handleCsvUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setCsvFileName(file.name);
      setCsvError("");
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const text = ev.target?.result as string;
          const rows = parseCSV(text);
          if (rows.length === 0) {
            setCsvError("File is empty.");
            return;
          }
          if (!Object.keys(rows[0]).includes("asset_name")) {
            setCsvError("screening.csv must have an 'asset_name' column.");
            return;
          }
          const allRiskNames = ALL_21_RISKS.map((r) => r.risk);
          const entries: ScreeningEntry[] = rows.map((row, idx) => {
            const assetName = row.asset_name || "";
            const matched = mappedAssets.find((a) => a.name === assetName);
            const screened = allRiskNames.filter(
              (risk) =>
                risk in row && String(row[risk]).trim().toUpperCase() === "Y",
            );
            return {
              assetId: matched?.id || `asset_${idx}`,
              assetName,
              risks: screened,
            };
          });
          setScreening(entries.filter((e) => e.risks.length > 0));
        } catch (err) {
          setCsvError(
            err instanceof Error ? err.message : "Failed to parse CSV",
          );
        }
      };
      reader.readAsText(file);
      if (e.target) e.target.value = "";
    },
    [mappedAssets, setScreening],
  );

  const totalCombinations = screening.reduce((s, e) => s + e.risks.length, 0);

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
            <Grid3x3 size={24} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Risk Screening Matrix
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
              Map which climate risks apply to each asset. Toggle cells or
              upload a screening CSV.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Actions */}
      <Paper
        sx={{
          p: 2,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          flexWrap="wrap"
          useFlexGap
          alignItems="center"
        >
          <Button
            variant="contained"
            onClick={handleAutoScreen}
            sx={{
              bgcolor: DELOITTE_COLORS.green.DEFAULT,
              "&:hover": { bgcolor: DELOITTE_COLORS.green.dark },
            }}
          >
            Auto-Screen by Location
          </Button>
          <Button variant="outlined" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button variant="outlined" color="error" onClick={handleClearAll}>
            Clear All
          </Button>
          <input
            type="file"
            accept=".csv"
            ref={csvRef}
            style={{ display: "none" }}
            onChange={handleCsvUpload}
          />
          <Button
            variant="outlined"
            startIcon={<Upload size={14} />}
            onClick={() => csvRef.current?.click()}
          >
            Upload screening.csv
          </Button>
          {csvFileName && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <FileSpreadsheet
                size={14}
                color={DELOITTE_COLORS.green.DEFAULT}
              />
              <Typography variant="caption">{csvFileName}</Typography>
              <CheckCircle size={14} color={DELOITTE_COLORS.green.DEFAULT} />
            </Stack>
          )}
          <Box sx={{ flex: 1 }} />
          <Chip
            label={`${totalCombinations} combinations`}
            color={totalCombinations > 0 ? "success" : "default"}
            sx={{ fontWeight: 600 }}
          />
        </Stack>
        {csvError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {csvError}
          </Alert>
        )}
      </Paper>

      {/* KPI cards */}
      {totalCombinations > 0 && (
        <Grid container spacing={2}>
          {[
            {
              label: "Assets Screened",
              value: screening.length,
              color: DELOITTE_COLORS.green.DEFAULT,
            },
            {
              label: "Unique Risks",
              value: new Set(screening.flatMap((s) => s.risks)).size,
              color: DELOITTE_COLORS.info,
            },
            {
              label: "Total Combinations",
              value: totalCombinations,
              color: "#F59E0B",
            },
          ].map((kpi) => (
            <Grid size={{ xs: 4 }} key={kpi.label}>
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
      )}

      {/* Screening matrix */}
      {mappedAssets.length > 0 && selectedRisks.length > 0 && (
        <Paper
          sx={{
            bgcolor: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      minWidth: 160,
                      bgcolor: isDark ? "#1B2838" : "#F8FAFC",
                      position: "sticky",
                      left: 0,
                      zIndex: 3,
                    }}
                  >
                    Asset
                  </TableCell>
                  {selectedRisks.map((risk) => (
                    <TableCell
                      key={risk.id}
                      align="center"
                      sx={{
                        fontWeight: 600,
                        fontSize: 10,
                        minWidth: 60,
                        maxWidth: 80,
                        bgcolor: isDark ? "#1B2838" : "#F8FAFC",
                        borderLeft: `2px solid ${RISK_CAT_COLORS[risk.category] || "#888"}`,
                        whiteSpace: "normal",
                        lineHeight: 1.2,
                        p: 0.5,
                      }}
                    >
                      <Tooltip title={risk.definition} arrow placement="top">
                        <span>{risk.risk}</span>
                      </Tooltip>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {mappedAssets.slice(0, 100).map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell
                      sx={{
                        position: "sticky",
                        left: 0,
                        zIndex: 1,
                        bgcolor: isDark ? alpha("#0F1623", 0.95) : "#FFFFFF",
                      }}
                    >
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        {asset.name}
                      </Typography>
                    </TableCell>
                    {selectedRisks.map((risk) => {
                      const checked = isScreenedIn(asset.name, risk.risk);
                      return (
                        <TableCell key={risk.id} align="center" sx={{ p: 0 }}>
                          <Checkbox
                            size="small"
                            checked={checked}
                            onChange={() =>
                              toggleCell(asset.id, asset.name, risk.risk)
                            }
                            sx={{
                              p: 0.3,
                              color: alpha(
                                RISK_CAT_COLORS[risk.category] || "#888",
                                0.4,
                              ),
                              "&.Mui-checked": {
                                color: RISK_CAT_COLORS[risk.category] || "#888",
                              },
                            }}
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {mappedAssets.length > 100 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ p: 1, display: "block", textAlign: "center" }}
            >
              Showing first 100 of {mappedAssets.length} assets in matrix
            </Typography>
          )}
        </Paper>
      )}

      {selectedRisks.length === 0 && (
        <Alert severity="warning">
          No risks selected. Go back to Step 2 to identify relevant climate
          risks.
        </Alert>
      )}
    </Stack>
  );
}
