import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Notificacao } from './notificacao.entity';

@Entity('fotos')
export class Foto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Notificacao, (notificacao) => notificacao.fotos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'notificacao_id' })
  notificacao: Notificacao;
}
