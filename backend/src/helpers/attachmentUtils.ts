import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
export class attachmentUtils{

    constructor(
        XAWS = AWSXRay.captureAWS(AWS),
        private readonly  s3:AWS.S3 = new XAWS.S3({
            signatureVersion: 'v4',
            region: process.env.region,
            params: {Bucket: process.env.S3_BUCKET}
          }),
          private readonly  signedUrlExpireSeconds = 30 * 5
    ){
        
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