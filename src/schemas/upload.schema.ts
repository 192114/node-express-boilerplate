import { z } from 'zod'

import { config } from '@/config/index.js'

const { allowedMimeTypes } = config.upload

export const uploadSingleSchema = z.object({
  file: z
    .custom<Express.Multer.File>()
    .refine((f) => !!f, '必须上传文件')
    .refine((f) => allowedMimeTypes.includes(f.mimetype), '不允许的文件类型'),
})

export const uploadMultipleSchema = z.object({
  files: z
    .array(z.custom<Express.Multer.File>())
    .min(1, '至少上传 1 个文件')
    .max(config.upload.maxFiles, '超出最大文件数')
    .refine((fs) => fs.every((f) => allowedMimeTypes.includes(f.mimetype)), '存在不允许的文件类型'),
})
