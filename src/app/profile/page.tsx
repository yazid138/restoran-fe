"use client";

import { useSession, signOut } from "next-auth/react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Grid,
  Button,
  Divider,
  Chip,
  Skeleton,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  if (status === "loading") {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
        <Container maxWidth="md">
          <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Skeleton variant="circular" width={100} height={100} />
              <Skeleton variant="text" width={200} height={40} sx={{ mt: 2 }} />
              <Skeleton variant="text" width={150} height={24} />
            </Box>
            <Skeleton
              variant="rectangular"
              height={200}
              sx={{ borderRadius: 2 }}
            />
          </Paper>
        </Container>
      </Box>
    );
  }

  if (!session) {
    return null; // Layout will redirect
  }

  const user = session.user;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          gutterBottom
          sx={{ mb: 4 }}
        >
          Profil Saya
        </Typography>

        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 6,
            }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: "primary.main",
                fontSize: "3rem",
                mb: 2,
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5" fontWeight="bold">
              {user?.name}
            </Typography>
            <Chip
              label={user?.role?.toUpperCase()}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>

          <Divider sx={{ mb: 4 }}>
            <Chip label="Informasi Akun" />
          </Divider>

          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "action.selected" }}>
                  <PersonIcon color="primary" />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Nama Lengkap
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user?.name}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "action.selected" }}>
                  <EmailIcon color="primary" />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "action.selected" }}>
                  <BadgeIcon color="primary" />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Role / Jabatan
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user?.role?.toUpperCase()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              size="large"
              sx={{ px: 4, borderRadius: 2 }}
            >
              Logout
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
