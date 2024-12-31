import {GRIST_API_PREFIX} from '~/constants/grist'

export default defineEventHandler(async (event) => {
  const attachmentId = getRouterParam(event, 'id')

  const response = await fetch(
    `${GRIST_API_PREFIX}/attachments/${attachmentId}/download`,
    {headers: {Authorization: `Bearer ${process.env.GRIST_API_KEY}`}}
  )

  setHeader(
    event,
    'Cache-Control',
    'public, s-maxage=31536000, max-age=31536000'
  )

  sendWebResponse(event, response)
})
