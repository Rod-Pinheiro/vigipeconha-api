import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../enums/role.enum';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  senha: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'João Silva', description: 'User full name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  nome: string;

  @ApiProperty({
    example: '+55 11 99999-9999',
    description: 'Phone number (optional)',
  })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password (min 6 characters)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  senha: string;

  @ApiProperty({
    example: Role.USUARIO_REGISTRADO,
    description: 'User role (admin only)',
    enum: Role,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
