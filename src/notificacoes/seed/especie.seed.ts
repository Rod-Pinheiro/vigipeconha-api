import { DataSource } from 'typeorm';
import { Especie } from '../entities/especie.entity';

const especiesData = [
  { nome: 'Escorpião (Tityus)' },
  { nome: 'Aranha Armadeira (Phoneutria)' },
  { nome: 'Aranha Viúva Negra (Latrodectus)' },
  { nome: 'Aranha Marrom (Loxosceles)' },
  { nome: 'Cobra Cascavel (Crotalus)' },
  { nome: 'Cobra Jararaca (Bothrops)' },
  { nome: 'Cobra Coral (Elaps)' },
  { nome: 'Abelha' },
  { nome: 'Vespa' },
  { nome: 'Lagarta (Lonomia)' },
  { nome: 'Carrapato' },
  { nome: 'Barata' },
  { nome: 'Outro' },
];

export async function seedEspecies(dataSource: DataSource): Promise<void> {
  const especieRepository = dataSource.getRepository(Especie);

  for (const especieData of especiesData) {
    const existing = await especieRepository.findOne({
      where: { nome: especieData.nome },
    });

    if (!existing) {
      const especie = especieRepository.create(especieData);
      await especieRepository.save(especie);
      console.log(`✓ Espécie "${especieData.nome}" criada`);
    } else {
      console.log(`✓ Espécie "${especieData.nome}" já existe`);
    }
  }

  console.log('✓ Seed de espécies concluído');
}
