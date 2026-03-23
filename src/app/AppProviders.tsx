import { type ReactNode } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { useThemeStore } from "@/store/themeStore";
import { litTheme, darkTheme } from "@/config/theme.config";
import { ToastProvider } from "@/features/e-learnings/components/ui/Toast";

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  const { mode } = useThemeStore();
  const theme = mode === "dark" ? darkTheme : litTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
