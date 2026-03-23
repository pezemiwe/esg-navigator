import React, { useMemo } from "react";
import MaterialityLayout from "./layout/MaterialityLayout";
import { Box, Typography, Grid, Paper, Stack } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
  Legend,
  Tooltip,
} from "recharts";
import { KPI_DATA } from "./data/sfiData";

const BRAND_GREEN = "#86BC25";
const BRAND_BLACK = "#000000";
const BRAND_GREY = "#f5f5f5";
const PIE_COLORS = [BRAND_GREEN, BRAND_BLACK, "#616161", "#bdbdbd"];
const RISK_COLORS: Record<string, string> = {
  "Category A: High Risk": "#c62828",
  "Category B: Moderate Risk": BRAND_BLACK,
  "Category C: Low Risk": "#2e7d32",
};
const PROCEEDS_COLORS = [
  "#1b5e20",
  "#2e7d32",
  "#388e3c",
  "#43a047",
  "#4caf50",
  "#66bb6a",
  "#81c784",
  "#a5d6a7",
  "#c8e6c9",
  "#e8f5e9",
  "#f1f8e9",
];
const ESG_COLORS = [
  BRAND_BLACK,
  BRAND_GREEN,
  "#424242",
  "#757575",
  "#616161",
  "#9e9e9e",
  "#bdbdbd",
];

const KpiCard = ({
  title,
  value,
}: {
  title: string;
  value: React.ReactNode;
}) => (
  <Paper
    elevation={0}
    square
    sx={{
      bgcolor: "#ffffff",
      height: "100%",
      border: "1px solid #e0e0e0",
      minHeight: 130,
      display: "flex",
      flexDirection: "column",
    }}
  >
    <Box
      bgcolor={BRAND_BLACK}
      py={1.5}
      px={2}
      borderBottom={`4px solid ${BRAND_GREEN}`}
    >
      <Typography
        variant="subtitle2"
        color={BRAND_GREEN}
        align="center"
        fontWeight="bold"
        noWrap={false}
        sx={{
          fontSize: "0.65rem",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          lineHeight: 1.4,
        }}
      >
        {title}
      </Typography>
    </Box>
    <Box
      flex={1}
      display="flex"
      justifyContent="center"
      alignItems="center"
      px={1.5}
      py={2}
    >
      <Typography
        fontWeight="bold"
        align="center"
        sx={{
          color: "#212121",
          fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" },
          wordBreak: "break-word",
          width: "100%",
        }}
      >
        {value}
      </Typography>
    </Box>
  </Paper>
);

const toMillions = (val: number) => val / 1000000;
const fmtS = (val: number) =>
  "₦" + val.toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtNum = (val: number) =>
  val.toLocaleString("en-US", { maximumFractionDigits: 0 });

const TOTAL_LOAN_PORTFOLIO_MILLIONS = 1200000;

export default function MaterialityDashboard() {
  const regionData = useMemo(
    () =>
      Object.entries(KPI_DATA.regionBreakdown || {})
        .map(([name, value]) => ({
          name,
          value,
        }))
        .sort((a, b) => b.value - a.value),
    [],
  );
  const esgData = useMemo(
    () =>
      Object.entries(KPI_DATA.esgCategoryBreakdown || {})
        .map(([name, value]) => ({
          name,
          value,
        }))
        .sort((a, b) => b.value - a.value),
    [],
  );
  const sectorData = useMemo(
    () =>
      Object.entries(KPI_DATA.sectorBreakdown || {})
        .map(([name, value]) => ({
          name,
          value,
        }))
        .sort((a, b) => b.value - a.value),
    [],
  );
  const maturityData = useMemo(
    () =>
      Object.entries(KPI_DATA.maturityBreakdown || {}).map(([name, value]) => ({
        name,
        value,
      })),
    [],
  );
  const monitoringData = useMemo(
    () =>
      Object.entries(KPI_DATA.monitoringStatusBreakdown || {}).map(
        ([name, value]) => ({ name, value }),
      ),
    [],
  );
  const financingTypeData = useMemo(
    () =>
      Object.entries(KPI_DATA.financingTypeBreakdown || {})
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
    [],
  );
  const useOfProceedsData = useMemo(
    () =>
      Object.entries(KPI_DATA.useOfProceedsBreakdown || {})
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
    [],
  );
  const verificationData = useMemo(
    () =>
      Object.entries(KPI_DATA.verificationBreakdown || {}).map(
        ([name, value]) => ({ name, value }),
      ),
    [],
  );
  const riskData = useMemo(
    () =>
      Object.entries(KPI_DATA.riskBreakdown || {}).map(([name, value]) => ({
        name,
        value,
      })),
    [],
  );

  const totalVolumeMillions = toMillions(KPI_DATA.totalVolume);
  const utilizationRate =
    ((totalVolumeMillions / TOTAL_LOAN_PORTFOLIO_MILLIONS) * 100).toFixed(3) +
    "%";
  const outstandingMillions = toMillions(KPI_DATA.totalOutstanding);
  const averageDealSizeMillions = totalVolumeMillions / KPI_DATA.dealCount;

  return (
    <MaterialityLayout>
      <Box bgcolor="#eef2f6" minHeight="100vh" p={4} sx={{ width: "100%" }}>
        <Paper
          elevation={0}
          square
          sx={{
            bgcolor: BRAND_BLACK,
            color: "white",
            py: 2.5,
            px: 4,
            mb: 4,
            borderLeft: `6px solid ${BRAND_GREEN}`,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ letterSpacing: "1px", fontFamily: "serif" }}
              >
                DELOITTE ESG NAVIGATOR
              </Typography>
              <Typography
                variant="subtitle1"
                color={BRAND_GREEN}
                sx={{ letterSpacing: "2px", fontWeight: "medium" }}
              >
                SUSTAINABLE FINANCE & INVESTMENT (SFI) DASHBOARD
              </Typography>
            </Box>
            <Box textAlign="right">
              <Typography variant="caption" color="grey.400" display="block">
                REPORTING PERIOD
              </Typography>
              <Typography variant="subtitle2" fontWeight="bold">
                FY 2026 Q1
              </Typography>
              <div
                style={{
                  marginTop: 8,
                  padding: "4px 8px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 4,
                }}
              >
                <Typography variant="caption" color="white">
                  Values in S
                </Typography>
              </div>
            </Box>
          </Stack>
        </Paper>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <KpiCard title="Total Loan Portfolio" value="₦1.2B" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <KpiCard
              title="Total Sust. Finance Volume"
              value={`₦${Math.round(totalVolumeMillions).toLocaleString("en-US")}m`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <KpiCard title="Utilization Rate" value={utilizationRate} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <KpiCard
              title="Outstanding Exposure"
              value={`₦${Math.round(outstandingMillions).toLocaleString("en-US")}m`}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <KpiCard title="Sustainable Deals" value={KPI_DATA.dealCount} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <KpiCard
              title="Avg Deal Size"
              value={`₦${Math.round(averageDealSizeMillions).toLocaleString("en-US")}m`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <KpiCard
              title="Jobs Created"
              value={fmtNum(KPI_DATA.totalJobsCreated)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <KpiCard
              title="SME Supported"
              value={fmtNum(KPI_DATA.totalSMEsSupported)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <KpiCard
              title="Renewable MW Installed"
              value={fmtNum(KPI_DATA.totalRenewableMW)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <KpiCard
              title="tCO₂e Avoided/Removed"
              value={fmtNum(KPI_DATA.totalCO2Avoided)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <KpiCard
              title="Country Count"
              value={KPI_DATA.countryCount || "-"}
            />
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 3, height: 550, borderRadius: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h6" fontWeight="bold">
                  Total Loan Disbursed by Geopolitical Zone
                </Typography>
                <Box bgcolor={BRAND_GREY} px={1.5} py={0.5} borderRadius={1}>
                  <Typography variant="caption" fontWeight="bold">
                    GEOPOLITICAL ZONE
                  </Typography>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height="88%">
                <BarChart
                  data={regionData}
                  margin={{ top: 30, right: 40, left: 20, bottom: 60 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#eeeeee"
                  />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    tick={{ fontSize: 11 }}
                    stroke="#9e9e9e"
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                    formatter={(val) => fmtS(toMillions(Number(val)))}
                  />
                  <Bar
                    dataKey="value"
                    fill={BRAND_BLACK}
                    radius={[6, 6, 0, 0]}
                    barSize={50}
                  >
                    <LabelList
                      dataKey="value"
                      position="top"
                      formatter={(val) => fmtS(toMillions(Number(val)))}
                      style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        fill: "#212121",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 3, height: 550, borderRadius: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h6" fontWeight="bold">
                  Sector Breakdown
                </Typography>
                <Box bgcolor={BRAND_GREY} px={1.5} py={0.5} borderRadius={1}>
                  <Typography variant="caption" fontWeight="bold">
                    INDUSTRY
                  </Typography>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height="88%">
                <BarChart
                  data={sectorData}
                  margin={{ top: 30, right: 40, left: 20, bottom: 120 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#eeeeee"
                  />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    stroke="#9e9e9e"
                    height={100}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: "rgba(253,185,19,0.1)" }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                    formatter={(val) => fmtS(toMillions(Number(val)))}
                  />
                  <Bar
                    dataKey="value"
                    fill={BRAND_GREEN}
                    radius={[6, 6, 0, 0]}
                    barSize={35}
                  >
                    <LabelList
                      dataKey="value"
                      position="top"
                      formatter={(val) => fmtS(toMillions(Number(val)))}
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        fill: "#212121",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 4, height: 550, borderRadius: 2 }}>
              <Box display="flex" justifyContent="center" mb={3}>
                <Typography variant="h6" fontWeight="bold">
                  Facility Maturity
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={maturityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={90}
                    outerRadius={140}
                    paddingAngle={3}
                    label={({ percent = 0 }) =>
                      `${(percent * 100).toFixed(1)}%`
                    }
                    labelLine={false}
                  >
                    {maturityData.map((_item, index) => (
                      <Cell
                        key={`mat-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{
                      fontSize: "13px",
                      paddingTop: "30px",
                      fontWeight: 500,
                    }}
                    iconSize={14}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 4, height: 550, borderRadius: 2 }}>
              <Box display="flex" justifyContent="center" mb={3}>
                <Typography variant="h6" fontWeight="bold">
                  Monitoring Status
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={monitoringData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={90}
                    outerRadius={140}
                    paddingAngle={3}
                    label={({ percent = 0 }) =>
                      `${(percent * 100).toFixed(1)}%`
                    }
                    labelLine={false}
                  >
                    {monitoringData.map((_item, index) => (
                      <Cell
                        key={`mon-${index}`}
                        fill={
                          index === 0
                            ? BRAND_GREEN
                            : index === 1
                              ? BRAND_BLACK
                              : "#9e9e9e"
                        }
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{
                      fontSize: "13px",
                      paddingTop: "30px",
                      fontWeight: 500,
                    }}
                    iconSize={14}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Paper elevation={0} sx={{ p: 4, height: 650, borderRadius: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={4}
              >
                <Typography variant="h6" fontWeight="bold">
                  ESG Category
                </Typography>
                <Box bgcolor={BRAND_GREY} px={1.5} py={0.5} borderRadius={1}>
                  <Typography variant="caption" fontWeight="bold">
                    CLASSIFICATION
                  </Typography>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height="88%">
                <BarChart
                  data={esgData}
                  layout="vertical"
                  margin={{ top: 10, right: 80, left: 20, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#eeeeee"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={220}
                    tick={{ fontSize: 14, fontWeight: 500 }}
                    stroke="#212121"
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                    formatter={(val) => fmtS(toMillions(Number(val)))}
                  />
                  <Bar dataKey="value" barSize={40} radius={[0, 6, 6, 0]}>
                    {esgData.map((_item, index) => (
                      <Cell
                        key={`esg-${index}`}
                        fill={ESG_COLORS[index % ESG_COLORS.length]}
                      />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="right"
                      formatter={(val) => fmtS(toMillions(Number(val)))}
                      style={{
                        fontSize: "13px",
                        fontWeight: "bold",
                        fill: "#212121",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Paper elevation={0} sx={{ p: 3, height: 500, borderRadius: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h6" fontWeight="bold">
                  Financing Type
                </Typography>
                <Box bgcolor={BRAND_GREY} px={1.5} py={0.5} borderRadius={1}>
                  <Typography variant="caption" fontWeight="bold">
                    INSTRUMENT
                  </Typography>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height="88%">
                <BarChart
                  data={financingTypeData}
                  margin={{ top: 30, right: 40, left: 20, bottom: 40 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#eeeeee"
                  />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    tick={{ fontSize: 11 }}
                    stroke="#9e9e9e"
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                    formatter={(val) => fmtS(toMillions(Number(val)))}
                  />
                  <Bar
                    dataKey="value"
                    fill={BRAND_BLACK}
                    radius={[6, 6, 0, 0]}
                    barSize={55}
                  >
                    <LabelList
                      dataKey="value"
                      position="top"
                      formatter={(val) => fmtS(toMillions(Number(val)))}
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        fill: "#212121",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 3, height: 500, borderRadius: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h6" fontWeight="bold">
                  Verification Status
                </Typography>
                <Box bgcolor={BRAND_GREY} px={1.5} py={0.5} borderRadius={1}>
                  <Typography variant="caption" fontWeight="bold">
                    EXTERNAL
                  </Typography>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart
                  data={verificationData}
                  margin={{ top: 30, right: 40, left: 20, bottom: 30 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#eeeeee"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 13 }}
                    stroke="#9e9e9e"
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                    formatter={(val) => `${Number(val)} deals`}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={80}>
                    {verificationData.map((_item, index) => (
                      <Cell
                        key={`ver-${index}`}
                        fill={index === 0 ? "#2e7d32" : BRAND_BLACK}
                      />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="top"
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        fill: "#212121",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 3, height: 500, borderRadius: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h6" fontWeight="bold">
                  ESG Risk Categorization
                </Typography>
                <Box bgcolor={BRAND_GREY} px={1.5} py={0.5} borderRadius={1}>
                  <Typography variant="caption" fontWeight="bold">
                    TOTAL
                  </Typography>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart
                  data={riskData}
                  margin={{ top: 30, right: 40, left: 20, bottom: 30 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#eeeeee"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    stroke="#9e9e9e"
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                    formatter={(val) => `${Number(val)} deals`}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={65}>
                    {riskData.map((item, index) => (
                      <Cell
                        key={`risk-${index}`}
                        fill={RISK_COLORS[item.name] || "#757575"}
                      />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="top"
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        fill: "#212121",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Paper elevation={0} sx={{ p: 4, height: 700, borderRadius: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={4}
              >
                <Typography variant="h6" fontWeight="bold">
                  Use of Proceeds
                </Typography>
                <Box bgcolor={BRAND_GREY} px={1.5} py={0.5} borderRadius={1}>
                  <Typography variant="caption" fontWeight="bold">
                    ALLOCATION
                  </Typography>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height="88%">
                <BarChart
                  data={useOfProceedsData}
                  layout="vertical"
                  margin={{ top: 10, right: 120, left: 20, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#eeeeee"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={260}
                    tick={{ fontSize: 13, fontWeight: 500 }}
                    stroke="#212121"
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                    formatter={(val) => fmtS(toMillions(Number(val)))}
                  />
                  <Bar dataKey="value" barSize={36} radius={[0, 6, 6, 0]}>
                    {useOfProceedsData.map((_item, index) => (
                      <Cell
                        key={`uop-${index}`}
                        fill={PROCEEDS_COLORS[index % PROCEEDS_COLORS.length]}
                      />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="right"
                      formatter={(val) => fmtS(toMillions(Number(val)))}
                      style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        fill: "#212121",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </MaterialityLayout>
  );
}
