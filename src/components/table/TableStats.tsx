import { TableStats as TableStatsType } from "@/types/table";
import { Grid, Paper, Typography, Box } from "@mui/material";
import { CheckCircle, Cancel, Schedule, Block } from "@mui/icons-material";

interface TableStatsProps {
  stats: TableStatsType;
}

export default function TableStats({ stats }: TableStatsProps) {
  const statItems = [
    {
      label: "Tersedia",
      value: stats.available,
      color: "#4caf50",
      icon: CheckCircle,
    },
    {
      label: "Terisi",
      value: stats.occupied,
      color: "#f44336",
      icon: Cancel,
    },
    {
      label: "Reserved",
      value: stats.reserved,
      color: "#ff9800",
      icon: Schedule,
    },
    {
      label: "Tidak Aktif",
      value: stats.inactive,
      color: "#9e9e9e",
      icon: Block,
    },
  ];

  return (
    <Grid container spacing={2}>
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Grid size={{ xs: 6, sm: 3 }} key={item.label}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 2,
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 1,
                }}
              >
                <Icon sx={{ fontSize: 40, color: item.color }} />
              </Box>
              <Typography
                variant="h4"
                component="div"
                fontWeight="bold"
                sx={{ color: item.color }}
              >
                {item.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {item.label}
              </Typography>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}
