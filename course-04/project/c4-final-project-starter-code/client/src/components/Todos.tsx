import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos, patchTodo, removeAttachment, getDownloadUrl, download} from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  newTodoName: string
  loadingTodos: boolean
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: '',
    loadingTodos: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      if (this.state.newTodoName) {
        const newTodo = await createTodo(this.props.auth.getIdToken(), {
          name: this.state.newTodoName,
          dueDate
        })
        this.setState({
          todos: [...this.state.todos, newTodo],
          newTodoName: ''
        })
      } else {
        alert('Task need a name!')
      }
    } catch {
      alert('Todo creation failed')
    }
  }

  onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), todoId)
      this.setState({
        todos: this.state.todos.filter(todo => todo.todoId !== todoId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const todo = this.state.todos[pos]
      const status = await patchTodo(this.props.auth.getIdToken(), todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      console.log('status', status);
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  onRemoveAttachmentButtonClick = async (todo: Todo) => {
    const todoId = todo.todoId;
    if (todo.attachmentUrl) {
      const attachmentUrl = todo.attachmentUrl;
      const attachmentUrlSplit = attachmentUrl.split("/");
      const length = attachmentUrlSplit.length;
      const s3Key = `${attachmentUrlSplit[length - 2]}/${attachmentUrlSplit[length - 1]
        }`;
      const idToken = this.props.auth.getIdToken();
      await removeAttachment(idToken, todoId, s3Key);
      let updatedTodos: Todo[] = [];
      this.state.todos.forEach(function (todo) {
        if (todo.todoId === todoId) {
          todo.attachmentUrl = "";
          updatedTodos.push(todo);
        } else {
          updatedTodos.push(todo);
        }
      });
      this.setState({
        todos: updatedTodos,
      });
    }
  };

  onDownloadButtonClick = async (todoId: string) => {
    const todo = this.state.todos.find((todo) => todo.todoId === todoId);
    if (todo?.attachmentUrl) {
      const attachmentUrl = todo.attachmentUrl;
      const attachmentUrlSplit = attachmentUrl.split("/");
      const length = attachmentUrlSplit.length;
      const todoAttachment = `${
        attachmentUrlSplit[length - 1]
      }`;
      const idToken = this.props.auth.getIdToken();
      const downloadUrl = await getDownloadUrl(
        idToken,
        todoAttachment
      );
      console.log(downloadUrl);
      download(downloadUrl, attachmentUrlSplit[length - 1]);
    }
  };

  async componentDidMount() {
    try {
      const todos = await getTodos(this.props.auth.getIdToken())
      this.setState({
        todos,
        loadingTodos: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${e}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">TODOs</Header>

        {this.renderCreateTodoInput()}

        {this.renderTodos()}
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onTodoCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Grid padded>
        {this.state.todos.map((todo, pos) => {
          return (
            <Grid.Row key={todo.todoId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onTodoCheck(pos)}
                  checked={todo.done}
                />
              </Grid.Column>
              <Grid.Column width={6} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {todo.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(todo.todoId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="purple"
                  onClick={() => this.onDownloadButtonClick(todo.todoId)}
                >
                  <Icon name="download" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="yellow"
                  onClick={() => this.onRemoveAttachmentButtonClick(todo)}
                >
                  <Icon name="unlinkify" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(todo.todoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl && (
                <Image src={todo.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
