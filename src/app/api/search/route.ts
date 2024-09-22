import { NextResponse } from 'next/server';
import { searchPokemon, getAllPokemon, getAllPokemonSpecies, getCaughtStatus } from '../../lib/pokemon';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: '검색어를 입력해주세요.' }, { status: 400 });
    }

    const [allPokemon, allSpecies, caughtStatus] = await Promise.all([
      getAllPokemon(),
      getAllPokemonSpecies(),
      getCaughtStatus()
    ]);
    
    const pokemonWithCaughtStatus = allPokemon.map(pokemon => ({
      ...pokemon,
      caught: caughtStatus[pokemon.id] || false
    }));

    const results = searchPokemon(pokemonWithCaughtStatus, allSpecies, query);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: '검색 중 오류가 발생했습니다.' }, { status: 500 });
  }
}