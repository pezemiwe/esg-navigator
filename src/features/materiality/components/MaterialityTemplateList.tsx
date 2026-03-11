import React, { useState } from "react";
import {
  Box,
  TextField,
  Card,
  CardContent,
  CardHeader,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Tooltip,
  Chip,
  Typography,
  Button,
  Alert,
} from "@mui/material";
import { Info } from "lucide-react";
import { useMaterialityStore } from "@/store/materialityStore";
import { useShallow } from "zustand/react/shallow";
import { sampleUsers } from "@/config/sampleUsers";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/config/permissions.config";
import { SASB_INDUSTRY_METRICS } from "@/config/sasb.config";
import { useSustainabilityStore } from "@/store/sustainabilityStore";

// Local interface matching config/fmn_templates.ts
interface TemplateMetric {
  id: string;
  name: string;
  unit: string;
  breakdown?: string[];
  description?: string;
  category?: string;
}

interface MaterialTopic {
  id: string;
  name: string;
  description: string;
  dataNeeds: (TemplateMetric | string)[]; // Supports TemplateMetric[]
  status: "data-driven" | "partial" | "required";
  selected: boolean;
  assignedUserId?: string;
  approvalStatus?:
    | "Draft"
    | "Submitted"
    | "Manager Approved"
    | "Internal Audit Approved"
    | "Board Approved";
  isCustom?: boolean;
}

interface MaterialityTemplateListProps {
  topics: MaterialTopic[];
  showSubmitActions?: boolean;
  footerActions?: React.ReactNode;
  footerLeading?: React.ReactNode;
  forceReadOnly?: boolean;
}

interface MetricInputRowProps {
  row: {
    id: string;
    name: string;
    unit: string;
    desc?: string;
    isDiscussion?: boolean;
    code?: string;
  };
  topicId: string;
  yearOptions?: string[];
  showCode?: boolean;
  disabled?: boolean;
  getVal: (
    topicId: string,
    metricId: string,
    year: string,
    month: string,
  ) => string;
  onUpdate: (
    topicId: string,
    metricId: string,
    value: string,
    year: string,
    month: string,
  ) => void;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function isTemplateMetric(item: unknown): item is TemplateMetric {
  return !!(item && typeof item === "object" && "id" in item);
}

/** Split a unit string by commas that are outside parentheses */
function splitUnits(unitStr: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of unitStr) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/**
 * If a metric contains (1) (2) (3)... patterns, split it into individual
 * sub-rows, each sharing the same code and cycling through unit parts.
 */
function expandMetricRows(row: {
  id: string;
  name: string;
  unit: string;
  code: string;
  isDiscussion: boolean;
}): (typeof row)[] {
  if (!/\(\d+\)/.test(row.name)) return [row];
  const rawParts = row.name
    .split(/\(\d+\)\s*/)
    .map((s) => s.replace(/,?\s*$/, "").trim())
    .filter(Boolean);
  if (rawParts.length < 2) return [row];
  const unitParts = splitUnits(row.unit);
  return rawParts.map((part, i) => ({
    ...row,
    id: `${row.id}-${i + 1}`,
    name: part,
    unit: unitParts[i] ?? unitParts[unitParts.length - 1] ?? row.unit,
  }));
}

export const MaterialityTemplateList: React.FC<
  MaterialityTemplateListProps
> = ({
  topics,
  showSubmitActions = true,
  footerActions,
  footerLeading,
  forceReadOnly = false,
}) => {
  const { inputs, updateInput, assignTopic, submitTopicForApproval } =
    useMaterialityStore(
      useShallow((state) => ({
        inputs: state.inputs,
        updateInput: state.updateInput,
        assignTopic: state.assignTopic,
        submitTopicForApproval: state.submitTopicForApproval,
      })),
    );
  const { user } = useAuthStore();
  const entityProfile = useSustainabilityStore((s) => s.entityProfile);

  const canAssign =
    !forceReadOnly &&
    user?.role !== UserRole.DATA_OWNER &&
    user?.role !== UserRole.SUSTAINABILITY_APPROVER;

  // Build lookup: topicName → SasbMetric[] from all selected industries
  const selectedIndustries = entityProfile.sasbIndustries?.length
    ? entityProfile.sasbIndustries
    : entityProfile.sasbIndustry
      ? [entityProfile.sasbIndustry]
      : [];

  const sasbMetricsByTopic = React.useMemo(() => {
    const map: Record<
      string,
      {
        id: string;
        name: string;
        unit: string;
        code: string;
        isDiscussion: boolean;
      }[]
    > = {};
    selectedIndustries.forEach((ind) => {
      (SASB_INDUSTRY_METRICS[ind] ?? []).forEach((m) => {
        if (!map[m.topic]) map[m.topic] = [];
        map[m.topic].push({
          id: m.code,
          name: m.metric,
          unit: m.unit,
          code: m.code,
          isDiscussion: m.category === "Discussion and Analysis",
        });
      });
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndustries.join(",")]);

  const currentYear = new Date().getFullYear();
  const YEAR_OPTIONS = Array.from({ length: 7 }, (_, i) =>
    String(currentYear - i),
  );

  const handleInputChange = (
    topicId: string,
    metricId: string,
    value: string,
    year: string,
    month: string,
  ) => {
    const inputId = `${topicId}-${metricId}-${year}-${month}`;
    updateInput({
      id: inputId,
      topicId,
      metric: metricId,
      unit: "N/A",
      period: `${month} ${year}`,
      value: value,
    });
  };

  const getInputValue = (
    topicId: string,
    metricId: string,
    year: string,
    month: string,
  ) => {
    const inputId = `${topicId}-${metricId}-${year}-${month}`;
    const input = inputs.find((i) => i.id === inputId);
    return input ? String(input.value) : "";
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {topics.map((topic) => {
        const sasbRows = sasbMetricsByTopic[topic.name];
        const hasSasbRows = sasbRows && sasbRows.length > 0;
        // Expand (1)(2)(3) metrics into individual rows
        const expandedSasbRows = hasSasbRows
          ? sasbRows.flatMap(expandMetricRows)
          : [];
        const isSubmitted =
          topic.approvalStatus === "Submitted" ||
          topic.approvalStatus === "Manager Approved" ||
          topic.approvalStatus === "Internal Audit Approved" ||
          topic.approvalStatus === "Board Approved";
        const isDisabled = isSubmitted || forceReadOnly;

        // --- Validation: all non-discussion rows must have a non-empty value ---
        // We check inputs using the same key format as handleInputChange:
        // `${topicId}-${metricId}-${year}-${month}` — but since MetricInputRow
        // owns the year/month state internally, we check that at least one
        // input entry for the topic has a non-empty value per required row.
        // More practically: every row whose id is in expandedSasbRows / dataNeeds
        // must have at least one stored input entry with a non-empty value.
        const requiredRowIds: string[] = hasSasbRows
          ? expandedSasbRows.filter((r) => !r.isDiscussion).map((r) => r.id)
          : (topic.dataNeeds ?? []).flatMap((item) => {
              const isObj = isTemplateMetric(item);
              const id = isObj ? item.id : (item as string);
              if (isObj && item.breakdown) {
                return item.breakdown.map((b) => `${id}-${b}`);
              }
              return [id];
            });

        const hasAllValues =
          requiredRowIds.length === 0 ||
          requiredRowIds.every((rowId) =>
            inputs.some(
              (inp) =>
                inp.topicId === topic.id &&
                inp.metric === rowId &&
                String(inp.value).trim() !== "",
            ),
          );

        return (
          <Card key={topic.id} variant="outlined">
            <CardHeader
              title={topic.name}
              subheader={topic.description}
              titleTypographyProps={{ variant: "h6", fontWeight: "bold" }}
              sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}
              action={
                canAssign ? (
                  <Box sx={{ minWidth: 200, mr: 2, mt: 1 }}>
                    <TextField
                      select
                      label="Assign To"
                      size="small"
                      fullWidth
                      value={topic.assignedUserId || ""}
                      onChange={(e) => assignTopic(topic.id, e.target.value)}
                      variant="outlined"
                      sx={{ bgcolor: "white" }}
                    >
                      <MenuItem value="">
                        <em>Unassigned</em>
                      </MenuItem>
                      {sampleUsers.map((u) => (
                        <MenuItem key={u.email} value={u.name}>
                          {u.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                ) : undefined
              }
            />
            <CardContent sx={{ p: 0 }}>
              <TableContainer component={Paper} elevation={0}>
                <Table sx={{ minWidth: 650 }} aria-label="data input table">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          maxWidth: 200,
                          minWidth: 120,
                        }}
                      >
                        Metric
                      </TableCell>
                      {hasSasbRows && (
                        <TableCell
                          sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
                        >
                          Code
                        </TableCell>
                      )}
                      <TableCell sx={{ fontWeight: "bold" }}>Unit</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Year</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Month</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hasSasbRows
                      ? expandedSasbRows.map((row) => (
                          <MetricInputRow
                            key={row.id}
                            row={row}
                            topicId={topic.id}
                            getVal={getInputValue}
                            onUpdate={handleInputChange}
                            yearOptions={YEAR_OPTIONS}
                            showCode
                            disabled={isDisabled}
                          />
                        ))
                      : (topic.dataNeeds ?? []).map((item) => {
                          const isObj = isTemplateMetric(item);
                          const metricName = isObj ? item.name : item;
                          const unit = isObj ? item.unit : "Unit";
                          const id = isObj ? item.id : (item as string);
                          const description = isObj ? item.description : "";

                          const rowsToRender =
                            isObj && item.breakdown
                              ? item.breakdown.map((b) => ({
                                  id: `${id}-${b}`,
                                  name: `${metricName} - ${b}`,
                                  unit,
                                  desc: description,
                                }))
                              : [
                                  {
                                    id,
                                    name: metricName as string,
                                    unit,
                                    desc: description as string,
                                  },
                                ];

                          return rowsToRender.map((row) => (
                            <MetricInputRow
                              key={row.id}
                              row={row}
                              topicId={topic.id}
                              getVal={getInputValue}
                              onUpdate={handleInputChange}
                              yearOptions={YEAR_OPTIONS}
                              disabled={isDisabled}
                            />
                          ));
                        })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
            {(showSubmitActions || footerActions || footerLeading) && (
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderTop: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                {/* Left side */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {footerLeading}
                  {showSubmitActions && !isSubmitted && !hasAllValues && (
                    <Alert severity="warning" sx={{ py: 0 }}>
                      Please enter a value for every metric before submitting.
                    </Alert>
                  )}
                </Box>
                {/* Right side */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {showSubmitActions && (
                    <Button
                      variant="contained"
                      size="small"
                      disabled={isSubmitted || !hasAllValues}
                      onClick={() => {
                        if (!hasAllValues) return;
                        submitTopicForApproval(topic.id);
                      }}
                      sx={{
                        bgcolor:
                          isSubmitted || !hasAllValues ? undefined : "#86BC25",
                        "&:hover": {
                          bgcolor:
                            isSubmitted || !hasAllValues
                              ? undefined
                              : "#6ea01e",
                        },
                        textTransform: "none",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {isSubmitted ? "Submitted" : "Submit for Approval"}
                    </Button>
                  )}
                  {footerActions}
                </Box>
              </Box>
            )}
          </Card>
        );
      })}
    </Box>
  );
};

// Extracted Row Component to handle internal state (like selected year/month)
const MetricInputRow = ({
  row,
  topicId,
  getVal,
  onUpdate,
  yearOptions = ["2025", "2024"],
  showCode = false,
  disabled = false,
}: MetricInputRowProps) => {
  const [year, setYear] = useState(yearOptions[0]);
  const [month, setMonth] = useState("January");

  return (
    <TableRow
      hover
      sx={disabled ? { opacity: 0.7, bgcolor: "action.hover" } : {}}
    >
      <TableCell
        component="th"
        scope="row"
        sx={{ maxWidth: 200, whiteSpace: "normal", wordBreak: "break-word" }}
      >
        {" "}
        <Box
          display="flex"
          alignItems="flex-start"
          gap={1}
          flexDirection="column"
        >
          <Box display="flex" alignItems="center" gap={1}>
            {row.name.charAt(0).toUpperCase() + row.name.slice(1)}
            {row.desc && (
              <Tooltip title={row.desc}>
                <Info size={14} color="#64748b" />
              </Tooltip>
            )}
          </Box>
          {row.isDiscussion && (
            <Chip
              label="Discussion & Analysis"
              size="small"
              sx={{
                fontSize: 10,
                height: 18,
                bgcolor: "#e0f2fe",
                color: "#0369a1",
              }}
            />
          )}
        </Box>
      </TableCell>
      {showCode && (
        <TableCell>
          {row.code && (
            <Typography
              variant="caption"
              sx={{
                fontFamily: "monospace",
                bgcolor: "#f1f5f9",
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                whiteSpace: "nowrap",
              }}
            >
              {row.code}
            </Typography>
          )}
        </TableCell>
      )}
      <TableCell sx={{ whiteSpace: "nowrap", fontSize: 12, color: "#64748b" }}>
        {row.unit}
      </TableCell>
      <TableCell>
        <TextField
          select
          size="small"
          fullWidth
          value={year}
          onChange={(e) => setYear(e.target.value)}
          variant="standard"
          InputProps={{ disableUnderline: true }}
          disabled={disabled}
        >
          {yearOptions.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>
      <TableCell>
        <TextField
          select
          size="small"
          fullWidth
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          variant="standard"
          InputProps={{ disableUnderline: true }}
          disabled={disabled}
        >
          {MONTHS.map((m) => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>
      <TableCell>
        {row.isDiscussion ? (
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={2}
            placeholder="Enter description or analysis..."
            value={getVal(topicId, row.id, year, month)}
            onChange={(e) =>
              onUpdate(topicId, row.id, e.target.value, year, month)
            }
            disabled={disabled}
            InputProps={{ readOnly: disabled }}
          />
        ) : (
          <TextField
            fullWidth
            size="small"
            placeholder="Enter Value"
            value={getVal(topicId, row.id, year, month)}
            onChange={(e) =>
              onUpdate(topicId, row.id, e.target.value, year, month)
            }
            disabled={disabled}
            InputProps={{
              readOnly: disabled,
              startAdornment: (
                <InputAdornment position="start">#</InputAdornment>
              ),
            }}
          />
        )}
      </TableCell>
    </TableRow>
  );
};
