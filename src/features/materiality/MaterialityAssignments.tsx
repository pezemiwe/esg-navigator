import MaterialityLayout from "./layout/MaterialityLayout";
import { useMaterialityStore, MOCK_USERS } from "@/store/materialityStore";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Button,
  Chip,
  Avatar,
  Stack,
  FormControl,
  Alert,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { DELOITTE_COLORS } from "@/config/colors.config";

export default function MaterialityAssignments() {
  const { topics, assignTopic, currentUser } = useMaterialityStore();
  const navigate = useNavigate();

  const selectedTopics = topics.filter((t) => t.selected);

  if (currentUser.role !== "Head_Sustainability") {
    return (
      <MaterialityLayout>
        <Box p={4}>
          <Alert severity="error">
            Access Denied: Only the Head of Sustainability can assign topics.
          </Alert>
          <Button
            onClick={() => navigate("/materiality/profiling")}
            sx={{ mt: 2 }}
          >
            Back to Profiling
          </Button>
        </Box>
      </MaterialityLayout>
    );
  }

  return (
    <MaterialityLayout>
      <Box sx={{ p: 5, maxWidth: "1200px", mx: "auto" }}>
        <Box mb={4}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Materiality Assignments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Assign responsible managers to each material topic. Users will only
            see topics assigned to them.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e0e0e0",
            overflow: "hidden",
          }}
        >
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>
                    <strong>Material Topic</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Description</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Assigned To</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedTopics.map((topic) => (
                  <TableRow key={topic.id} hover>
                    <TableCell>
                      <Typography fontWeight="bold">{topic.name}</Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {topic.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={topic.approvalStatus || "Pending"}
                        color={
                          topic.approvalStatus === "Approved"
                            ? "success"
                            : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 250 }}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={topic.assignedUserId || ""}
                          onChange={(e) =>
                            assignTopic(topic.id, e.target.value)
                          }
                          displayEmpty
                          renderValue={(selected) => {
                            if (!selected)
                              return (
                                <Typography color="text.secondary">
                                  Select User
                                </Typography>
                              );
                            const user = MOCK_USERS.find(
                              (u) => u.id === selected,
                            );
                            return (
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <Avatar
                                  sx={{ width: 24, height: 24, fontSize: 12 }}
                                >
                                  {user?.name[0]}
                                </Avatar>
                                <Typography variant="body2">
                                  {user?.name}
                                </Typography>
                              </Stack>
                            );
                          }}
                        >
                          {MOCK_USERS.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                width="100%"
                              >
                                <Avatar
                                  sx={{ width: 24, height: 24, fontSize: 12 }}
                                >
                                  {user.name[0]}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {user.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {user.role} - {user.department}
                                  </Typography>
                                </Box>
                              </Stack>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Box mt={4} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            size="large"
            endIcon={<CheckCircle />}
            onClick={() => navigate("/materiality/data-input")}
            sx={{
              bgcolor: DELOITTE_COLORS.primary.DEFAULT,
              color: "#000",
              fontWeight: 700,
              "&:hover": { bgcolor: "#e0a20f" },
            }}
          >
            Confirm Assignments & Proceed
          </Button>
        </Box>
      </Box>
    </MaterialityLayout>
  );
}
