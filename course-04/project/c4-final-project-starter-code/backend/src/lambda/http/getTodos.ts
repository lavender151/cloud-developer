import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getTodos as getTodosForUser } from '../businessLogic/todos'
import { getUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('TodosAccess')

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Start get todo item!')
    const userId: string = getUserId(event)
    const items = await getTodosForUser(userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items
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
