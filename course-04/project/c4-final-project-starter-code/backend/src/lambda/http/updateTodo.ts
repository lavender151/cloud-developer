import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger';
import { getUserId } from '../../auth/utils'

const logger = createLogger('Update Todo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Start update todo item ', event);
    const todoIdItem = event.pathParameters.todoId;
    const userId: string = getUserId(event);
    const updatedTodoItem: UpdateTodoRequest = JSON.parse(event.body);
    logger.info('Update todo item ', updatedTodoItem)

    const itemUpdated = await updateTodo(userId, todoIdItem, updatedTodoItem);

    return {
      statusCode: 200,
      body: JSON.stringify({
        item: itemUpdated
      })
    }
  })

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
