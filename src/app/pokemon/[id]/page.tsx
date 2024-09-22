import PokemonDetail from "../../components/PokemonDetail";
import Link from "next/link";
import { getAllPokemonSpecies } from "../../lib/pokemon";
import { Button } from "@/components/ui/button";

export const revalidate = 3600; // 1시간마다 재검증

export default async function PokemonPage({
  params,
}: {
  params: { id: string };
}) {
  console.log(`PokemonPage 렌더링 시작, id: ${params.id}`);
  const id = parseInt(params.id);
  const allSpecies = await getAllPokemonSpecies();
  console.log(
    "PokemonPage allSpecies 데이터 받음:",
    Object.keys(allSpecies).length
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Link href="/" passHref>
        <Button variant="outline" className="mb-4">
          ← 목록으로 돌아가기
        </Button>
      </Link>
      <PokemonDetail id={id} allSpecies={allSpecies} />
    </main>
  );
}
