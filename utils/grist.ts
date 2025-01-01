import { GristDocAPI } from "grist-api";

const GRIST_DOC_URL = "https://docs.getgrist.com/3V4SbuMmR4M3/Photo-Flashcard";

export const getGristApi = () =>
  new GristDocAPI(GRIST_DOC_URL, {
    apiKey: process.env.GRIST_API_KEY,
  });
