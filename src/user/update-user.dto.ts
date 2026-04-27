import { IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../auth/enums/role.enum';

export class UpdateUserDto {
  @ApiProperty({ example: 'Maria Santos da Silva', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  nome?: string;

  @ApiProperty({ example: '+55 11 99999-8888', required: false })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiProperty({ example: 'nova_senha_123', required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  senha?: string;

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
