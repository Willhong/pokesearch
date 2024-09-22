import path from 'path';
import { promises as fs } from 'fs';

export interface Pokemon {
  id: number;
  name: string;
  koreanName: string;
  image: string;
  femaleImage?: string;  // 여성 폼 이미지 추가
}

export interface PokemonDetails extends Pokemon {
  types: string[];
  abilities: string[];
  species: PokemonSpecies;
}

export interface PokemonSpecies {
  genera: string;
  names: string;
  varieties: string[];
  hasGenderDifferences: boolean;  // 이 줄 추가
  flavorText: string;
  generation: string;
  color: string;
  evolutionChain: string;
}

interface CaughtStatus {
  [key: string]: boolean;
}

export async function getCaughtStatus(): Promise<CaughtStatus> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  const response = await fetch(`${baseUrl}/api/caught-status`);
  if (!response.ok) {
    throw new Error('Failed to fetch caught status');
  }
  const data = await response.json();
  
  // console.log('Caught status data:', data);  // 로그 추가

  // 데이터 형식 단순화
  const caughtStatus: { [key: string]: boolean } = {};
  for (const [key, value] of Object.entries(data)) {
    //remove leading 0
    const newKey = key.replace(/^0+/, '');
    caughtStatus[newKey] = Boolean(value);
  }

  console.log('Processed caught status:', caughtStatus);  // 로그 추가
  
  return caughtStatus;
}

export async function getAllPokemon(): Promise<Pokemon[]> {
  console.log('getAllPokemon 함수 호출');
  const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1200');
  const data = await response.json();
  console.log('getAllPokemon 데이 받음:', data.results.length);

  const speciesResponse = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=1200');
  const speciesData = await speciesResponse.json();
  
  const koreanNames = await Promise.all(speciesData.results.map(async (species: any) => {
    const speciesDetailResponse = await fetch(species.url);
    const speciesDetail = await speciesDetailResponse.json();
    return speciesDetail.names.find((name: any) => name.language.name === 'ko')?.name || species.name;
  }));

  return data.results.map((pokemon: any, index: number) => ({
    id: index + 1,
    name: pokemon.name,
    koreanName: koreanNames[index] || pokemon.name, // 한글 이름이 없으면 영어 이름을 사용
    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`,
  }));
}

export async function getAllPokemonSpecies(): Promise<{ [key: string]: PokemonSpecies }> {
  console.log('getAllPokemonSpecies 함수 호출');
  const response = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=1200');
  const data = await response.json();
  console.log('getAllPokemonSpecies 데이터 받음:', data.results.length);

  const speciesData: { [key: string]: PokemonSpecies } = {};

  const speciesPromises = data.results.map(async (species: any) => {
    const speciesResponse = await fetch(species.url);
    const speciesDetails = await speciesResponse.json();
    const koreanGenus = speciesDetails.genera.find((g: any) => g.language.name === 'ko')?.genus || '';
    const koreanFlavorText = speciesDetails.flavor_text_entries.find((f: any) => f.language.name === 'ko')?.flavor_text || '';
    const koreanNames = speciesDetails.names.find((n: any) => n.language.name === 'ko')?.name || '';
    const hasGenderDifferences = speciesDetails.has_gender_differences;  // 이 줄 추가
    const filteredVarieties = speciesDetails.varieties
      .map((v: any) => v.pokemon.name)
      .filter((name: string) => !name.includes('-gmax') && !name.includes('-mega'));

    speciesData[species.name] = {
      genera: koreanGenus,
      names: koreanNames,
      varieties: filteredVarieties,
      hasGenderDifferences: hasGenderDifferences,  // 이 줄 추가
      generation: speciesDetails.generation.name,
      color: speciesDetails.color.name,
      evolutionChain: speciesDetails.evolution_chain.url,
      flavorText: koreanFlavorText.replace(/\n/g, ' ')
    };
  });

  await Promise.all(speciesPromises);
  console.log('getAllPokemonSpecies 처리 완료:', Object.keys(speciesData).length);

  return speciesData;
}

export async function getEvolutionChain(url: string): Promise<any> {
  const response = await fetch(url);
  const data = await response.json();
  return data.chain;
}

export async function getPokemonDetails(id: number, allSpecies: { [key: string]: PokemonSpecies } = {}): Promise<PokemonDetails> {
  console.log(`getPokemonDetails 함수 호출, id: ${id}`);
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await response.json();
  console.log(`getPokemonDetails 데이터 받음, 이름: ${data.name}`);

  const speciesData = allSpecies[data.name] || { genera: '', flavorText: '', generation: '', color: '', evolutionChain: '' };
  const evolutionChain = await getEvolutionChain(speciesData.evolutionChain);

  return {
    id: data.id,
    name: data.name,
    koreanName: speciesData.names || data.name,
    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    types: data.types.map((t: any) => t.type.name),
    abilities: data.abilities.map((a: any) => a.ability.name),
    species: {
      ...speciesData,
      evolutionChain: evolutionChain
    }
  };
}

export async function getEvolutionChainPokemon(chain: any, allSpecies: { [key: string]: PokemonSpecies }): Promise<PokemonDetails[]> {
  const pokemonIds = new Set<number>();

  function extractPokemonIds(evolutionChain: any) {
    const pokemonId = parseInt(evolutionChain.species.url.split('/').slice(-2)[0]);
    pokemonIds.add(pokemonId);

    for (const evolution of evolutionChain.evolves_to) {
      extractPokemonIds(evolution);
    }
  }

  extractPokemonIds(chain);

  const pokemonDetails = await Promise.all(
    Array.from(pokemonIds).map(id => getPokemonDetails(id, allSpecies))
  );

  return pokemonDetails;
}

export async function getAllPokemonWithCaughtStatus(): Promise<(Pokemon & { caught: boolean, femaleFormCaught?: boolean })[]> {
  const [allPokemon, caughtStatus] = await Promise.all([
    getAllPokemon(),
    getCaughtStatus()
  ]);

  return allPokemon.map(pokemon => ({
    ...pokemon,
    caught: caughtStatus[pokemon.id] || false,
    femaleFormCaught: caughtStatus[pokemon.id.toString()+'-f'] || false
  }));
}

export function searchPokemon(allPokemon: (Pokemon & { caught: boolean, femaleFormCaught?: boolean })[], allSpecies: { [key: string]: PokemonSpecies }, query: string): (Pokemon & { caught: boolean, femaleFormCaught?: boolean, varieties: string[] })[] {
  console.log('Searching for:', query);
  console.log('All Pokemon count:', allPokemon.length);
  console.log('All Species count:', Object.keys(allSpecies).length);

  const lowerQuery = query.toLowerCase();
  console.log('lowerQuery:', lowerQuery);
  const results = allPokemon
    .filter((pokemon) => {
      const speciesData = allSpecies[pokemon.name];
      return pokemon.name.toLowerCase().includes(lowerQuery) ||
             (pokemon.koreanName && pokemon.koreanName.toLowerCase().includes(lowerQuery)) ||
             speciesData?.names?.toLowerCase().includes(lowerQuery) ||
             speciesData?.genera?.toLowerCase().includes(lowerQuery);
    })
    .map(pokemon => ({
      ...pokemon,
      varieties: allSpecies[pokemon.name]?.varieties || []
    }))
    .slice(0, 20);

  console.log('Search results count:', results.length);
  return results;
}

export async function refreshCaughtStatus(pokemon: (Pokemon & { caught: boolean; femaleCaught?: boolean })[]): Promise<(Pokemon & { caught: boolean; femaleCaught?: boolean })[]> {
  const caughtStatus = await getCaughtStatus();
  console.log('Caught status:', caughtStatus);
  return pokemon.map(p => ({
    ...p,
    caught: caughtStatus[p.id] === true,
    femaleCaught: caughtStatus[`${p.id}-f`] === true
  }));
}

export interface BoxLocation {
  page: string;
  box: string;
  no: string;
  row: string;
  slot: string;
}

export async function getBoxLocations(): Promise<{ [key: string]: BoxLocation }> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  const response = await fetch(`${baseUrl}/api/pokemon-box-location`);
  if (!response.ok) {
    throw new Error('Failed to fetch box locations');
  }
  return response.json();
}