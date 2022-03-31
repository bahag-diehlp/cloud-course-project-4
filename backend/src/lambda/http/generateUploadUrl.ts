import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { TodosAccess } from '../../dataLayer/todosAcess'
import { createLogger } from '../../utils/logger'
import { attachmentUtils } from '../../helpers/attachmentUtils'

const au = new attachmentUtils();
const todosAccess = new TodosAccess()
const logger = createLogger('generateUploadUrl')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
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
    
    const uploadUrl = await au.generateUploadUrl(todoId, userId);
    logger.info(uploadUrl)
    logger.info(`Successfully uploaded the Url`)
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
          },
          body: JSON.stringify({
            ["uploadUrl"]: uploadUrl
          })
        }
}