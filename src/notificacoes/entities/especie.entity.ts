import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { NotificacaoEspecie } from './notificacao-especie.entity';

@Entity('especies')
export class Especie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  nome: string;

  @OneToMany(
    () => NotificacaoEspecie,
    (notificacaoEspecie) => notificacaoEspecie.especie,
  )
  notificacoesEspecies: NotificacaoEspecie[];
}
