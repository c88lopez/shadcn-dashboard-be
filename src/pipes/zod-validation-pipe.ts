import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      this.schema.parse(value);

      return value;
    } catch (error) {
      throw new BadRequestException(
        (error as unknown as ZodError).issues[0].message,
      );
    }
  }
}
