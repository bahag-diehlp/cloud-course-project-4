import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { TodosAccess } from '../../dataLayer/todosAcess'
import { createLogger } from '../../utils/logger'

const todosAccess = new TodosAccess()
const logger = createLogger('deleteTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    if(!todoId){
      logger.error('cannot delete without Id')
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(
          'TodoId is empty. Pls setup an id'
        )
      }
    }

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

    logger.info(`User ${userId} deleting todo ${todoId}`)
    await todosAccess.deleteTodoById(todoId)
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(
        'Deleted successfully'
      )
    }
  
}
