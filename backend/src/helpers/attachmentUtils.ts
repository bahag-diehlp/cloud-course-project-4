import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as AWSXRay from 'aws-xray-sdk'
export class attachmentUtils{

    constructor(
        private readonly docClient = new DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        //private readonly userIdIndex = process.env.USER_ID_INDEX,
        XAWS = AWSXRay.captureAWS(AWS),
        private readonly  s3:AWS.S3 = new XAWS.S3({
            signatureVersion: 'v4',
            region: process.env.region,
            params: {Bucket: process.env.S3_BUCKET}
          }),
          private readonly  signedUrlExpireSeconds = 30 * 5
    ){
        
    }

    async generateUploadUrl(todoId: string, userId: string): Promise<string> {
        const uploadUrl = this.s3.getSignedUrl("putObject", {
          Bucket: process.env.S3_BUCKET,
          Key: `${todoId}.png`,
          Expires: this.signedUrlExpireSeconds
      });
      await this.docClient.update({
            TableName: this.todosTable,
            Key: { userId, todoId },
            UpdateExpression: "set attachmentUrl=:URL",
            ExpressionAttributeValues: {
              ":URL": uploadUrl.split("?")[0]
          },
          ReturnValues: "UPDATED_NEW"
        })
        .promise();
      return uploadUrl;
    }

    async getTodoAttachmentUrl(todoId: string): Promise<string>{
        
        try{
            await this.s3.headObject({
            Bucket: process.env.S3_BUCKET,
            Key: `${todoId}.png` 
        }).promise();
        
        return  this.s3.getSignedUrl('getObject', {
            Bucket: process.env.S3_BUCKET,
            Key: `${todoId}.png`,
            Expires: this.signedUrlExpireSeconds
            });
        }catch(err){
            console.log(err)
        }
        return null
    }

    getPresignedUrl(todoId: string): string{
        return this.s3.getSignedUrl('putObject', {
            Bucket: process.env.S3_BUCKET,
            Key: `${todoId}.png`,
            Expires: this.signedUrlExpireSeconds
          }) as string ;
    }
}