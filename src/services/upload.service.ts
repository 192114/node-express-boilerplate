import { config } from '@/config/index.js'
import { HttpError, ErrorCode } from '@/utils/httpError.js'

const buildPublicUrl = (filename: string) => {
  const { dir } = config.upload

  return `/${dir}/${filename}`
}

export const uploadSingleService = async (file?: Express.Multer.File) => {
  if (!file) {
    throw new HttpError(ErrorCode.VALIDATION_ERROR, '未接收到文件')
  }
  return {
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
    url: buildPublicUrl(file.filename),
  }
}

export const uploadMultipleService = async (files?: Express.Multer.File[]) => {
  if (!files || files.length === 0) {
    throw new HttpError(ErrorCode.VALIDATION_ERROR, '未接收到文件')
  }
  return Promise.all(files.map((file) => uploadSingleService(file)))
}
