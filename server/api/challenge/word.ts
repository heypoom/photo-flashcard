import {gristSql} from '~/utils/grist-sql'

export default defineEventHandler(async () => {
  let start = Date.now()
  console.log('--- /api/challenge/word starts')

  const query = 'select * from Words order by RANDOM() limit 1'
  const records = await gristSql<{Photos: string}>(query)

  console.log(`--- randomized row took ${Date.now() - start}ms`)

  const final = await Promise.all(
    records.map(async (record) => {
      const attachmentIds = await getAttachmentIdsForWord(
        JSON.parse(record.Photos)
      )

      return {...record, attachmentIds}
    })
  )

  console.log(`--- /api/challenge/word took ${Date.now() - start}ms`)

  return final
})

async function getAttachmentIdsForWord(
  photoRecordIds: number[]
): Promise<number[]> {
  const start = Date.now()

  const query = 'select Photo from Photos where id = ?'
  const records = await gristSql<{Photo: string}>(query, photoRecordIds)

  console.log(`--- getAttachmentIdsForWord took ${Date.now() - start}ms`)

  return records.flatMap((record) => {
    return JSON.parse(record.Photo) as number[]
  })
}
