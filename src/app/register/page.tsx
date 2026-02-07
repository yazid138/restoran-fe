"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import axiosInstance from "@/utils/axios";

// Validation schema using Yup
const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Nama minimal 3 karakter")
    .required("Nama wajib diisi"),
  email: Yup.string().email("Email tidak valid").required("Email wajib diisi"),
  password: Yup.string()
    .min(6, "Password minimal 6 karakter")
    .required("Password wajib diisi"),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref("password")], "Password tidak cocok")
    .required("Konfirmasi password wajib diisi"),
  role: Yup.string()
    .oneOf(["pelayan", "kasir"], "Role tidak valid")
    .required("Role wajib dipilih"),
});

interface RegisterResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: "pelayan",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError("");
      setSuccess("");

      try {
        const response = await axiosInstance.post<RegisterResponse>(
          "/auth/register",
          values,
        );

        setSuccess("Registrasi berhasil! Mengalihkan ke halaman login...");

        // Auto sign-in with NextAuth after successful registration
        if (response.data.token) {
          // Sign in with NextAuth using the registered credentials
          const result = await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false,
          });

          if (result?.ok) {
            // Redirect to home page after successful login
            setTimeout(() => {
              router.push("/");
              router.refresh();
            }, 1000);
          }
        }
      } catch (err) {
        console.error("Register error:", err);
        if (err && typeof err === "object" && "response" in err) {
          const error = err as {
            response?: {
              data?: { message?: string; errors?: Record<string, string[]> };
              status?: number;
            };
          };
          if (error.response?.data?.errors) {
            // Laravel validation errors
            const errorMessages = Object.values(
              error.response.data.errors,
            ).flat();
            setError(errorMessages.join(", "));
          } else if (error.response?.data?.message) {
            setError(error.response.data.message);
          } else {
            setError("Terjadi kesalahan. Silakan coba lagi.");
          }
        } else {
          setError("Terjadi kesalahan. Silakan coba lagi.");
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            fontWeight="bold"
          >
            Daftar Akun
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mb: 4 }}
          >
            Buat akun baru untuk memulai
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Nama Lengkap"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                disabled={isLoading}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                disabled={isLoading}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                id="role"
                name="role"
                label="Role"
                select
                value={formik.values.role}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.role && Boolean(formik.errors.role)}
                helperText={formik.touched.role && formik.errors.role}
                disabled={isLoading}
              >
                <MenuItem value="pelayan">Pelayan</MenuItem>
                <MenuItem value="kasir">Kasir</MenuItem>
              </TextField>
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
                disabled={isLoading}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                id="password_confirmation"
                name="password_confirmation"
                label="Konfirmasi Password"
                type="password"
                value={formik.values.password_confirmation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.password_confirmation &&
                  Boolean(formik.errors.password_confirmation)
                }
                helperText={
                  formik.touched.password_confirmation &&
                  formik.errors.password_confirmation
                }
                disabled={isLoading}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mb: 2 }}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Memproses...
                </>
              ) : (
                "Daftar"
              )}
            </Button>

            <Typography variant="body2" align="center" color="text.secondary">
              Sudah punya akun?{" "}
              <Button
                variant="text"
                size="small"
                onClick={() => router.push("/login")}
                disabled={isLoading}
              >
                Masuk di sini
              </Button>
            </Typography>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
