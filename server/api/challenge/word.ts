import type {IRecord} from 'grist-api'

import {GRIST_API_PREFIX} from '~/constants/grist'

export default defineEventHandler(async () => {
  let start = Date.now()
  console.log('--- /api/challenge/word starts')

  const query = `select * from Words order by RANDOM() limit 1`
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

export async function gristSql<T extends IRecord>(query: string, args?: any[]) {
  const body = JSON.stringify({
    sql: query,
    timeout: 500,

    ...(args && {args}),
  })

  const response = await fetch(`${GRIST_API_PREFIX}/sql`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GRIST_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body,
  })

  const data: {records: {fields: T & IRecord}[]} = await response.json()

  return data.records.map((record) => record.fields)
}
