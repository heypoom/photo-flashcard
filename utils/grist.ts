import { GristDocAPI } from "grist-api"

const GRIST_DOC_URL =
  "https://grist.creatorsgarten.org/6ZgjVMTXyAbV/Photo-Flashcard"

export const getGristApi = () =>
  new GristDocAPI(GRIST_DOC_URL, {
    apiKey: process.env.GRIST_API_KEY,
  })
