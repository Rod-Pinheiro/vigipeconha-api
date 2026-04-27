import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  ValidateNested,
  IsBoolean,
  IsArray,
  IsNumber,
  IsUUID,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TipoLocal } from '../enums/tipo-local.enum';

class UpdateLocalizacaoDto {
  @ApiProperty({ example: -23.456, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: -46.789, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ example: 'Campinas', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  municipio?: string;

  @ApiProperty({ example: 'Centro', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bairro?: string;

  @ApiProperty({ example: 'Rua Botelho, nº 652', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  logradouro?: string;

  @ApiProperty({ example: '652', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  numero?: string;

  @ApiProperty({ example: 'Apto 123', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  complemento?: string;

  @ApiProperty({ example: '13025-061', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  cep?: string;
}

class UpdateAnimalDto {
  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantidadeVivos?: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantidadeMortos?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  houveAcidente?: boolean;

  @ApiProperty({ example: 'Manchas vermelhas no braço', required: false })
  @IsOptional()
  @IsString()
  sintomas?: string;
}

class UpdateNotificacaoEspecieDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', required: false })
  @IsOptional()
  @IsUUID()
  especieId?: string;

  @ApiProperty({ example: 'Aranha Armadeira (Phoneutria)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  especieOutro?: string;
}

class UpdateLocalCapturaDto {
  @ApiProperty({ example: 'Animal capturado em teia na janela', required: false })
  @IsOptional()
  @IsString()
  descricao?: string;
}

class UpdateMetadataDto {
  @ApiProperty({ example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  userAgent?: string;

  @ApiProperty({ example: '192.168.1.100', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ip?: string;
}

export class UpdateNotificacaoDto {
  @ApiProperty({ example: '2026-04-10', required: false })
  @IsOptional()
  @IsDateString()
  dataNotificacao?: string;

  @ApiProperty({ example: '14:30:00', required: false })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, {
    message: 'horarioOcorrencia deve estar no formato HH:mm:ss',
  })
  horarioOcorrencia?: string;

  @ApiProperty({ example: 'João da Silva', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  notificanteNome?: string;

  @ApiProperty({ example: '+5598991260020', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @ApiProperty({ example: 'residencia', enum: Object.values(TipoLocal), required: false })
  @IsOptional()
  @IsEnum(TipoLocal)
  tipoLocal?: TipoLocal;

  @ApiProperty({ example: null, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tipoLocalOutro?: string;

  @ApiProperty({ example: 'Próximo à janela da sala', required: false })
  @IsOptional()
  @IsString()
  referencia?: string;

  @ApiProperty({ example: 'Centro de Saúde Local', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  unidadeNotificante?: string;

  @ApiProperty({ type: () => UpdateLocalizacaoDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateLocalizacaoDto)
  localizacao?: UpdateLocalizacaoDto;

  @ApiProperty({ type: () => UpdateAnimalDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAnimalDto)
  animal?: UpdateAnimalDto;

  @ApiProperty({ type: [UpdateNotificacaoEspecieDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateNotificacaoEspecieDto)
  especies?: UpdateNotificacaoEspecieDto[];

  @ApiProperty({ example: [], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fotos?: string[];

  @ApiProperty({ type: () => UpdateLocalCapturaDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateLocalCapturaDto)
  localCaptura?: UpdateLocalCapturaDto;

  @ApiProperty({ type: () => UpdateMetadataDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateMetadataDto)
  metadata?: UpdateMetadataDto;
}
