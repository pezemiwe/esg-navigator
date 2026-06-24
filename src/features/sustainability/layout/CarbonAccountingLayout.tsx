import { Box, useTheme } from "@mui/material";

interface CarbonAccountingLayoutProps {
  children: React.ReactNode;
}

export default function CarbonAccountingLayout({
  children,
}: CarbonAccountingLayoutProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: isDark ? "#1D1D1D" : "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
    </Box>
  );
}