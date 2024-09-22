"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm items-center space-x-2 mb-4"
    >
      <Input
        type="text"
        placeholder="포켓몬 이름 검색..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button type="submit">검색</Button>
    </form>
  );
}
