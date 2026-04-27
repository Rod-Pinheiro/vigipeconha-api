import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  ValidateNested,
  IsBoolean,
  IsArray,
  IsNumber,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TipoLocal } from '../enums/tipo-local.enum';

class CreateLocalizacaoDto {
  @ApiProperty({ example: -23.456, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: -46.789, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ example: 'Campinas' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  municipio: string;

  @ApiProperty({ example: 'Centro' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  bairro: string;

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

class CreateAnimalDto {
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

class CreateNotificacaoEspecieDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', required: false })
  @IsOptional()
  @IsString()
  especieId?: string;

  @ApiProperty({ example: 'Aranha Armadeira (Phoneutria)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  especieOutro?: string;
}

class CreateLocalCapturaDto {
  @ApiProperty({ example: 'Animal capturado em teia na janela', required: false })
  @IsOptional()
  @IsString()
  descricao?: string;
}

class CreateMetadataDto {
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

export class CreateNotificacaoDto {
  @ApiProperty({ example: '2026-04-10' })
  @IsDateString()
  dataNotificacao: string;

  @ApiProperty({ example: '14:30:00' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, {
    message: 'horarioOcorrencia deve estar no formato HH:mm:ss',
  })
  horarioOcorrencia: string;

  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  notificanteNome: string;

  @ApiProperty({ example: '+5598991260020', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @ApiProperty({ example: 'residencia', enum: Object.values(TipoLocal) })
  @IsEnum(TipoLocal)
  tipoLocal: TipoLocal;

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

  @ApiProperty({ type: () => CreateLocalizacaoDto })
  @ValidateNested()
  @Type(() => CreateLocalizacaoDto)
  localizacao: CreateLocalizacaoDto;

  @ApiProperty({ type: () => CreateAnimalDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAnimalDto)
  animal?: CreateAnimalDto;

  @ApiProperty({ type: [CreateNotificacaoEspecieDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateNotificacaoEspecieDto)
  especies?: CreateNotificacaoEspecieDto[];

  @ApiProperty({ example: [], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fotos?: string[];

  @ApiProperty({ type: () => CreateLocalCapturaDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLocalCapturaDto)
  localCaptura?: CreateLocalCapturaDto;

  @ApiProperty({ type: () => CreateMetadataDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateMetadataDto)
  metadata?: CreateMetadataDto;
}
