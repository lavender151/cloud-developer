import * as uuid from 'uuid'

import { TodoItem } from '../../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const todoAccess = new TodoAccess()

export async function getTodos(userId: string): Promise<TodoItem[]> {
  return todoAccess.getTodosForUser(userId)
}

export async function getTodo(
  userId: string,
  todoId: string
): Promise<TodoItem> {
  return todoAccess.getTodo(userId, todoId)
}

export async function updateTodo(
  userId: string,
  todoId: string,
  payload: UpdateTodoRequest
): Promise<void> {
  return todoAccess.updateTodo(userId, todoId, payload)
}

export async function updateTodoAttachment(
  userId: string,
  todoId: string
): Promise<void> {
  return todoAccess.updateTodoAttachment(userId, todoId)
}

export async function deleteTodo(userId: string, id: string): Promise<void> {
  return todoAccess.deleteTodo(userId, id)
}

export async function createTodo(
  todoItemRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()

  return await todoAccess.createTodo({
    todoId,
    userId,
    name: todoItemRequest.name,
    done: false,
    createdAt: new Date().toISOString(),
    dueDate: todoItemRequest.dueDate
  })
}

export async function todoExists(id: string): Promise<boolean> {
  return await todoAccess.todoExists(id)
}

export async function removeTodoAttachment(userId: string, id: string): Promise<void> {
  return todoAccess.removeTodoAttachment(userId, id);
}