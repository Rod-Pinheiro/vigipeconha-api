import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Notificacao } from './notificacao.entity';

@Entity('locais_captura')
export class LocalCaptura {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  descricao: string | null;

  @OneToOne(() => Notificacao, (notificacao) => notificacao.localCaptura)
  @JoinColumn({ name: 'notificacao_id' })
  notificacao: Notificacao;
}
