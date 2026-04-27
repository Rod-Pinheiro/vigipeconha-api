import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Notificacao } from './notificacao.entity';

@Entity('metadata')
export class Metadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ip: string | null;

  @OneToOne(() => Notificacao, (notificacao) => notificacao.metadata)
  @JoinColumn({ name: 'notificacao_id' })
  notificacao: Notificacao;
}
