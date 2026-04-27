import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TipoLocal } from '../enums/tipo-local.enum';
import { Localizacao } from './localizacao.entity';
import { Animal } from './animal.entity';
import { NotificacaoEspecie } from './notificacao-especie.entity';
import { Foto } from './foto.entity';
import { LocalCaptura } from './local-captura.entity';
import { Metadata } from './metadata.entity';

@Entity('notificacoes')
@Index(['dataNotificacao'])
@Index(['tipoLocal'])
export class Notificacao {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 15 })
  @Column({ type: 'int', unique: true })
  numeroNotificacao: number;

  @ApiProperty({ example: '2026-04-10' })
  @Column({ type: 'date' })
  dataNotificacao: Date;

  @ApiProperty({ example: '14:30:00' })
  @Column({ type: 'time' })
  horarioOcorrencia: string;

  @ApiProperty({ example: 'João da Silva' })
  @Column({ type: 'varchar', length: 255 })
  notificanteNome: string;

  @ApiProperty({ example: '+5598991260020' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone: string | null;

  @ApiProperty({ example: 'residencia', enum: Object.values(TipoLocal) })
  @Column({ type: 'enum', enum: TipoLocal })
  tipoLocal: TipoLocal;

  @ApiProperty({ example: null })
  @Column({ type: 'varchar', length: 100, nullable: true })
  tipoLocalOutro: string | null;

  @ApiProperty({ example: 'Próximo à janela da sala' })
  @Column({ type: 'text', nullable: true })
  referencia: string | null;

  @ApiProperty({ example: 'Centro de Saúde Local' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  unidadeNotificante: string | null;

  @ApiProperty({ example: '2026-04-10T14:30:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2026-04-10T14:30:00.000Z' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ example: null })
  @DeleteDateColumn()
  deletedAt: Date | null;

  @ApiProperty({ type: () => Localizacao })
  @OneToOne(() => Localizacao, (localizacao) => localizacao.notificacao, {
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'localizacao_id' })
  localizacao: Localizacao;

  @ApiProperty({ type: () => Animal, nullable: true })
  @OneToOne(() => Animal, (animal) => animal.notificacao, {
    cascade: true,
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'animal_id' })
  animal: Animal | null;

  @ApiProperty({ type: [NotificacaoEspecie] })
  @OneToMany(
    () => NotificacaoEspecie,
    (notificacaoEspecie) => notificacaoEspecie.notificacao,
    { cascade: true, eager: true },
  )
  notificacoesEspecies: NotificacaoEspecie[];

  @ApiProperty({ type: [Foto] })
  @OneToMany(() => Foto, (foto) => foto.notificacao, {
    cascade: true,
    eager: true,
  })
  fotos: Foto[];

  @ApiProperty({ type: () => LocalCaptura, nullable: true })
  @OneToOne(() => LocalCaptura, (localCaptura) => localCaptura.notificacao, {
    cascade: true,
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'local_captura_id' })
  localCaptura: LocalCaptura | null;

  @ApiProperty({ type: () => Metadata, nullable: true })
  @OneToOne(() => Metadata, (metadata) => metadata.notificacao, {
    cascade: true,
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'metadata_id' })
  metadata: Metadata | null;
}
