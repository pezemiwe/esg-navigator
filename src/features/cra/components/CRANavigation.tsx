import { useNavigate } from "react-router-dom";
import { Box, Button, Stack, useTheme, alpha } from "@mui/material";
import { ArrowLeft, ArrowRight, LayoutDashboard } from "lucide-react";
import { DELOITTE_COLORS } from "@/config/colors.config";

interface CRANavigationProps {
  prevPath?: string;
  prevLabel?: string;
  nextPath?: string;
  nextLabel?: string;
  compact?: boolean;
}

export default function CRANavigation({
  prevPath,
  prevLabel = "Back",
  nextPath,
  nextLabel = "Next Module",
  compact = false,
}: CRANavigationProps) {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      sx={{
        mt: compact ? 0 : 4,
        pt: compact ? 1 : 3,
        borderTop: compact ? "none" : `1px solid ${theme.palette.divider}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Stack direction="row" spacing={2}>
        <Button
          startIcon={<LayoutDashboard size={16} />}
          onClick={() => navigate("/cra/dashboard")}
          variant="outlined"
          sx={{
            borderColor: theme.palette.divider,
            color: theme.palette.text.secondary,
            textTransform: "none",
            "&:hover": {
              borderColor: DELOITTE_COLORS.slate.DEFAULT,
              color: DELOITTE_COLORS.slate.DEFAULT,
              backgroundColor: alpha(DELOITTE_COLORS.slate.DEFAULT, 0.05),
            },
          }}
        >
          Dashboard
        </Button>

        {prevPath && (
          <Button
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate(prevPath)}
            sx={{
              color: theme.palette.text.secondary,
              textTransform: "none",
              "&:hover": {
                backgroundColor: alpha(theme.palette.text.secondary, 0.05),
              },
            }}
          >
            {prevLabel}
          </Button>
        )}
      </Stack>

      {nextPath && (
        <Button
          endIcon={<ArrowRight size={16} />}
          onClick={() => navigate(nextPath)}
          variant="contained"
          sx={{
            backgroundColor: DELOITTE_COLORS.slate.DEFAULT,
            color: "#FFF",
            textTransform: "none",
            "&:hover": {
              backgroundColor: alpha(DELOITTE_COLORS.slate.DEFAULT, 0.9),
            },
          }}
        >
          {nextLabel}
        </Button>
      )}
    </Box>
  );
}
