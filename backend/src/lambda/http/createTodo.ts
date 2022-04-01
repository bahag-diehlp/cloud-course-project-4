import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'
import { TodosAccess } from '../../dataLayer/todosAcess'

const logger = createLogger('createTodos')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item

    const userId = getUserId(event)
    logger.info(`create group for user ${userId} with data ${newTodo}`)
    const item = await new TodosAccess().createTodo(newTodo,userId)
    
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item
      })
    }
}