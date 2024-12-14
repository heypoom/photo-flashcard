import {GRIST_API_PREFIX} from '~/constants/grist'

export default defineEventHandler(async (event) => {
  const attachmentId = getRouterParam(event, 'id')

  const response = await fetch(
    `${GRIST_API_PREFIX}/attachments/${attachmentId}/download`,
    {headers: {Authorization: `Bearer ${process.env.GRIST_API_KEY}`}}
  )

  sendWebResponse(event, response)
})
