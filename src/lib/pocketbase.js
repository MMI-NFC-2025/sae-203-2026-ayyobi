import PocketBase from "pocketbase";

const url =
  import.meta.env.PUBLIC_POCKETBASE_URL ||
  "https://lesrivesduterritoire.ayyobi.fr";

export const pb = new PocketBase(url);
