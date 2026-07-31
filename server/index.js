import { createApp } from "./app.js";
import pageHandler from "../dist/server/index.js";
const port=Number(process.env.PORT||3000);createApp({pageHandler}).listen(port,()=>console.log(`Tempo Pass staging listening on http://localhost:${port}`));
