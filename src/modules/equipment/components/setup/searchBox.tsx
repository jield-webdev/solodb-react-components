import React, { useState } from "react";

export default function SharchBox({ setSearchQuery, resetFilter }: { setSearchQuery: (query: string) => void; resetFilter: () => void}) {
  const [query, setQuery] = useState<string>("");

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchQuery(query);
  };

  const handleReset = () => {
    setQuery("");
    setSearchQuery("");
    resetFilter();
  };

  return (
    <div className="ms-auto">
      <form onSubmit={handleSearch}>
        <div className="input-group">
          <input
            type="search"
            name="query"
            className="form-control"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary submitButton">
            Search
          </button>
          <button type="button" onClick={handleReset} className="btn btn-warning resetButton">
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
