import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'
import { TodosAccess } from '../../helpers/todosAcess';


const logger = createLogger('getTodos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing event:${event}`)
  
  const userId = getUserId(event) 
  logger.info(`get Todos for user ${userId}`)
  const items = await new TodosAccess().getUserTodos(userId)
    

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      items
    })
  }
}