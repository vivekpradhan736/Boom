// types/express/index.d.ts
import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string; // Optional or string based on your logic
  }
}
