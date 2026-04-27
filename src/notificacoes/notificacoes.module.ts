import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacoesController } from './notificacoes.controller';
import { NotificacoesService } from './notificacoes.service';
import { Notificacao } from './entities/notificacao.entity';
import { Localizacao } from './entities/localizacao.entity';
import { Animal } from './entities/animal.entity';
import { Especie } from './entities/especie.entity';
import { NotificacaoEspecie } from './entities/notificacao-especie.entity';
import { Foto } from './entities/foto.entity';
import { LocalCaptura } from './entities/local-captura.entity';
import { Metadata } from './entities/metadata.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notificacao,
      Localizacao,
      Animal,
      Especie,
      NotificacaoEspecie,
      Foto,
      LocalCaptura,
      Metadata,
    ]),
  ],
  controllers: [NotificacoesController],
  providers: [NotificacoesService],
  exports: [NotificacoesService],
})
export class NotificacoesModule {}
