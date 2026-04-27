import {
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../auth/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'Maria Santos' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  nome: string;

  @ApiProperty({ example: '+55 11 98765-4321', required: false })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiProperty({ example: 'maria@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'senha_segura_123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiProperty({
    example: Role.USUARIO_REGISTRADO,
    description: 'User role',
    enum: Role,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
