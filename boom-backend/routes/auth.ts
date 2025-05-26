import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Auth } from "../models/Auth";

const router = express.Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const auth = new Auth({ email, password });
    await auth.save();
    res.status(201).json({ message: "User registered" });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const auth = await Auth.findOne({ email });
    if (!auth || !(await auth.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: auth._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/logout", async (req: Request, res: Response) => {
  // Invalidate token on client-side by removing it
  res.json({ message: "Logged out" });
});

export default router;