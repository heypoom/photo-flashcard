import { gristSql } from "~/utils/grist-sql"
import type { Language } from "~/types/language"

export default defineEventHandler(async (event) => {
  const albumId = getRouterParam(event, "albumId")
  const query = getQuery(event)
  const language = query.language as Language | undefined

  console.log(`--- /api/challenge/${albumId}?language=${language} starts`)
  const start = Date.now()

  const params: any[] = [albumId]
  let sql =
    "select Word, Pronunciation, Meaning, Language from Words where AlbumId = ?"

  if (language) {
    sql += " and Language = ?"
    params.push(language)
  }

  sql += " order by RANDOM() limit 1"

  const [record] = await gristSql<{ Photos: string }>(sql, params)

  const _runtime = Date.now() - start
  console.log(`--- /api/challenge/${albumId} took ${_runtime}ms`)

  if (!record) {
    return { error: "album is empty", _runtime }
  }

  return { ...record, _runtime }
})
