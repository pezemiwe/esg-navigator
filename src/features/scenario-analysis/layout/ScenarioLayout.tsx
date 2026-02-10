import { Box, useTheme } from "@mui/material";
import ScenarioSidebar from "./ScenarioSidebar";

interface ScenarioLayoutProps {
  children: React.ReactNode;
}

export default function ScenarioLayout({ children }: ScenarioLayoutProps) {
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
      <ScenarioSidebar />

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          transition: "margin-left 0.3s ease",
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 4,
            maxWidth: 1600,
            mx: "auto",
            width: "100%",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
