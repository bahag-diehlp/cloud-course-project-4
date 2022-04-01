import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const uuid = require('uuid/v4')
const logger = createLogger('TodosAccess')

export class TodosAccess{
    constructor(
        private readonly docClient = new DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly userIdIndex = process.env.USER_ID_INDEX
    )
        {}

    async getUserTodos(userId: string): Promise<TodoItem[]>{
        logger.info('start get Todos');
        logger.info(this.todosTable);
        logger.info(this.userIdIndex);
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues:{
                ':userId':userId
            }
        }).promise()
        console.log('Get group: ', result)
        return result.Items as TodoItem[]
    }

    async createTodo(request: CreateTodoRequest,userId: string): Promise<TodoItem>{
        logger.info('start create Todo');
        const newId = uuid()
        const item = new TodoItem;
        item.userId= userId
        item.todoId= newId
        item.createdAt= new Date().toISOString()
        item.name= request.name
        item.dueDate= request.dueDate
        item.done= false
  
        await this.docClient.put({
            TableName: this.todosTable,
            Item: item
        }).promise()

        return item
    }


    async getTodoById(id: string): Promise<AWS.DynamoDB.QueryOutput>{
        logger.info('start get Todo');
        return await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues:{
                ':todoId': id
            }
        }).promise()
    }

    async updateTodo(updatedTodo:UpdateTodoRequest,todoId:string){
        logger.info('start update Todo');
        await this.docClient.update({
            TableName: this.todosTable,
            Key:{
                'todoId':todoId
            },
            UpdateExpression: 'set #namefield = :n, dueDate = :d, done = :done',
            ExpressionAttributeValues: {
                ':n' : updatedTodo.name,
                ':d' : updatedTodo.dueDate,
                ':done' : updatedTodo.done
            },
            ExpressionAttributeNames:{
                "#namefield": "name"
              }
          }).promise()
    }

    async deleteTodoById(todoId: string){
        logger.info('start delete Todo');
        const param = {
            TableName: this.todosTable,
            Key:{
                "todoId":todoId
            }
        }
      
         await this.docClient.delete(param).promise()
    }
    
}