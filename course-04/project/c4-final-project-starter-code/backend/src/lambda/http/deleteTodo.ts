import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../businessLogic/todos'
import { getUserId } from '../../auth/utils'
import { removeAttachment } from '../helpers/attachmentUtils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('TodosAccess')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Start delete todo item!')
    const todoIdItem = event.pathParameters.todoId
    const userId: string = getUserId(event)
    await deleteTodo(userId, todoIdItem)
    await removeAttachment(todoIdItem)

    return {
      statusCode: 200,
      body: JSON.stringify({})
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    origin: '*',
    credentials: true
  })
)
