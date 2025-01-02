import type { IRecord } from "grist-api"

import { GRIST_API_PREFIX } from "~/constants/grist"

export async function gristSql<T extends IRecord>(query: string, args?: any[]) {
  const body = JSON.stringify({
    sql: query,
    timeout: 500,

    ...(args && { args }),
  })

  const response = await fetch(`${GRIST_API_PREFIX}/sql`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GRIST_API_KEY}`,
      "Content-Type": "application/json",
    },
    body,
  })

  const data: { records: { fields: T & IRecord }[] } = await response.json()

  return data.records.map((record) => record.fields)
}
