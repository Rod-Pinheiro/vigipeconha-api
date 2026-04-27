import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Notificacao } from './notificacao.entity';
import { Especie } from './especie.entity';

@Entity('notificacoes_especies')
export class NotificacaoEspecie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  especieOutro: string | null;

  @ManyToOne(
    () => Notificacao,
    (notificacao) => notificacao.notificacoesEspecies,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'notificacao_id' })
  notificacao: Notificacao;

  @ManyToOne(() => Especie, (especie) => especie.notificacoesEspecies, {
    nullable: true,
  })
  @JoinColumn({ name: 'especie_id' })
  especie: Especie | null;
}
