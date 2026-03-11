import { Box, Container, useTheme } from "@mui/material";
import { type ReactNode } from "react";
interface AuthLayoutProps {
  children: ReactNode;
}
export default function AuthLayout({ children }: AuthLayoutProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: isDark ? "#1D1D1D" : "#FFF",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          position: "relative",
          zIndex: 2,
        }}
      >
        {children}
      </Container>
    </Box>
  );
}
