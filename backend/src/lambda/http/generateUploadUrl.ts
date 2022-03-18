import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { TodosAccess } from '../../helpers/todosAcess'
import { createLogger } from '../../utils/logger'
import { attachmentUtils } from '../../helpers/attachmentUtils'

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
            'Access-Control-Allow-Origin': '*'
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
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(
          'No Access rights to delete this users todo'
        )
      }
    }
    
    const url = new attachmentUtils().getPresignedUrl(todoId)
    logger.error(`Successfully uploaded the Url`)
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(
            url
          )
        }
}