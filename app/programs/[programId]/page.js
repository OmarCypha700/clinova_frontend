"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function StudentsPage() {
  const { programId } = useParams();
  const router = useRouter();

  const [students, setStudents]     = useState([]);
  const [levels, setLevels]         = useState([]);
  const [search, setSearch]         = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [loading, setLoading]       = useState(true);

  // Fetch the level list once (no dependency changes)
  useEffect(() => {
    api
      .get("/exams/levels/")
      .then((res) => {
        setLevels(Array.isArray(res.data) ? res.data : (res.data?.results ?? []));
      })
      .catch(() => {});
  }, []);

  // Fetch students whenever programId or levelFilter changes
  const fetchStudents = useCallback(() => {
    if (!programId) return;
    setLoading(true);

    const params = {};
    // The backend StudentByProgramView accepts ?level=<id>
    if (levelFilter !== "all") params.level = levelFilter;

    api
      .get(`/exams/programs/${programId}/students/`, { params })
      .then((res) => {
        // Endpoint returns a plain array
        setStudents(Array.isArray(res.data) ? res.data : (res.data?.results ?? []));
      })
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, [programId, levelFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Client-side search filter (search is local-only; level is server-side)
  const filteredStudents = useMemo(
    () =>
      students.filter((s) =>
        `${s.index_number} ${s.full_name}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [students, search],
  );

  const clearFilters = () => {
    setSearch("");
    setLevelFilter("all");
  };

  const hasFilters = search || levelFilter !== "all";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back + Title */}
      <div className="flex items-center mb-4 gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/programs")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl uppercase font-bold">Select Student</h1>
      </div>

      {/* Search + Level filter */}
      <div className="space-y-3 mb-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by index number or name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Level filter row */}
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {levels.map((level) => (
                <SelectItem key={level.id} value={String(level.id)}>
                  {level.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Active filter chips */}
          {hasFilters && (
            <div className="flex items-center gap-2">
              {levelFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {levels.find((l) => String(l.id) === levelFilter)?.name}
                  <button
                    onClick={() => setLevelFilter("all")}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Results counter */}
        {hasFilters && !loading && (
          <p className="text-sm text-muted-foreground">
            Showing {filteredStudents.length} of {students.length} student
            {students.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Students list */}
      <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {/* Loading skeletons */}
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="p-3 bg-gray-100 rounded animate-pulse">
              <Skeleton className="h-4 w-1/3 mb-2 rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
            </li>
          ))}

        {/* Empty state */}
        {!loading && filteredStudents.length === 0 && (
          <li className="text-center py-8">
            <p className="text-muted-foreground mb-2">No students found</p>
            {hasFilters && (
              <Button variant="link" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </li>
        )}

        {/* Student rows */}
        {!loading &&
          filteredStudents.map((s) => (
            <li
              key={s.id}
              className="p-3 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 transition group"
              onClick={() =>
                router.push(`/programs/${programId}/students/${s.id}`)
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{s.index_number}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {s.full_name}
                  </div>
                </div>
                {s.level_name && (
                  <Badge
                    variant="outline"
                    className="ml-2 shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition"
                  >
                    {s.level_name}
                  </Badge>
                )}
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}