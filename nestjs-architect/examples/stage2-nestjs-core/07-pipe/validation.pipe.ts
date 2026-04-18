// ========== 自定义验证管道 ==========

import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ValidatePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const { type, metatype } = metadata;

    if (type === 'body' && metatype) {
      // 自定义验证逻辑
      if (typeof value.id !== 'undefined' && !Number.isInteger(value.id)) {
        throw new BadRequestException('id 必须是整数');
      }
    }

    return value;
  }
}
