import { Component, type ReactNode } from "react";
import { Box, Typography, Button } from "@mui/material";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            width: "100vw",
            position: "fixed",
            top: 0,
            left: 0,
            backgroundColor: "#1D1D1D",
            color: "#FFFFFF",
            p: 4,
            zIndex: 9999,
          }}
        >
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
            Something went wrong
          </Typography>
          <Typography sx={{ mb: 4, color: "#94A3B8" }}>
            {this.state.error?.message || "An unexpected error occurred"}
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{
              backgroundColor: "#86BC25",
              color: "#FFFFFF",
              "&:hover": {
                backgroundColor: "#6B9B1E",
              },
            }}
          >
            Reload Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
