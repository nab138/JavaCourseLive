const PROD_WS_URL = "wss://204.216.110.2:3001/";
const DEV_WS_URL = "ws://localhost:3001/";
export const WS_URL = import.meta.env.DEV ? DEV_WS_URL : PROD_WS_URL;
