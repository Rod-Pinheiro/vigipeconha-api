import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Notificacao } from './entities/notificacao.entity';
import { Especie } from './entities/especie.entity';
import { Foto } from './entities/foto.entity';
import { CreateNotificacaoDto } from './dto/create-notificacao.dto';
import { UpdateNotificacaoDto } from './dto/update-notificacao.dto';
import { PaginacaoQueryDto } from './dto/paginacao.dto';
import { Localizacao } from './entities/localizacao.entity';
import { Animal } from './entities/animal.entity';
import { NotificacaoEspecie } from './entities/notificacao-especie.entity';
import { LocalCaptura } from './entities/local-captura.entity';
import { Metadata } from './entities/metadata.entity';
import { STORAGE_SERVICE } from '../storage/storage.factory';
import {
  IStorageService,
  MulterFile,
} from '../storage/storage.service.interface';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EstatisticaPorTipo {
  tipo: string;
  total: number;
}

export interface EstatisticasResponse {
  total: number;
  porTipo: EstatisticaPorTipo[];
}

@Injectable()
export class NotificacoesService {
  constructor(
    @InjectRepository(Notificacao)
    private readonly notificacaoRepository: Repository<Notificacao>,
    @InjectRepository(Especie)
    private readonly especieRepository: Repository<Especie>,
    @InjectRepository(Foto)
    private readonly fotoRepository: Repository<Foto>,
    private readonly dataSource: DataSource,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  async findAll(
    query: PaginacaoQueryDto,
  ): Promise<PaginatedResult<Notificacao>> {
    const {
      page = 1,
      limit = 10,
      dataStart,
      dataEnd,
      municipio,
      tipoLocal,
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.notificacaoRepository
      .createQueryBuilder('notificacao')
      .leftJoinAndSelect('notificacao.localizacao', 'localizacao')
      .leftJoinAndSelect('notificacao.animal', 'animal')
      .leftJoinAndSelect(
        'notificacao.notificacoesEspecies',
        'notificacoesEspecies',
      )
      .leftJoinAndSelect('notificacoesEspecies.especie', 'especie')
      .leftJoinAndSelect('notificacao.localCaptura', 'localCaptura')
      .leftJoinAndSelect('notificacao.metadata', 'metadata')
      .leftJoinAndSelect('notificacao.fotos', 'fotos')
      .withDeleted();

    if (dataStart) {
      queryBuilder.andWhere('notificacao.dataNotificacao >= :dataStart', {
        dataStart,
      });
    }

    if (dataEnd) {
      queryBuilder.andWhere('notificacao.dataNotificacao <= :dataEnd', {
        dataEnd,
      });
    }

    if (municipio) {
      queryBuilder.andWhere('localizacao.municipio LIKE :municipio', {
        municipio: `%${municipio}%`,
      });
    }

    if (tipoLocal) {
      queryBuilder.andWhere('notificacao.tipoLocal = :tipoLocal', {
        tipoLocal,
      });
    }

    queryBuilder
      .orderBy('notificacao.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Notificacao> {
    const notificacao = await this.notificacaoRepository.findOne({
      where: { id },
      relations: [
        'localizacao',
        'animal',
        'notificacoesEspecies',
        'notificacoesEspecies.especie',
        'localCaptura',
        'metadata',
        'fotos',
      ],
      withDeleted: true,
    });

    if (!notificacao) {
      throw new NotFoundException(`Notificação com ID ${id} não encontrada`);
    }

    return notificacao;
  }

  async create(
    createNotificacaoDto: CreateNotificacaoDto,
  ): Promise<Notificacao> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ultimoNumero = (await queryRunner.query(
        'SELECT COALESCE(MAX("numeroNotificacao"), 0) as max FROM notificacoes',
      )) as { max: number }[];
      const novoNumero = (ultimoNumero[0]?.max || 0) + 1;

      const localizacao = queryRunner.manager.create(Localizacao, {
        ...createNotificacaoDto.localizacao,
      });
      const localizacaoSalvo = await queryRunner.manager.save(localizacao);

      let animalSalvo: Animal | null = null;
      if (createNotificacaoDto.animal) {
        const animal = queryRunner.manager.create(Animal, {
          ...createNotificacaoDto.animal,
        });
        animalSalvo = await queryRunner.manager.save(animal);
      }

      let localCapturaSalvo: LocalCaptura | null = null;
      if (createNotificacaoDto.localCaptura) {
        const localCaptura = queryRunner.manager.create(LocalCaptura, {
          ...createNotificacaoDto.localCaptura,
        });
        localCapturaSalvo = await queryRunner.manager.save(localCaptura);
      }

      let metadataSalvo: Metadata | null = null;
      if (createNotificacaoDto.metadata) {
        const metadata = queryRunner.manager.create(Metadata, {
          ...createNotificacaoDto.metadata,
        });
        metadataSalvo = await queryRunner.manager.save(metadata);
      }

      const notificacao = queryRunner.manager.create(Notificacao, {
        numeroNotificacao: novoNumero,
        dataNotificacao: new Date(createNotificacaoDto.dataNotificacao),
        horarioOcorrencia: createNotificacaoDto.horarioOcorrencia,
        notificanteNome: createNotificacaoDto.notificanteNome,
        telefone: createNotificacaoDto.telefone,
        tipoLocal: createNotificacaoDto.tipoLocal,
        tipoLocalOutro: createNotificacaoDto.tipoLocalOutro,
        referencia: createNotificacaoDto.referencia,
        unidadeNotificante: createNotificacaoDto.unidadeNotificante,
        localizacao: localizacaoSalvo,
        animal: animalSalvo,
        localCaptura: localCapturaSalvo,
        metadata: metadataSalvo,
      });

      const notificacaoSalva = await queryRunner.manager.save(notificacao);

      if (
        createNotificacaoDto.especies &&
        createNotificacaoDto.especies.length > 0
      ) {
        for (const especieDto of createNotificacaoDto.especies) {
          let especie: Especie | null = null;
          let especieOutro: string | null = null;

          if (especieDto.especieId) {
            try {
              especie = await this.especieRepository.findOne({
                where: { id: especieDto.especieId },
              });
            } catch {
              console.log('Espécie não encontrada por UUID, buscando por nome');
            }

            if (!especie) {
              especie = await this.especieRepository.findOne({
                where: { nome: especieDto.especieId },
              });
            }

            if (!especie) {
              especieOutro = especieDto.especieId;
            }
          }

          const notificacaoEspecie = queryRunner.manager.create(
            NotificacaoEspecie,
            {
              especieOutro: especieOutro || especieDto.especieOutro,
              especie: especie || null,
              notificacao: notificacaoSalva,
            },
          );
          await queryRunner.manager.save(notificacaoEspecie);
        }
      }

      await queryRunner.commitTransaction();

      return this.findOne(notificacaoSalva.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: string,
    updateNotificacaoDto: UpdateNotificacaoDto,
  ): Promise<Notificacao> {
    const notificacao = await this.findOne(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (updateNotificacaoDto.dataNotificacao) {
        notificacao.dataNotificacao = new Date(
          updateNotificacaoDto.dataNotificacao,
        );
      }
      if (updateNotificacaoDto.horarioOcorrencia) {
        notificacao.horarioOcorrencia = updateNotificacaoDto.horarioOcorrencia;
      }
      if (updateNotificacaoDto.notificanteNome) {
        notificacao.notificanteNome = updateNotificacaoDto.notificanteNome;
      }
      if (updateNotificacaoDto.telefone !== undefined) {
        notificacao.telefone = updateNotificacaoDto.telefone;
      }
      if (updateNotificacaoDto.tipoLocal) {
        notificacao.tipoLocal = updateNotificacaoDto.tipoLocal;
      }
      if (updateNotificacaoDto.tipoLocalOutro !== undefined) {
        notificacao.tipoLocalOutro = updateNotificacaoDto.tipoLocalOutro;
      }
      if (updateNotificacaoDto.referencia !== undefined) {
        notificacao.referencia = updateNotificacaoDto.referencia;
      }
      if (updateNotificacaoDto.unidadeNotificante !== undefined) {
        notificacao.unidadeNotificante =
          updateNotificacaoDto.unidadeNotificante;
      }

      await queryRunner.manager.save(notificacao);

      if (updateNotificacaoDto.localizacao) {
        const localizacao = await queryRunner.manager.findOne(Localizacao, {
          where: { id: notificacao.localizacao.id },
        });
        if (localizacao) {
          Object.assign(localizacao, updateNotificacaoDto.localizacao);
          await queryRunner.manager.save(localizacao);
        }
      }

      if (updateNotificacaoDto.animal) {
        if (notificacao.animal) {
          Object.assign(notificacao.animal, updateNotificacaoDto.animal);
          await queryRunner.manager.save(notificacao.animal);
        } else if (updateNotificacaoDto.animal) {
          const animal = queryRunner.manager.create(Animal, {
            ...updateNotificacaoDto.animal,
          });
          const animalSalvo = await queryRunner.manager.save(animal);
          notificacao.animal = animalSalvo;
          await queryRunner.manager.save(notificacao);
        }
      }

      if (updateNotificacaoDto.localCaptura) {
        if (notificacao.localCaptura) {
          Object.assign(
            notificacao.localCaptura,
            updateNotificacaoDto.localCaptura,
          );
          await queryRunner.manager.save(notificacao.localCaptura);
        } else if (updateNotificacaoDto.localCaptura) {
          const localCaptura = queryRunner.manager.create(LocalCaptura, {
            ...updateNotificacaoDto.localCaptura,
          });
          const localCapturaSalvo =
            await queryRunner.manager.save(localCaptura);
          notificacao.localCaptura = localCapturaSalvo;
          await queryRunner.manager.save(notificacao);
        }
      }

      if (updateNotificacaoDto.metadata) {
        if (notificacao.metadata) {
          Object.assign(notificacao.metadata, updateNotificacaoDto.metadata);
          await queryRunner.manager.save(notificacao.metadata);
        } else if (updateNotificacaoDto.metadata) {
          const metadata = queryRunner.manager.create(Metadata, {
            ...updateNotificacaoDto.metadata,
          });
          const metadataSalvo = await queryRunner.manager.save(metadata);
          notificacao.metadata = metadataSalvo;
          await queryRunner.manager.save(notificacao);
        }
      }

      if (updateNotificacaoDto.especies) {
        await queryRunner.manager.delete(NotificacaoEspecie, {
          notificacao: { id: notificacao.id },
        });

        for (const especieDto of updateNotificacaoDto.especies) {
          let especie: Especie | null = null;

          if (especieDto.especieId) {
            especie = await this.especieRepository.findOne({
              where: { id: especieDto.especieId },
            });
          }

          const notificacaoEspecie = queryRunner.manager.create(
            NotificacaoEspecie,
            {
              especieOutro: especieDto.especieOutro,
              especie: especie || null,
              notificacao: notificacao,
            },
          );
          await queryRunner.manager.save(notificacaoEspecie);
        }
      }

      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    const notificacao = await this.findOne(id);
    await this.notificacaoRepository.softRemove(notificacao);
  }

  async uploadFotos(id: string, files: MulterFile[]): Promise<Foto[]> {
    const notificacao = await this.findOne(id);

    const urls = await this.storageService.uploadMultiple(files);

    const fotos: Foto[] = [];
    for (const url of urls) {
      const foto = this.fotoRepository.create({
        url,
        notificacao,
      });
      const fotoSalva = await this.fotoRepository.save(foto);
      fotos.push(fotoSalva);
    }

    return fotos;
  }

  async getEstatisticas(): Promise<EstatisticasResponse> {
    const totalResult = await this.notificacaoRepository.count();
    const porTipoResult = await this.notificacaoRepository
      .createQueryBuilder('n')
      .select('e.nome', 'tipo')
      .innerJoin('n.notificacoesEspecies', 'ne')
      .innerJoin('ne.especie', 'e')
      .groupBy('e.nome')
      .addSelect('COUNT(*)', 'total')
      .getRawMany();

    const porTipo: EstatisticaPorTipo[] = porTipoResult.map((r) => ({
      tipo: r.tipo,
      total: Number(r.total),
    }));

    return { total: totalResult, porTipo };
  }

  async findAllEspecies(): Promise<Especie[]> {
    return this.especieRepository.find();
  }
}
