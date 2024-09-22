import { Suspense } from "react";
import PokemonList from "./components/PokemonList";
import {
  getAllPokemonWithCaughtStatus,
  getAllPokemonSpecies,
} from "./lib/pokemon";

export const revalidate = 3600; // 1시간마다 재검증

export default async function Home() {
  // console.log("Home 컴포넌트 렌더링 시작");
  const [allPokemonWithStatus, allSpecies] = await Promise.all([
    getAllPokemonWithCaughtStatus(),
    getAllPokemonSpecies(),
  ]);
  console.log("allPokemon 데이터 받음:", allPokemonWithStatus.length);
  console.log("allSpecies 데이터 받음:", Object.keys(allSpecies).length);

  return (
    <main className="min-h-screen flex flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">포켓몬 API 웹사이트</h1>
      <Suspense
        fallback={
          <div className="text-2xl">포켓몬 데이터를 불러오는 중...</div>
        }
      >
        <PokemonList
          initialPokemon={allPokemonWithStatus}
          allSpecies={allSpecies}
        />
      </Suspense>
    </main>
  );
}
