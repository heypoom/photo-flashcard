import { gristSql } from "~/utils/grist-sql"

export default defineEventHandler(async (event) => {
  const albumId = getRouterParam(event, "albumId")

  console.log(`--- /api/challenge/${albumId} starts`)
  const start = Date.now()

  const [record] = await gristSql<{ Photos: string }>(
    "select Word, Pronunciation, Meaning, Language from Words where AlbumId = ? order by RANDOM() limit 1",
    [albumId],
  )

  const _runtime = Date.now() - start
  console.log(`--- /api/challenge/${albumId} took ${_runtime}ms`)

  if (!record) {
    return { error: "album is empty", _runtime }
  }

  return { ...record, _runtime }
})
