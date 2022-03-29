import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { TodosAccess } from '../../helpers/todosAcess'

const logger = createLogger('updateTodo')
const todosAccess = new TodosAccess()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)
  
    const item = await todosAccess.getTodoById(todoId)
  
    if(item.Count == 0){
      logger.error(`Cannot find ${todoId}`)
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(
          'TodoID not exists in the TodoTable. Pls select a existing one'
        )
      }
    } 

    if(item.Items[0].userId !== userId){
      logger.error(`The User does not have any right to delete this item`)
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(
          'No Access rights to delete this users todo'
        )
      }
    }

    logger.info(`Update Successfully`)
    await new TodosAccess().updateTodo(updatedTodo,todoId)
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(
        'Update successfully'
      )
    }
  
}