"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show loading while redirecting
  if (!session) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Selamat Datang, {session.user?.name}!
          </Typography>

          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Email: {session.user?.email}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Role: {session.user?.role}
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            sx={{ mt: 2 }}
          >
            Logout
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
