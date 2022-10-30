import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { todoExists as patchTodo } from '../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('TodosAccess')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Start delete todo item!')
    const todoIdItem = event.pathParameters.todoId
    let status: boolean
    if(todoIdItem){
      status = await patchTodo(todoIdItem)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: status
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
