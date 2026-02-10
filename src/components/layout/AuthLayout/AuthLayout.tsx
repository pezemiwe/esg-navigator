import { Box, Container, useTheme, alpha } from "@mui/material";
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
      {}
      <Box
        component="iframe"
        src="https://www.youtube.com/embed/Fx_LXyIJzG4?autoplay=1&mute=1&controls=0&loop=1&playlist=Fx_LXyIJzG4&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1"
        title="Background Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "100vw",
          height: "56.25vw",
          minHeight: "100vh",
          minWidth: "177.78vh",
          transform: "translate(-50%, -50%)",
          opacity: isDark ? 0.3 : 0.4,
          zIndex: 0,
          border: 0,
          pointerEvents: "none",
          filter: isDark
            ? "brightness(70%) grayscale(20%)"
            : "brightness(120%) grayscale(100%)",
          transition: "opacity 0.4s",
        }}
      />
      {}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: isDark ? alpha("#1D1D1D", 0.5) : alpha("#FFFFFF", 0.3),
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          zIndex: 1,
        }}
      />
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
