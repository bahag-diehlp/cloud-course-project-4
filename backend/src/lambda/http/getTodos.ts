import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'
import { TodosAccess } from '../../dataLayer/todosAcess';
import { attachmentUtils } from '../../helpers/attachmentUtils';

const au = new attachmentUtils();
const logger = createLogger('getTodos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing event:${event}`)
  
  const userId = getUserId(event) 
  logger.info(`get Todos for user ${userId}`)
  const result = await new TodosAccess().getUserTodos(userId)


  for(const record of result){
    record.attachmentUrl = await au.getTodoAttachmentUrl(record.todoId)
  }
    
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      ['items']:result
    })
  }
}