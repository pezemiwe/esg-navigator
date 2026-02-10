import { useEffect } from "react";
import { Box } from "@mui/material";
import Hero from "./components/Hero";

export default function LandingPage() {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <Hero />
    </Box>
  );
}
