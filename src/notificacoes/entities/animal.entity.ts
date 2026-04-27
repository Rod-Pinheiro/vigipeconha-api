import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Notificacao } from './notificacao.entity';

@Entity('animais')
export class Animal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 0 })
  quantidadeVivos: number;

  @Column({ type: 'int', default: 0 })
  quantidadeMortos: number;

  @Column({ type: 'boolean', default: false })
  houveAcidente: boolean;

  @Column({ type: 'text', nullable: true })
  sintomas: string | null;

  @OneToOne(() => Notificacao, (notificacao) => notificacao.animal)
  @JoinColumn({ name: 'notificacao_id' })
  notificacao: Notificacao;
}
