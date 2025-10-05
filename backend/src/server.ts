const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());

interface User {
  name: string;
  email: string;
  password: string;
}

interface JwtPayload {
  id: number;
}

// SIGNUP
app.post("/api/auth/signup", async (req: any, res: any) => {
  const { name, email, password } = req.body as User;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ message: "Email already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  res.json({ message: "User created", user: { id: user.id, email: user.email } });
});

// LOGIN
app.post("/api/auth/login", async (req: any, res: any) => {
  const { email, password } = req.body as Pick<User, "email" | "password">;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user.id }, "secret123", { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email } });
});

// PROTECTED ROUTE
app.get("/api/auth/me", async (req: any, res: any) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "No token" });

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "secret123") as JwtPayload;
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));