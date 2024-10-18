import express, { Request, Response } from "express";
import { router as serviceRouter } from "../service/api/router";
import helmet from "helmet";
import cors from "cors";
import * as dotenv from "dotenv";
import compression from "compression";
dotenv.config();

const app = express();

export async function runServer() {
  try {
    const port: string = process.env.SERVER_PORT;
    const feeCharterOrigin = process.env.FEE_CHARTER_ORIGIN;
    console.log({feeCharterOrigin})
    const baseApiRoute = "/api/v1";
    //used for btc-fee-watcher
    const corsOptions = {
      origin: feeCharterOrigin,
      methods: 'GET,HEAD,PUT,PATCH,POST',
      credentials: false, // if you need to support credentials (cookies, etc.)
      optionsSuccessStatus: 204
    };
    
    app.use(cors(corsOptions));
    app.use(compression({}));
    app.use(baseApiRoute, serviceRouter);

    app.get("/", (req: Request, res: Response) => {
      res.redirect(baseApiRoute);
    });
    app.get("/api/v1", (req: Request, res: Response) => {
      res.send("Hello from BTC Fee Watcher!");
    });

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}${baseApiRoute}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

export default app;
