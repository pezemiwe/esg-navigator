import { Button, Typography, Paper, Stack, Alert } from "@mui/material";
import { Database, RefreshCw } from "lucide-react";
import { useCRADataStore } from "@/store/craStore";
import { populateDemoData } from "../utils/demoDataGenerator";

export default function DemoDataLoader() {
  const { assets, setAssetData } = useCRADataStore();
  const hasData = Object.keys(assets).length > 0;

  const handleLoadDemo = () => {
    populateDemoData(setAssetData);
  };

  if (hasData) {
    const totalAssets = Object.values(assets).reduce(
      (sum, type) => sum + type.data.length,
      0,
    );

    return (
      <Alert severity="success" icon={<Database size={20} />}>
        <Typography variant="body2">
          <strong>{totalAssets} assets</strong> loaded across{" "}
          <strong>{Object.keys(assets).length} asset types</strong>
        </Typography>
      </Alert>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        textAlign: "center",
        border: "2px dashed",
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Database size={48} color="#94A3B8" />
        <Typography variant="h6" color="text.secondary">
          No Portfolio Data Found
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 400 }}
        >
          Load demo data to explore Portfolio Segmentation features with
          realistic ana banking portfolio data including data quality issues.
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshCw size={18} />}
          onClick={handleLoadDemo}
          sx={{
            backgroundColor: "#86BC25",
            color: "#1D1D1D",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "#E5A710",
            },
          }}
        >
          Load Demo Data (500+ Assets)
        </Button>
      </Stack>
    </Paper>
  );
}
