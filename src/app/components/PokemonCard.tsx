"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Pokemon, PokemonSpecies, BoxLocation } from "../lib/pokemon";
import Image from "next/image";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface PokemonCardProps {
  pokemon: Pokemon & { caught: boolean; femaleCaught?: boolean };
  species: PokemonSpecies;
  onCaughtToggle: (id: number, caught: boolean, isFemale?: boolean) => void;
  boxLocation?: BoxLocation;
}

export default function PokemonCard({
  pokemon,
  species,
  onCaughtToggle,
  boxLocation,
}: PokemonCardProps) {
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [currentGender, setCurrentGender] = useState<"male" | "female">("male");
  const forms = species.varieties || [pokemon.name];
  const hasGenderDifference = species.hasGenderDifferences;

  const nextForm = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentFormIndex((prevIndex) => (prevIndex + 1) % forms.length);
  };

  const prevForm = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentFormIndex(
      (prevIndex) => (prevIndex - 1 + forms.length) % forms.length
    );
  };

  const toggleGender = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentGender((prev) => (prev === "male" ? "female" : "male"));
  };

  const toggleCaught = async (e: React.MouseEvent) => {
    e.preventDefault();
    const isFemale = currentGender === "female";
    onCaughtToggle(
      pokemon.id,
      isFemale ? !pokemon.femaleCaught : !pokemon.caught,
      isFemale
    );
  };

  const currentForm = forms[currentFormIndex];
  const isCaught =
    currentGender === "female" ? pokemon.femaleCaught : pokemon.caught;

  return (
    <Card
      className={`hover:shadow-lg transition-shadow h-full ${
        isCaught ? "bg-green-100" : ""
      }`}
    >
      <CardHeader>
        <CardTitle className="flex justify-between">
          <div>{species.names || pokemon.koreanName || pokemon.name}</div>
          <div>
            {hasGenderDifference && (
              <Button onClick={toggleGender} variant="outline" className="w-4 ">
                {currentGender === "male" ? "♂" : "♀"}
              </Button>
            )}
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          No. {pokemon.id.toString().padStart(3, "0")}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <p className="text-sm text-muted-foreground mb-2">{currentForm}</p>
        <p className="text-sm mb-2">{species.genera || "로딩 중..."}</p>
        <div className="flex items-center">
          {forms.length > 1 && (
            <Button variant="ghost" size="icon" onClick={prevForm}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <Image
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
              currentGender === "female" ? "female/" : ""
            }${pokemon.id}.png`}
            alt={`${currentForm} ${currentGender}`}
            width={100}
            height={100}
          />
          {forms.length > 1 && (
            <Button variant="ghost" size="icon" onClick={nextForm}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="h-6 mt-2 flex gap-2">
          <Button
            onClick={toggleCaught}
            variant={isCaught ? "destructive" : "default"}
          >
            {isCaught ? "놓아주기" : "잡기"}
          </Button>
        </div>
        {forms.length > 1 && (
          <div className="mt-2">
            <Badge variant="secondary">{forms.length} 폼</Badge>
          </div>
        )}

        {boxLocation && (
          <div className="mt-10 flex flex-wrap gap-2">
            <Badge variant="secondary" className="border">
              페이지: {boxLocation.page}
            </Badge>
            <Badge variant="secondary" className="border">
              박스: {boxLocation.box}
            </Badge>
            <Badge variant="secondary" className="border">
              번호: {boxLocation.no}
            </Badge>
            <Badge variant="secondary" className="border">
              행: {boxLocation.row}
            </Badge>
            <Badge variant="secondary" className="border">
              슬롯: {boxLocation.slot}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
