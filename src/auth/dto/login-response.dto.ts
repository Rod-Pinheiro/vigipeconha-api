import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'João Silva' })
  nome: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: '+55 11 99999-9999', required: false })
  telefone?: string;

  @ApiProperty({
    example: 'usuario_registrado',
    enum: ['administrador', 'usuario_registrado'],
  })
  role: string;
}

export class LoginResponseDto {
  @ApiProperty({ type: LoginResponseUserDto })
  user: LoginResponseUserDto;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;
}
