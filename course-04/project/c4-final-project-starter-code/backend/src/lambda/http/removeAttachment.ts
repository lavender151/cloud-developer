import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getUserId } from '../../auth/utils'
import { removeTodoAttachment } from '../businessLogic/todos'
import { removeAttachment } from '../helpers/attachmentUtils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('Remove attachment Todo')


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Start remove attachment ', event)
    const todoId = event.pathParameters.todoId
    const userId: string = getUserId(event)
    const s3Key = event.body
    // Remove from S3 bucket
    await removeAttachment(s3Key);
    // Set attachment is empty in DynamoDB
    await removeTodoAttachment(userId, todoId);

    return {
      statusCode: 200,
      body: JSON.stringify({})
    };
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors(
      {
        origin: "*",
        credentials: true,
      }
    )
  )
