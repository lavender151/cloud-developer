import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../../models/TodoItem'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'

const logger = createLogger('TodoAccess')

const XAWS = AWSXRay.captureAWS(AWS)

export class TodoAccess {
  private docClient: DocumentClient = createDynamoDBClient()

  async getTodosForUser(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient
      .query({
        TableName: process.env.TODOS_TABLE,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()
    const items = result.Items

    return items as TodoItem[]
  }

  async getTodo(todoId: string, userId: string): Promise<TodoItem> {
    const result = await this.docClient
      .get({
        TableName: process.env.TODOS_TABLE,
        Key: {
          todoId,
          userId
        }
      })
      .promise()

    return result.Item as TodoItem
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: process.env.TODOS_TABLE,
        Item: todo
      })
      .promise()

    return todo
  }

  async deleteTodo(userId: string, todoId: string): Promise<void> {
    await this.docClient
      .delete({
        TableName: process.env.TODOS_TABLE,
        Key: {
          todoId,
          userId
        }
      })
      .promise()

    return
  }

  async updateTodo(
    userId: string,
    todoId: string,
    todo: UpdateTodoRequest
  ): Promise<void> {
    logger.info('Starting update todo: ', todo)
    await this.docClient
      .update({
        TableName: process.env.TODOS_TABLE,
        Key: { todoId, userId },
        UpdateExpression:
          'set #name = :updateName, #done = :doneStatus, #dueDate = :updateDueDate',
        ExpressionAttributeNames: {
          '#name': 'name',
          '#done': 'done',
          '#dueDate': 'dueDate'
        },
        ExpressionAttributeValues: {
          ':updateName': todo.name,
          ':doneStatus': todo.done,
          ':updateDueDate': todo.dueDate
        },
        ReturnValues: 'UPDATED_NEW'
      })
      .promise()

    return
  }

  async updateTodoAttachment(userId: string, todoId: string): Promise<void> {
    await this.docClient
      .update({
        TableName: process.env.TODOS_TABLE,
        Key: { todoId, userId },
        UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
        ExpressionAttributeNames: { '#attachmentUrl': 'attachmentUrl' },
        ExpressionAttributeValues: {
          ':attachmentUrl': `https://${process.env.ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/${todoId}`
        },
        ReturnValues: 'UPDATED_NEW'
      })
      .promise()
  }

  async todoExists(todoId: string): Promise<boolean> {
    const result = await this.docClient
      .get({
        TableName: process.env.TODOS_TABLE,
        Key: {
          todoId
        }
      })
      .promise()

    return !!result.Item
  }

  async removeTodoAttachment(userId: string, todoId: string): Promise<void> {
    await this.docClient.update({
      TableName: process.env.TODOS_TABLE,
      Key: { todoId, userId },
      UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
      ExpressionAttributeNames: { '#attachmentUrl': 'attachmentUrl' },
      ExpressionAttributeValues: {
        ':attachmentUrl': ''
      },
      ReturnValues: "UPDATED_NEW"
    }).promise();
  }
}

function createDynamoDBClient() {
  return new XAWS.DynamoDB.DocumentClient()
}
