async function getAttachmentIdsForWord(
  photoRecordIds: number[],
): Promise<number[]> {
  const start = Date.now()

  const query = "select Photo from Photos where id = ?"
  const records = await gristSql<{ Photo: string }>(query, photoRecordIds)

  console.log(`--- getAttachmentIdsForWord took ${Date.now() - start}ms`)

  return records.flatMap((record) => {
    return JSON.parse(record.Photo) as number[]
  })
}
