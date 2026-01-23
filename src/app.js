import express from "express";
import cors from "cors";

const app = express();

//basic configuartion
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//cors configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://locahost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

//import the routes

import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser";

app.use("/api/v1/healthcheck", healthCheckRouter); // if anyone hits api/v1/healthcheck they will be controlled by helathcheckrouter
app.use("/api/v1/auth", authRouter);   // lly here


app.get("/", (req, res) => {
  res.send("welcome to basecampy");
});
export default app;
