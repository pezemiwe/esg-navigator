import { type ReactNode } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { useThemeStore } from "@/store/themeStore";
import { litTheme, darkTheme } from "@/config/theme.config";
import { Toaster } from "@/components/ui";

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  const { mode } = useThemeStore();
  const theme = mode === "dark" ? darkTheme : litTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}
