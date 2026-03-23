import { Box, useTheme } from "@mui/material";

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
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: bgColor,
        overflowX: "hidden",
      }}
    >
      <Box
        component="main"
        sx={{
          flex: 1,
          width: "100%",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
