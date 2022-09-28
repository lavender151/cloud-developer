import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../helpers/attachmentUtils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('attachment')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Generate upload processing event: ', event)
    const todoId = event.pathParameters.todoId
    const uploadUrl = createAttachmentPresignedUrl(todoId)

    logger.info('Url upload: %s', uploadUrl)

    return {
      statusCode: 202,
      body: JSON.stringify({
        uploadUrl
      })
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    origin: '*',
    credentials: true
  })
)
