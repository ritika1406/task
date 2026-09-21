
import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #f7f8fc 0%, #eef1f8 50%, #f5f3ff 100%)",
        px: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background shapes */}
      <Box
        sx={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "rgba(99, 102, 241, 0.08)",
          top: -100,
          right: -80,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "rgba(20, 184, 166, 0.07)",
          bottom: -80,
          left: -60,
        }}
      />

      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            position: "relative",
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            border: "1px solid rgba(30, 41, 59, 0.08)",
            boxShadow: "0 20px 60px rgba(30, 41, 59, 0.10)",
            backgroundColor: "rgba(255, 255, 255, 0.94)",
          }}
        >
          {/* Logo / Brand */}
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                color: "#fff",
                mb: 2.5,
                boxShadow: "0 8px 20px rgba(79, 70, 229, 0.25)",
              }}
            >
              <LockOutlined />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#172033",
                letterSpacing: "-0.8px",
                mb: 0.8,
              }}
            >
              Welcome back
            </Typography>

            <Typography
              sx={{
                color: "#64748b",
                fontSize: "0.98rem",
              }}
            >
              Sign in to continue managing your expenses.
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                fontSize: "0.9rem",
              }}
            >
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={submit}
            sx={{
              display: "grid",
              gap: 2.3,
            }}
          >
            <TextField
              label="Email address"
              type="email"
              required
              fullWidth
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  backgroundColor: "#fafbfc",
                  "&:hover fieldset": {
                    borderColor: "#6366f1",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#4f46e5",
                    borderWidth: 1.5,
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#4f46e5",
                },
              }}
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              required
              fullWidth
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  backgroundColor: "#fafbfc",
                  "&:hover fieldset": {
                    borderColor: "#6366f1",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#4f46e5",
                    borderWidth: 1.5,
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#4f46e5",
                },
              }}
            />

            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={loading}
              sx={{
                mt: 0.5,
                py: 1.45,
                borderRadius: 2.5,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                boxShadow: "0 8px 18px rgba(79, 70, 229, 0.22)",
                "&:hover": {
                  background: "linear-gradient(135deg, #4338ca, #4f46e5)",
                  boxShadow: "0 10px 22px rgba(79, 70, 229, 0.28)",
                },
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <Typography
              sx={{
                textAlign: "center",
                color: "#64748b",
                fontSize: "0.92rem",
                mt: 1,
              }}
            >
              Don't have an account?{" "}
              <Link
                to="/signup"
                style={{
                  color: "#4f46e5",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Create one
              </Link>
            </Typography>
          </Box>

          {/* Small footer detail */}
          <Box
            sx={{
              mt: 4,
              pt: 2.5,
              borderTop: "1px solid #eef0f4",
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "#94a3b8",
              }}
            >
              Your personal finance, simplified.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

