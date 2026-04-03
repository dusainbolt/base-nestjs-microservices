import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  Allow,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsDefined,
  IsEmail,
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

const ApiPropType = (type: any, options: ApiPropertyOptions) => {
  const isRequired = options?.required !== false;
  return applyDecorators(
    ApiProperty({
      ...options,
      type,
      required: isRequired,
    } as any),
    isRequired ? IsDefined() : IsOptional(),
  );
};

export function SwaggerString(
  options: ApiPropertyOptions & { trim?: boolean } = {},
) {
  const isRequired = options?.required !== false;
  return applyDecorators(
    ApiPropType('string', options),
    IsString(),
    ...(isRequired ? [IsNotEmpty()] : []),
    ...(options?.maxLength !== undefined ? [MaxLength(options.maxLength)] : []),
    ...(options?.minLength !== undefined ? [MinLength(options.minLength)] : []),
    ...(options?.trim !== false
      ? [
          Transform(({ value }: { value: any }): string => {
            return typeof value === 'string' ? value.trim() : value;
          }),
        ]
      : []),
  );
}

export function SwaggerNumber(options: ApiPropertyOptions = {}) {
  return applyDecorators(
    ApiPropType('number', options),
    Type(() => Number),
    IsNumber(),
    ...(options?.minimum !== undefined ? [Min(options.minimum as number)] : []),
    ...(options?.maximum !== undefined ? [Max(options.maximum as number)] : []),
  );
}

export function SwaggerBoolean(options: ApiPropertyOptions = {}) {
  return applyDecorators(
    ApiPropType('boolean', options),
    IsBoolean(),
    Transform(({ value }: { value: unknown }) => {
      if (value === undefined || value === null) return value;
      if (value === false || value === 'false' || value === 0 || value === '0') {
        return false;
      }
      if (value === true || value === 'true' || value === 1 || value === '1') {
        return true;
      }
      return value;
    }),
  );
}

export function SwaggerEnum(options: ApiPropertyOptions = {}) {
  return applyDecorators(
    ApiPropType('enum', options),
    IsEnum(options.enum as any),
  );
}

export function SwaggerInterface(
  type: any,
  options: ApiPropertyOptions = {},
) {
  const isRequired = options?.required !== false;
  return applyDecorators(
    ApiProperty({ ...options, type, required: isRequired } as any),
    ValidateNested({ each: true }),
    isRequired ? IsDefined() : IsOptional(),
    Type(typeof type === 'function' && !type.prototype ? type : () => type),
  );
}

export function SwaggerDateTime(options: ApiPropertyOptions = {}) {
  return applyDecorators(
    ApiPropType('string', {
      format: 'date-time',
      ...options,
    }),
    IsDate(),
    Type(() => Date),
  );
}

export function SwaggerArray(options: ApiPropertyOptions = {}) {
  const isRequired = options?.required !== false;
  return applyDecorators(
    ApiProperty({
      ...options,
      isArray: true,
      required: isRequired,
    } as any),
    isRequired ? ArrayNotEmpty() : IsOptional(),
  );
}

/**
 * Dùng cho các field date trong response DTO (createdAt, updatedAt...).
 * Không gắn validator vì đây là output field.
 */
export function SwaggerDate(options: ApiPropertyOptions = {}) {
  const isRequired = options?.required !== false;
  return applyDecorators(
    ApiProperty({
      type: String,
      format: 'date-time',
      example: '2026-04-03T00:00:00.000Z',
      required: isRequired,
      ...options,
    } as any),
    isRequired ? IsDefined() : IsOptional(),
  );
}

/**
 * Dùng cho field enum array (thường là query params).
 * Tự động parse chuỗi "a,b,c" thành array, validate từng phần tử theo enum.
 */
export function SwaggerEnumArray(
  options: ApiPropertyOptions & { enum: object },
) {
  const isRequired = options?.required !== false;
  return applyDecorators(
    ApiProperty({
      ...options,
      isArray: true,
      required: isRequired,
    } as any),
    isRequired ? ArrayNotEmpty() : IsOptional(),
    Transform(({ value }) => {
      if (!value) return value;
      return Array.isArray(value)
        ? value
        : String(value)
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);
    }),
    IsEnum(options.enum as any, { each: true }),
    IsArray(),
  );
}

export function SwaggerEmail(options: ApiPropertyOptions = {}) {
  const isRequired = options?.required !== false;
  return applyDecorators(
    ApiPropType('string', {
      format: 'email',
      ...options,
    }),
    IsEmail(),
    IsString(),
    ...(isRequired ? [IsNotEmpty()] : []),
  );
}

export function SwaggerFile(options: ApiPropertyOptions = {}) {
  const isRequired = options?.required !== false;
  return applyDecorators(
    ApiProperty({
      ...options,
      type: 'string',
      format: 'binary',
      required: isRequired,
    } as any),
    isRequired ? IsDefined() : IsOptional(),
  );
}

export function ObjectAny(options: ApiPropertyOptions = {}) {
  const isRequired = options?.required !== false;
  return applyDecorators(
    ApiProperty({ ...options, type: 'object', required: isRequired } as any),
    isRequired ? IsDefined() : IsOptional(),
    Allow(),
  );
}
