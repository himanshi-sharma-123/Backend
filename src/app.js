import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
); // 'use' most of the times used for middlewares

app.use(
  express.json({
    limit: "16kb",
  })
); //json accepted
app.use(express.urlencoded({ extended: true, limit: "16kb" })); //data from url (himanhsi+sharma)
app.use(express.static("public")); //access public assests , everyone can see
app.use(cookieParser()); // for doing crud operations on cookies

// routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter); //prefix http://localhost:8000/api/v1/users/register
app.use("/api/v1/videos", videoRouter);
export { app };
