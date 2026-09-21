const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const pool = require("../config/db");

const signupSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

async function signup(req, res) {
  const result = signupSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Name, valid email and password of at least 8 characters are required"
    });
  }

  const { name, email, password } = result.data;
  const userEmail = email.toLowerCase();

  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [userEmail]
  );

  if (existingUser.rowCount > 0) {
    return res.status(409).json({
      message: "Email already registered"
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const resultUser = await pool.query(
    `INSERT INTO users(name, email, password_hash)
     VALUES($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, userEmail, passwordHash]
  );

  const user = resultUser.rows[0];

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.status(201).json({
    user,
    token
  });
}

async function login(req, res) {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Valid email and password are required"
    });
  }

  const { email, password } = result.data;

  const userResult = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email.toLowerCase()]
  );

  const user = userResult.rows[0];

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password"
    });
  }

  const passwordMatch = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatch) {
    return res.status(401).json({
      message: "Invalid email or password"
    });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    token
  });
}

async function me(req, res) {
  const result = await pool.query(
    "SELECT id, name, email, created_at FROM users WHERE id = $1",
    [req.user.id]
  );

  if (!result.rowCount) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  res.json({
    user: result.rows[0]
  });
}

module.exports = {
  signup,
  login,
  me
};