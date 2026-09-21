
import React, { useEffect, useMemo, useState } from "react";

import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
  Chip,
  Avatar,
  Divider,
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";

import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { exportCsv, exportPdf } from "../utils/export";

const money = (v) =>
  `₹${Number(v || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const PIE_COLORS = [
  "#4f46e5",
  "#6366f1",
  "#14b8a6",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
];

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");

  const query = useMemo(
    () => ({
      params: {
        ...(from && { from }),
        ...(to && { to }),
        ...(search && { search }),
      },
    }),
    [from, to, search]
  );

  async function load() {
    setLoading(true);

    try {
      const [s, c, m, t] = await Promise.all([
        client.get("/transactions/summary", query),
        client.get("/transactions/categories", query),
        client.get("/transactions/monthly", query),
        client.get("/transactions", query),
      ]);

      setSummary(s.data.summary);

      setCategories(
        c.data.categories.map((x) => ({
          ...x,
          amount: Number(x.amount),
        }))
      );

      setMonthly(
        m.data.monthly.map((x) => ({
          ...x,
          expenses: Number(x.expenses),
          income: Number(x.income),
        }))
      );

      setTransactions(t.data.transactions);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch((e) =>
      setMessage(
        e.response?.data?.message || "Unable to load dashboard"
      )
    );
  }, [from, to, search]);

  async function upload() {
    if (!file) return;

    setUploading(true);
    setMessage("");

    try {
      const data = new FormData();
      data.append("file", file);

      const r = await client.post("/transactions/upload", data);

      setMessage(
        `Imported ${r.data.inserted} transactions. ${r.data.duplicates} duplicates skipped and ${r.data.invalid} invalid rows ignored.`
      );

      setFile(null);

      const input = document.getElementById("csv-input");

      if (input) {
        input.value = "";
      }

      await load();
    } catch (e) {
      setMessage(
        e.response?.data?.message || "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  }

  const firstName = user?.name
    ? user.name.split(" ")[0]
    : "there";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f6f7fb",
      }}
    >
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e8eaf0",
          color: "#172033",
        }}
      >
        <Toolbar
          sx={{
            maxWidth: 1250,
            width: "100%",
            mx: "auto",
            minHeight: 70,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              background:
                "linear-gradient(135deg, #4f46e5, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 1.5,
              color: "#fff",
            }}
          >
            <AccountBalanceWalletOutlinedIcon fontSize="small" />
          </Box>

          <Typography
            sx={{
              fontWeight: 750,
              fontSize: "1.1rem",
              letterSpacing: "-0.2px",
            }}
          >
            Expense Tracker
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                fontSize: "0.85rem",
                fontWeight: 700,
                bgcolor: "#ede9fe",
                color: "#4f46e5",
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>

            <Typography
              sx={{
                display: { xs: "none", sm: "block" },
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              {user?.name}
            </Typography>

            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={logout}
              sx={{
                textTransform: "none",
                color: "#64748b",
                fontWeight: 600,
                "&:hover": {
                  background: "#f1f2f6",
                },
              }}
            >
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 3, md: 5 },
        }}
      >
        {/* Page heading */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontSize: { xs: "1.8rem", md: "2.2rem" },
              fontWeight: 750,
              color: "#172033",
              letterSpacing: "-1px",
            }}
          >
            Good to see you, {firstName} 👋
          </Typography>

          <Typography
            sx={{
              color: "#64748b",
              mt: 0.7,
              fontSize: "0.98rem",
            }}
          >
            Here's what's happening with your finances.
          </Typography>
        </Box>

        {/* Import section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            mb: 3,
            borderRadius: 3,
            border: "1px solid #e7e9ef",
            background:
              "linear-gradient(135deg, #ffffff 0%, #fafaff 100%)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ md: "center" }}
            spacing={3}
          >
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#eef2ff",
                    color: "#4f46e5",
                  }}
                >
                  <UploadFileIcon />
                </Box>

                <Box>
                  <Typography
                    fontWeight={700}
                    sx={{ color: "#172033" }}
                  >
                    Import bank statement
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: "#64748b" }}
                  >
                    Upload a CSV to automatically analyse your transactions.
                  </Typography>
                </Box>
              </Stack>

              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 1.5,
                  color: "#94a3b8",
                }}
              >
                CSV only · Maximum 5 MB · Up to 10,000 rows
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
            >
              <Button
                component="label"
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  borderColor: "#d7d9e2",
                  color: "#475569",
                  minWidth: 140,
                }}
              >
                {file ? file.name : "Choose CSV"}
                <input
                  id="csv-input"
                  hidden
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) =>
                    setFile(e.target.files?.[0] || null)
                  }
                />
              </Button>

              <Button
                variant="contained"
                startIcon={<UploadFileIcon />}
                disabled={!file || uploading}
                onClick={upload}
                sx={{
                  minWidth: 140,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #4f46e5, #6366f1)",
                  boxShadow:
                    "0 7px 16px rgba(79,70,229,0.20)",
                }}
              >
                {uploading ? "Uploading..." : "Upload CSV"}
              </Button>
            </Stack>
          </Stack>

          {uploading && (
            <LinearProgress
              sx={{
                mt: 2.5,
                borderRadius: 5,
                height: 4,
              }}
            />
          )}

          {message && (
            <Alert
              sx={{
                mt: 2.5,
                borderRadius: 2,
              }}
              severity={
                message.includes("failed") ||
                message.includes("Unable")
                  ? "error"
                  : "info"
              }
            >
              {message}
            </Alert>
          )}
        </Paper>

        {/* Filters */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            border: "1px solid #e7e9ef",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ md: "center" }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                color: "#475569",
                mr: 1,
              }}
            >
              Filter
            </Typography>

            <TextField
              label="From"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              sx={{
                minWidth: { md: 150 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              label="To"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={to}
              onChange={(e) => setTo(e.target.value)}
              sx={{
                minWidth: { md: 150 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              label="Search merchant"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                minWidth: { md: 280 },
                flexGrow: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <Button
              onClick={() => {
                setFrom("");
                setTo("");
                setSearch("");
              }}
              sx={{
                textTransform: "none",
                color: "#4f46e5",
                fontWeight: 600,
              }}
            >
              Clear filters
            </Button>
          </Stack>
        </Paper>

        {loading ? (
          <LinearProgress
            sx={{
              borderRadius: 5,
              height: 4,
            }}
          />
        ) : (
          <>
            {/* Summary cards */}
            <Grid
              container
              spacing={2}
              sx={{ mb: 3 }}
            >
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid #e7e9ef",
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography
                          sx={{
                            color: "#64748b",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                          }}
                        >
                          Total expenses
                        </Typography>

                        <Typography
                          sx={{
                            mt: 1,
                            fontSize: "1.7rem",
                            fontWeight: 750,
                            color: "#172033",
                          }}
                        >
                          {money(summary?.total_expenses)}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#fef2f2",
                          color: "#ef4444",
                        }}
                      >
                        <ReceiptLongOutlinedIcon />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid #e7e9ef",
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography
                          sx={{
                            color: "#64748b",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                          }}
                        >
                          Total income
                        </Typography>

                        <Typography
                          sx={{
                            mt: 1,
                            fontSize: "1.7rem",
                            fontWeight: 750,
                            color: "#172033",
                          }}
                        >
                          {money(summary?.total_income)}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#ecfdf5",
                          color: "#10b981",
                        }}
                      >
                        <TrendingUpIcon />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid #e7e9ef",
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography
                          sx={{
                            color: "#64748b",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                          }}
                        >
                          Transactions
                        </Typography>

                        <Typography
                          sx={{
                            mt: 1,
                            fontSize: "1.7rem",
                            fontWeight: 750,
                            color: "#172033",
                          }}
                        >
                          {summary?.transaction_count || 0}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#eef2ff",
                          color: "#4f46e5",
                        }}
                      >
                        <AutoGraphIcon />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid
              container
              spacing={3}
              sx={{ mb: 3 }}
            >
              <Grid size={{ xs: 12, lg: 5 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    height: 430,
                    borderRadius: 3,
                    border: "1px solid #e7e9ef",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      color: "#172033",
                    }}
                  >
                    Spending by category
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "#94a3b8",
                      mt: 0.4,
                    }}
                  >
                    Where your money is going
                  </Typography>

                  {categories.length ? (
                    <ResponsiveContainer
                      width="100%"
                      height="85%"
                    >
                      <PieChart>
                        <Pie
                          data={categories}
                          dataKey="amount"
                          nameKey="category"
                          outerRadius={125}
                          innerRadius={60}
                          paddingAngle={2}
                        >
                          {categories.map((_, i) => (
                            <Cell
                              key={i}
                              fill={
                                PIE_COLORS[
                                  i % PIE_COLORS.length
                                ]
                              }
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          formatter={(v) => money(v)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box
                      sx={{
                        height: "85%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography color="text.secondary">
                        No expense data.
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, lg: 7 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    height: 430,
                    borderRadius: 3,
                    border: "1px solid #e7e9ef",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      color: "#172033",
                    }}
                  >
                    Monthly trend
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "#94a3b8",
                      mt: 0.4,
                    }}
                  >
                    Income vs expenses over time
                  </Typography>

                  {monthly.length ? (
                    <ResponsiveContainer
                      width="100%"
                      height="85%"
                    >
                      <BarChart
                        data={monthly}
                        margin={{
                          top: 20,
                          right: 10,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#eef0f4"
                        />

                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                        />

                        <Tooltip
                          formatter={(v) => money(v)}
                        />

                        <Bar
                          dataKey="expenses"
                          name="Expenses"
                          fill="#6366f1"
                          radius={[5, 5, 0, 0]}
                        />

                        <Bar
                          dataKey="income"
                          name="Income"
                          fill="#14b8a6"
                          radius={[5, 5, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box
                      sx={{
                        height: "85%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography color="text.secondary">
                        No trend data.
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* Transactions */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid #e7e9ef",
                overflow: "hidden",
              }}
            >
              <Box sx={{ p: 2.5 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ sm: "center" }}
                  spacing={2}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.05rem",
                        color: "#172033",
                      }}
                    >
                      Recent transactions
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#94a3b8",
                        mt: 0.4,
                      }}
                    >
                      Your imported transaction history
                    </Typography>
                  </Box>

                  <Stack
                    direction="row"
                    spacing={1}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() =>
                        exportCsv(transactions)
                      }
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        borderColor: "#d7d9e2",
                      }}
                    >
                      CSV
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() =>
                        exportPdf(
                          summary,
                          categories,
                          transactions
                        )
                      }
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        borderColor: "#d7d9e2",
                      }}
                    >
                      PDF
                    </Button>
                  </Stack>
                </Stack>
              </Box>

              <Divider />

              <Box sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        background: "#fafbfc",
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#64748b",
                        }}
                      >
                        Date
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#64748b",
                        }}
                      >
                        Description
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#64748b",
                        }}
                      >
                        Category
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#64748b",
                        }}
                      >
                        Type
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color: "#64748b",
                        }}
                      >
                        Amount
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {transactions.map((t) => (
                      <TableRow
                        key={t.id}
                        hover
                        sx={{
                          "&:last-child td": {
                            borderBottom: 0,
                          },
                        }}
                      >
                        <TableCell>
                          <Typography
                            sx={{
                              fontSize: "0.88rem",
                              color: "#475569",
                            }}
                          >
                            {String(
                              t.transaction_date
                            ).slice(0, 10)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              color: "#172033",
                            }}
                          >
                            {t.description}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={t.category}
                            size="small"
                            sx={{
                              background: "#f1f5f9",
                              color: "#475569",
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={t.transaction_type}
                            size="small"
                            sx={{
                              background:
                                t.transaction_type ===
                                "DEBIT"
                                  ? "#fef2f2"
                                  : "#ecfdf5",
                              color:
                                t.transaction_type ===
                                "DEBIT"
                                  ? "#dc2626"
                                  : "#059669",
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color:
                                t.transaction_type ===
                                "DEBIT"
                                  ? "#dc2626"
                                  : "#059669",
                            }}
                          >
                            {t.transaction_type ===
                            "DEBIT"
                              ? "-"
                              : "+"}
                            {money(t.amount)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {!transactions.length && (
                  <Box
                    sx={{
                      py: 7,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: "#475569",
                      }}
                    >
                      No transactions found
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#94a3b8",
                        mt: 0.5,
                      }}
                    >
                      Try changing your filters or upload a
                      bank statement.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
}

