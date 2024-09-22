"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Pokemon,
  PokemonSpecies,
  refreshCaughtStatus,
  getBoxLocations,
  BoxLocation,
} from "../lib/pokemon";
import SearchBar from "./SearchBar";
import PokemonCard from "./PokemonCard";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { searchPokemon } from "../lib/pokemon";

interface PokemonListProps {
  initialPokemon: (Pokemon & { caught: boolean; femaleCaught?: boolean })[];
  allSpecies: { [key: string]: PokemonSpecies };
}

export default function PokemonList({
  initialPokemon,
  allSpecies,
}: PokemonListProps) {
  const [pokemon, setPokemon] =
    useState<(Pokemon & { caught: boolean; femaleCaught?: boolean })[]>(
      initialPokemon
    );
  const [displayedPokemon, setDisplayedPokemon] = useState<
    (Pokemon & { caught: boolean; femaleCaught?: boolean })[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [boxLocations, setBoxLocations] = useState<{
    [key: string]: BoxLocation;
  }>({});

  useEffect(() => {
    getBoxLocations().then(setBoxLocations);
  }, []);

  const loadMorePokemon = useCallback(() => {
    console.log("Loading more pokemon...");
    const currentLength = displayedPokemon.length;
    const more = pokemon.slice(currentLength, currentLength + 20);
    console.log("Adding more pokemon:", more.length);
    setDisplayedPokemon((prev) => [...prev, ...more]);
    setIsFetching(false);
  }, [displayedPokemon, pokemon]);

  const { isFetching, setIsFetching } = useInfiniteScroll(loadMorePokemon);

  useEffect(() => {
    console.log("Setting initial displayed pokemon");
    setDisplayedPokemon(pokemon.slice(0, 20));
  }, [pokemon]);

  useEffect(() => {
    console.log("Current displayed pokemon:", displayedPokemon.length);
  }, [displayedPokemon]);

  const handleSearch = (query: string) => {
    setIsSearching(true);
    const results = searchPokemon(initialPokemon, allSpecies, query);
    setPokemon(results);
    setDisplayedPokemon(results.slice(0, 20));
    setIsSearching(false);
  };

  const handleCaughtToggle = async (
    id: number,
    caught: boolean,
    isFemale?: boolean
  ) => {
    try {
      const response = await fetch("/api/update-caught-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pokemonId: id, isCaught: caught, isFemale }),
      });

      if (!response.ok) {
        throw new Error("Failed to update caught status");
      }

      setPokemon((prevPokemon) =>
        prevPokemon.map((p) => {
          if (p.id === id) {
            if (isFemale) {
              return { ...p, femaleCaught: caught };
            } else {
              return { ...p, caught: caught };
            }
          }
          return p;
        })
      );
      setDisplayedPokemon((prevDisplayed) =>
        prevDisplayed.map((p) => {
          if (p.id === id) {
            if (isFemale) {
              return { ...p, femaleCaught: caught };
            } else {
              return { ...p, caught: caught };
            }
          }
          return p;
        })
      );
    } catch (error) {
      console.error("Error updating caught status:", error);
    }
  };

  const refreshCaughtStatuses = async () => {
    setIsRefreshing(true);
    try {
      const refreshedPokemon = await refreshCaughtStatus(pokemon);
      // console.log("Refreshed Pokemon:", refreshedPokemon.slice(0, 10)); // 처음 10개 포켓몬의 상태를 로그로 출력
      setPokemon(refreshedPokemon);
      setDisplayedPokemon((prevDisplayed) => {
        const newDisplayed = refreshedPokemon.slice(0, prevDisplayed.length);
        // console.log("New displayed Pokemon:", newDisplayed.slice(0, 10)); // 로그 추가
        return newDisplayed;
      });
    } catch (error) {
      console.error("Error refreshing caught statuses:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshCaughtStatuses();
  }, []); // 컴포넌트가 마운트될 때 한 번 실행

  return (
    <div className="container mx-auto px-4">
      <SearchBar onSearch={handleSearch} />
      {/* <button
        onClick={refreshCaughtStatuses}
        disabled={isRefreshing}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isRefreshing ? "새로고침 중..." : "잡은 상태 새로고침"}
      </button> */}
      {isSearching ? (
        <p className="text-center">검색 중...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedPokemon.map((p) => (
              <Link href={`/pokemon/${p.id}`} key={p.id} className="block">
                <PokemonCard
                  pokemon={p}
                  species={allSpecies[p.name]}
                  onCaughtToggle={handleCaughtToggle}
                  boxLocation={boxLocations[p.id.toString()]}
                />
              </Link>
            ))}
          </div>
          {isFetching && (
            <p className="text-center mt-4">더 많은 포켓몬을 불러오는 중...</p>
          )}
        </>
      )}
      {!isSearching && displayedPokemon.length === 0 && (
        <p className="text-center">검색 결과가 없습니다.</p>
      )}
    </div>
  );
}
