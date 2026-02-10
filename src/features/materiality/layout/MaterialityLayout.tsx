import { Box, useTheme } from "@mui/material";
import MaterialitySidebar from "./MaterialitySidebar";

interface MaterialityLayoutProps {
  children: React.ReactNode;
}

export default function MaterialityLayout({
  children,
}: MaterialityLayoutProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const bgColor = isDark ? "#0B1121" : "#F8FAFC";

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: bgColor,
        overflow: "hidden",
      }}
    >
      <MaterialitySidebar />

      <Box
        component="main"
        sx={{
          flex: 1,
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          transition: "margin-left 0.3s ease",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
