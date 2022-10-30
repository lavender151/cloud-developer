import * as AWS from 'aws-sdk'

import { createLogger } from '../../utils/logger'

const logger = createLogger('S3 Attachment')

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

export function createAttachmentPresignedUrl(todoId: string): string {
  return s3.getSignedUrl('putObject', {
    Bucket: process.env.ATTACHMENT_S3_BUCKET,
    Key: todoId,
    Expires: parseInt(process.env.SIGNED_URL_EXPIRATION)
  })
}

export async function removeAttachment(id: string): Promise<void> {
  const params = {
    Bucket: process.env.ATTACHMENT_S3_BUCKET,
    Key: id
  }
  try {
    await s3.headObject(params).promise()
    logger.info('Founded in S3')
    try {
      await s3.deleteObject(params).promise()
      logger.info('Deleted Successfully')
    } catch (err) {
      logger.error('Delete error file : ' + JSON.stringify(err))
    }
  } catch (err) {
    logger.error('File not Found : ' + err.code)
  }
}

export function createAttachmentDownloadedUrl(key: string): string {
  return s3.getSignedUrl("getObject", {
    Bucket: process.env.ATTACHMENT_S3_BUCKET,
    Key: key,
    Expires: parseInt(process.env.SIGNED_URL_EXPIRATION),
  });
}