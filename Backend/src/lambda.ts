import { createRequire } from "node:module";
import type { Handler } from "aws-lambda";
import { app } from "./app.js";

const serverlessExpress = createRequire(import.meta.url)("@codegenie/serverless-express") as (options: { app: typeof app }) => Handler;
export const handler = serverlessExpress({ app });