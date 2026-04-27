import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsDateString,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoLocal } from '../enums/tipo-local.enum';

export class PaginacaoQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsDateString()
  dataStart?: string;

  @IsOptional()
  @IsDateString()
  dataEnd?: string;

  @IsOptional()
  @IsString()
  municipio?: string;

  @IsOptional()
  @IsEnum(TipoLocal)
  tipoLocal?: TipoLocal;
}
