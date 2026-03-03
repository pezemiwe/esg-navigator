import { useMemo } from "react";
import { Box, Container, Typography, Alert, Button } from "@mui/material";
import { useMaterialityStore } from "@/store/materialityStore";
import { useShallow } from "zustand/react/shallow";
import { MaterialityTemplateList } from "./components/MaterialityTemplateList";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MaterialityDashboard() {
  const { topics } = useMaterialityStore(
    useShallow((state) => ({
      topics: state.topics,
    })),
  );
  const navigate = useNavigate();

  // Get selected topics (Top 5)
  const selectedTopics = useMemo(
    () => topics.filter((t) => t.selected),
    [topics],
  );
  const selectedCount = selectedTopics.length;

  // Ideally, if nothing is selected or count != 5, we warn, but allow viewing whatever is selected.
  // The user requirement implies exactly 5 for "Top 5".

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", pb: 8 }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          mb={4}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Data Collection
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Assign responsible persons and input data for your top{" "}
              {selectedCount} priority topics.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate("/sustainability/risks/scoring")}
            sx={{ textTransform: "none" }}
          >
            Back to Scoring
          </Button>
        </Box>

        {selectedCount === 0 && (
          <Alert severity="info" sx={{ mb: 4 }}>
            No topics selected. Please go back to Scoring to select your Top 5
            material topics.
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Main Section: Data Input Templates */}
          <MaterialityTemplateList topics={selectedTopics} />
        </Box>
      </Container>
    </Box>
  );
}
