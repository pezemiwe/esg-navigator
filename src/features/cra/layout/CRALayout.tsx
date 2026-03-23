import { Box, useTheme } from "@mui/material";
import DashboardNavbar from "@/components/layout/DashboardNavbar/DashboardNavbar";
interface CRALayoutProps {
  children: React.ReactNode;
}
export default function CRALayout({ children }: CRALayoutProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const darkBg = "#1D1D1D";
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: isDark ? darkBg : "background.default",
        display: "flex",
        flexDirection: "column",
        pt: "70px", 
      }}
    >
      <DashboardNavbar />
      <Box
        component="main"
        sx={{
          flex: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}