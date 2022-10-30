import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../../auth/utils'
import { createTodo } from '../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import { TodoItem } from '../../models/TodoItem'

const logger = createLogger('TodosAccess')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodoItem: CreateTodoRequest = JSON.parse(event.body)
    const userId: string = getUserId(event)
    logger.info('Start create todo item!')
    let todoItem: TodoItem
    if(newTodoItem) {
      todoItem = await createTodo(newTodoItem, userId)
    }

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: todoItem
      })
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
