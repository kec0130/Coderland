import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import pino from "pino";
import asyncHandler from "./utils/async-handler";

const app = express();

const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});

dotenv.config();

const port = process.env.PORT || 3333;
const mongoUri = process.env.MONGO_URI;

mongoose.connect(`${mongoUri}/coderland`, () => {
  logger.info("DB connected");
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ isOk: true });
});

app.get(
  "/error",
  asyncHandler(async (req: Request, res: Response) => {
    throw new Error("에러가 발생했어요...");
    res.status(200).json({ isOk: true });
  })
);

app.use((req: Request, res: Response) => {
  res.status(404).json({ isOk: false, msg: "뭔가 잘못된 것 같아요..." });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(403).json({ isOk: false, msg: err.message });
  next();
});

app.listen(port, () => {
  logger.info(`Start App at ${port}`);
});

export default app;
