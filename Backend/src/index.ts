import { config } from "dotenv";
import { fileURLToPath } from "node:url";

config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const { app } = await import("./app.js");
const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`Product catalogue API listening on http://localhost:${port}`);
});