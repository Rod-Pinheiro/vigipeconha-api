import { ApiProperty } from '@nestjs/swagger';
import { Notificacao } from '../entities/notificacao.entity';

export class EstatisticaPorTipoDto {
  @ApiProperty({ example: 'Aranha Armadeira' })
  tipo: string;

  @ApiProperty({ example: 5 })
  total: number;
}

export class EstatisticasResponseDto {
  @ApiProperty({ example: 15 })
  total: number;

  @ApiProperty({ 
    type: [EstatisticaPorTipoDto],
    example: [
      { tipo: 'Aranha Armadeira', total: 5 },
      { tipo: 'Escorpião', total: 10 }
    ]
  })
  porTipo: EstatisticaPorTipoDto[];
}

export class PaginatedResultDto<T> {
  @ApiProperty()
  data: T[];

  @ApiProperty({ example: 15 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 2 })
  totalPages: number;
}

export class PaginatedNotificacaoDto {
  @ApiProperty({ type: [Notificacao] })
  data: Notificacao[];

  @ApiProperty({ example: 15 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 2 })
  totalPages: number;
}
