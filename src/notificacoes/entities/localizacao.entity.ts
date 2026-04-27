import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Notificacao } from './notificacao.entity';

@Entity('localizacoes')
export class Localizacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float8', nullable: true })
  latitude: number | null;

  @Column({ type: 'float8', nullable: true })
  longitude: number | null;

  @Column({ type: 'varchar', length: 255 })
  municipio: string;

  @Column({ type: 'varchar', length: 255 })
  bairro: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logradouro: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  numero: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  complemento: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  cep: string | null;

  @OneToOne(() => Notificacao, (notificacao) => notificacao.localizacao)
  @JoinColumn({ name: 'notificacao_id' })
  notificacao: Notificacao;
}
