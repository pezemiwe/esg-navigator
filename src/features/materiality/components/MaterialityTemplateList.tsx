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
} from "@mui/material";
import { Info } from "lucide-react";
import { useMaterialityStore } from "@/store/materialityStore";
import { useShallow } from "zustand/react/shallow";
import { sampleUsers } from "@/config/sampleUsers";

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
  approvalStatus?: "Draft" | "Submitted" | "Approved";
  isCustom?: boolean;
}

interface MaterialityTemplateListProps {
  topics: MaterialTopic[];
}

interface MetricInputRowProps {
  row: {
    id: string;
    name: string;
    unit: string;
    desc?: string;
  };
  topicId: string;
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

export const MaterialityTemplateList: React.FC<
  MaterialityTemplateListProps
> = ({ topics }) => {
  const { inputs, updateInput, assignTopic } = useMaterialityStore(
    useShallow((state) => ({
      inputs: state.inputs,
      updateInput: state.updateInput,
      assignTopic: state.assignTopic,
    })),
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
      {topics.map((topic) => (
        <Card key={topic.id} variant="outlined">
          <CardHeader
            title={topic.name}
            subheader={topic.description}
            titleTypographyProps={{ variant: "h6", fontWeight: "bold" }}
            sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}
            action={
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
                  {sampleUsers.map((user) => (
                    <MenuItem key={user.email} value={user.name}>
                      {user.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            }
          />
          <CardContent sx={{ p: 0 }}>
            <TableContainer component={Paper} elevation={0}>
              <Table sx={{ minWidth: 650 }} aria-label="data input table">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                    <TableCell width="30%" sx={{ fontWeight: "bold" }}>
                      Metric
                    </TableCell>
                    <TableCell width="15%" sx={{ fontWeight: "bold" }}>
                      Unit
                    </TableCell>
                    <TableCell width="15%" sx={{ fontWeight: "bold" }}>
                      Year
                    </TableCell>
                    <TableCell width="15%" sx={{ fontWeight: "bold" }}>
                      Month
                    </TableCell>
                    <TableCell width="25%" sx={{ fontWeight: "bold" }}>
                      Value
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topic.dataNeeds.map((item) => {
                    const isObj = isTemplateMetric(item);
                    const metricName = isObj ? item.name : item;
                    const unit = isObj ? item.unit : "Unit";
                    const id = isObj ? item.id : item; // fallback ID if string
                    const description = isObj ? item.description : "";

                    const rowsToRender =
                      isObj && item.breakdown
                        ? item.breakdown.map((b) => ({
                            id: `${id}-${b}`,
                            name: `${metricName} - ${b}`,
                            unit: unit,
                            desc: description,
                          }))
                        : [{ id, name: metricName, unit, desc: description }];

                    return rowsToRender.map((row) => (
                      <MetricInputRow
                        key={row.id}
                        row={{ ...row }}
                        topicId={topic.id}
                        getVal={getInputValue}
                        onUpdate={handleInputChange}
                      />
                    ));
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

// Extracted Row Component to handle internal state (like selected year/month)
const MetricInputRow = ({
  row,
  topicId,
  getVal,
  onUpdate,
}: MetricInputRowProps) => {
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("January");

  return (
    <TableRow hover>
      <TableCell component="th" scope="row">
        <Box display="flex" alignItems="center" gap={1}>
          {row.name}
          {row.desc && (
            <Tooltip title={row.desc}>
              <Info size={14} color="#64748b" />
            </Tooltip>
          )}
        </Box>
      </TableCell>
      <TableCell>{row.unit}</TableCell>
      <TableCell>
        <TextField
          select
          size="small"
          fullWidth
          value={year}
          onChange={(e) => setYear(e.target.value)}
          variant="standard"
          InputProps={{ disableUnderline: true }}
        >
          {["2024", "2025"].map((y) => (
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
        >
          {MONTHS.map((m) => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>
      <TableCell>
        <TextField
          fullWidth
          size="small"
          placeholder="Enter Value"
          value={getVal(topicId, row.id, year, month)}
          onChange={(e) =>
            onUpdate(topicId, row.id, e.target.value, year, month)
          }
          InputProps={{
            startAdornment: <InputAdornment position="start">#</InputAdornment>,
          }}
        />
      </TableCell>
    </TableRow>
  );
};
