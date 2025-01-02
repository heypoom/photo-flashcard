import { getGristApi } from "~/utils/grist"

export default defineEventHandler(async (event) => {
  const grist = getGristApi()
  const albumId = getRouterParam(event, "albumId")

  if (!albumId) {
    throw createError({
      statusCode: 400,
      message: "Album ID is required",
    })
  }

  const records = await grist.fetchTable("Albums", {
    id: [Number(albumId)],
  })

  if (!records.length) {
    throw createError({
      statusCode: 404,
      message: "Album not found",
    })
  }

  const [record] = records

  return {
    ...record,
    Languages: (record.Languages as string[])?.slice(1),
  }
})
