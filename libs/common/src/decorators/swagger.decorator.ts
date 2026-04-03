import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  Allow,
  ArrayNotEmpty,
  IsBoolean,
  IsDate,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinDate,
  MinLength,
  ValidateNested,
} from 'class-validator';

const ApiPropType = (type, options: ApiPropertyOptions) =>
  applyDecorators(
    ApiProperty({
      type,
      description: options?.required ? 'required' : 'not required',
      ...options,
    }),
    options?.required ? IsDefined() : IsOptional(),
  );

export function SwaggerString(
  options: ApiPropertyOptions & { trim?: boolean } = {
    default: 'This field is string',
    required: false,
  },
) {
  return applyDecorators(
    ApiPropType('string', options),
    IsString(),
    ...(options?.required ? [IsNotEmpty()] : []),
    ...(options?.maxLength !== undefined ? [MaxLength(options.maxLength)] : []),
    ...(options?.minLength !== undefined ? [MinLength(options.minLength)] : []),
    ...(options?.trim
      ? [
          Transform(({ value }: { value: string }): string => {
            return value.trim();
          }),
        ]
      : []),
  );
}

export function SwaggerNumber(
  options: ApiPropertyOptions = { default: 99, required: false },
) {
  return applyDecorators(
    ApiPropType('number', options),
    Type(() => Number),
    IsNumber(),
    ...(options?.minimum !== undefined ? [Min(options.minimum)] : []),
    ...(options?.maximum !== undefined ? [Max(options.maximum)] : []),
  );
}

export function SwaggerBoolean(
  options: ApiPropertyOptions = { default: false, required: false },
) {
  return applyDecorators(
    ApiPropType('boolean', options),
    IsBoolean(),
    Transform(({ value }: { value: unknown }) => {
      if (value === undefined) return value;
      if (
        value === false ||
        value === 'false' ||
        value === 0 ||
        value === '0' ||
        value === null
      ) {
        return false;
      }
      return true;
    }),
  );
}

export function SwaggerEnum(options: ApiPropertyOptions = { required: false }) {
  return applyDecorators(
    ApiPropType('enum', options),
    ...(!options.required
      ? [
          Transform(({ value }: { value: unknown }) =>
            value === '' ? null : value,
          ),
        ]
      : []),
    IsEnum(options.enum as any),
  );
}

export function SwaggerInterface(
  type: any,
  options: ApiPropertyOptions = { required: false },
) {
  return applyDecorators(
    ApiProperty({ type, ...options }),
    ValidateNested({ each: true }),
    options?.required ? IsDefined() : IsOptional(),
    Type(typeof type === 'function' && !type.prototype ? type : () => type),
  );
}

export function SwaggerDateTime(
  options: ApiPropertyOptions = {
    default: new Date().toISOString(),
    required: false,
  },
) {
  return applyDecorators(
    ApiPropType('string', {
      format: 'date-time',
      description: `Example: ${new Date().toISOString()}`,
      ...options,
    }),
    IsDate(),
    Type(() => Date),
    MinDate(new Date(0)),
  );
}

export function SwaggerArray(
  options: ApiPropertyOptions = { required: false },
) {
  return applyDecorators(
    ApiProperty({
      isArray: true,
      description: options.required ? 'required' : 'not required',
      ...options,
    }),
    ...(options.required ? [ArrayNotEmpty()] : []),
  );
}

export function SwaggerEmail(
  options: ApiPropertyOptions = {
    example: 'user@example.com',
    required: false,
  },
) {
  return applyDecorators(
    ApiPropType('string', {
      format: 'email',
      ...options,
    }),
    IsString(),
    ...(options?.required ? [IsNotEmpty()] : []),
  );
}

export function SwaggerFile(
  options: ApiPropertyOptions = {
    description: 'File upload',
    required: false,
  },
) {
  return applyDecorators(
    ApiProperty({
      type: 'string',
      format: 'binary',
      ...options,
    }),
  );
}

export function ObjectAny(
  options: ApiPropertyOptions = { required: false, example: {} },
) {
  return applyDecorators(
    ApiProperty({ type: Object, ...options }),
    options?.required ? IsDefined() : IsOptional(),
    Allow(),
  );
}
