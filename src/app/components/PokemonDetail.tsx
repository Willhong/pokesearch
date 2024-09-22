import {
  getPokemonDetails,
  getEvolutionChainPokemon,
  getCaughtStatus,
} from "../lib/pokemon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EvolutionChain from "./EvolutionChain";

export default async function PokemonDetail({
  id,
  allSpecies,
}: {
  id: number;
  allSpecies: any;
}) {
  const [pokemon, caughtStatus] = await Promise.all([
    getPokemonDetails(id, allSpecies),
    getCaughtStatus(),
  ]);
  const evolutionChainPokemon = await getEvolutionChainPokemon(
    pokemon.species.evolutionChain,
    allSpecies
  );

  const isCaught = caughtStatus[id] || false;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{pokemon.koreanName}</CardTitle>
        <p className="text-xl text-muted-foreground">{pokemon.name}</p>
        <p className="text-lg text-muted-foreground">
          No. {pokemon.id.toString().padStart(3, "0")}
        </p>
        {isCaught && <Badge className="bg-green-500">잡음</Badge>}
      </CardHeader>
      <CardContent>
        <p className="text-lg mb-4">{pokemon.species.genera}</p>
        <img
          src={pokemon.image}
          alt={pokemon.koreanName}
          className="w-64 h-64 mx-auto mb-4"
        />
        <p className="text-muted-foreground mb-4">
          {pokemon.species.flavorText}
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">타입</h2>
            <div className="flex flex-wrap gap-2">
              {pokemon.types.map((type) => (
                <Badge key={type} variant="secondary">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">능력</h2>
            <div className="flex flex-wrap gap-2">
              {pokemon.abilities.map((ability) => (
                <Badge key={ability} variant="outline">
                  {ability}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">세대</h2>
            <Badge>{pokemon.species.generation}</Badge>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">색상</h2>
            <Badge style={{ backgroundColor: pokemon.species.color }}>
              {pokemon.species.color}
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">폼</h2>
            <div className="flex flex-wrap gap-2">
              {pokemon.species.varieties.map((variety: string) => (
                <Badge key={variety} variant="outline">
                  {variety}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">성별 차이</h2>
            <Badge variant="outline">
              {pokemon.species.hasGenderDifferences ? "있음" : "없음"}
            </Badge>
          </div>
        </div>
        <EvolutionChain
          chain={pokemon.species.evolutionChain}
          allSpecies={allSpecies}
          evolutionPokemon={evolutionChainPokemon}
          caughtStatus={caughtStatus}
        />
      </CardContent>
    </Card>
  );
}
