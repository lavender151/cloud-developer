import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodoAttachment } from '../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../../auth/utils'

const logger = createLogger('Update Todo Attachment')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Start update todo attachment', event)
    const todoId = event.pathParameters.todoId
    const userId: string = getUserId(event)
    let updatedItem: void
    if(todoId){
      updatedItem = await updateTodoAttachment(userId, todoId)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        item: updatedItem
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
