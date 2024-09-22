import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PokemonDetails } from "../lib/pokemon";

interface EvolutionChainProps {
  chain: any;
  allSpecies: { [key: string]: any };
  evolutionPokemon: PokemonDetails[];
  caughtStatus: { [key: number]: boolean };
}

export default function EvolutionChain({
  chain,
  allSpecies,
  evolutionPokemon,
  caughtStatus,
}: EvolutionChainProps) {
  const renderEvolution = (evolution: any) => {
    const pokemonId = parseInt(evolution.species.url.split("/").slice(-2)[0]);
    const pokemon = evolutionPokemon.find((p) => p.id === pokemonId);
    const koreanName =
      pokemon?.koreanName ||
      allSpecies[evolution.species.name]?.names ||
      evolution.species.name;
    const isCaught = caughtStatus[pokemonId] || false;

    return (
      <div key={evolution.species.name} className="flex flex-col items-center">
        <Link href={`/pokemon/${pokemonId}`}>
          <Card className="w-32 h-32 flex items-center justify-center">
            <CardContent className="p-2">
              <img
                src={
                  pokemon?.image ||
                  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`
                }
                alt={koreanName}
                className="w-24 h-24"
              />
            </CardContent>
          </Card>
        </Link>
        <p className="text-sm mt-2">{koreanName}</p>
        <p className="text-xs text-muted-foreground">
          No. {pokemonId.toString().padStart(3, "0")}
        </p>
        {isCaught && <Badge className="mt-1 bg-green-500">잡음</Badge>}
        {evolution.evolves_to.length > 0 && (
          <div className="mt-4">
            {evolution.evolves_to.map((nextEvolution: any) =>
              renderEvolution(nextEvolution)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">진화 체인</h2>
      {renderEvolution(chain)}
    </div>
  );
}
