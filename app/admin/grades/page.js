"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

// ─── constants ──────────────────────────────────────────────────────────────

const GRADE_COLORS = {
  Distinction: "bg-green-100 text-green-800 border-green-200",
  Credit: "bg-blue-100 text-blue-800 border-blue-200",
  Pass: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Fail: "bg-red-100 text-red-800 border-red-200",
  "N/A": "bg-gray-100 text-gray-600 border-gray-200",
};

const PAGE_SIZES = [25, 50, 100, 200];

const SORTABLE_COLS = [
  { key: "index_number", label: "Index No." },
  { key: "full_name", label: "Student Name" },
  { key: "program", label: "Program" },
  { key: "level", label: "Level" },
  { key: "percentage", label: "%" },
  { key: "grade", label: "Grade" },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

function SortIcon({ col, sortBy, order }) {
  if (sortBy !== col)
    return <ChevronsUpDown className="ml-1 h-3.5 w-3.5 opacity-40 inline" />;
  return order === "asc" ? (
    <ChevronUp className="ml-1 h-3.5 w-3.5 inline" />
  ) : (
    <ChevronDown className="ml-1 h-3.5 w-3.5 inline" />
  );
}

// ─── component ───────────────────────────────────────────────────────────────

export default function GradesPage() {
  const [grades, setGrades] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDS] = useState("");
  const [programFilter, setProgram] = useState("all");
  const [levelFilter, setLevel] = useState("all");
  const [gradeFilter, setGrade] = useState("all");

  // Sort
  const [sortBy, setSortBy] = useState("index_number");
  const [order, setOrder] = useState("asc");

  // ── debounce search ────────────────────────────────────────────────────────

  useEffect(() => {
    const t = setTimeout(() => setDS(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // ── fetch support data once ────────────────────────────────────────────────

  useEffect(() => {
    Promise.all([api.get("/exams/admin/programs/"), api.get("/exams/levels/")])
      .then(([pr, lr]) => {
        setPrograms(pr.data?.results ?? pr.data ?? []);
        setLevels(lr.data?.results ?? lr.data ?? []);
      })
      .catch(() => toast.error("Failed to load filter options"))
      .finally(() => setLoading(false));
  }, []);

  // ── fetch grades (server-side) ────────────────────────────────────────────

  const fetchGrades = useCallback(async () => {
    setFetching(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
        sort_by: sortBy,
        order,
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (programFilter !== "all") params.set("program_id", programFilter);
      if (levelFilter !== "all") params.set("level_id", levelFilter);

      const res = await api.get(`/exams/grades/?${params}`);
      let results = res.data?.results ?? res.data ?? [];

      // Client-side grade filter (cheap, already paginated)
      if (gradeFilter !== "all") {
        results = results.filter((g) => g.grade === gradeFilter);
      }

      setGrades(results);
      setTotal(res.data?.count ?? results.length);
    } catch {
      toast.error("Failed to load grades");
    } finally {
      setFetching(false);
    }
  }, [
    page,
    pageSize,
    debouncedSearch,
    programFilter,
    levelFilter,
    gradeFilter,
    sortBy,
    order,
  ]);

  // Reset to page 1 on filter/sort change
  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    programFilter,
    levelFilter,
    gradeFilter,
    pageSize,
    sortBy,
    order,
  ]);

  useEffect(() => {
    if (!loading) fetchGrades();
  }, [fetchGrades, loading]);

  // ── sort handler ───────────────────────────────────────────────────────────

  const handleSort = (col) => {
    if (sortBy === col) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setOrder("asc");
    }
  };

  // ── export ─────────────────────────────────────────────────────────────────

  const handleExport = async (format) => {
    try {
      const params = new URLSearchParams({ export: format });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (programFilter !== "all") params.set("program_id", programFilter);
      if (levelFilter !== "all") params.set("level_id", levelFilter);
      const res = await api.get(`/exams/grades/?${params}`, {
        responseType: "blob",
      });
      const ext = format === "excel" ? "xlsx" : format;
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `student_grades.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed");
    }
  };

  // ── pagination ─────────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const showingFrom = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, totalCount);

  // ── summary stats ──────────────────────────────────────────────────────────

  // Calculate statistics
  const stats = useMemo(
    () => ({
      total: totalCount,
      completed: grades.filter((g) => g.grade !== "N/A").length,
      averagePercentage:
        grades.length > 0
          ? (
              grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length
            ).toFixed(2)
          : 0,
      carePlansCompleted: grades.filter((g) => g.care_plan_completed).length,
    }),
    [grades],
  );

  const GradeStats = useMemo(() => {
    if (!grades.length) return null;
    const counted = grades.reduce((acc, g) => {
      acc[g.grade] = (acc[g.grade] || 0) + 1;
      return acc;
    }, {});
    return counted;
  }, [grades]);

  // ─────────────────────────────────────────────────────────────────────────

  if (loading) return <DashboardSkeleton showStats={false} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Student Grades</h2>
          <p className="text-muted-foreground">
            View and export assessment results across all students
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-4 w-4" />
              Export
              <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport("csv")}>
              <FileText className="mr-2 h-4 w-4" /> CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("excel")}>
              <FileText className="mr-2 h-4 w-4" /> Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("pdf")}>
              <FileText className="mr-2 h-4 w-4" /> PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completed} with completed assessments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averagePercentage}%</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0
                ? ((stats.completed / stats.total) * 100).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Students with grades
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Care Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.carePlansCompleted}</div>
            <p className="text-xs text-muted-foreground">
              Completed assessments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name or index..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={programFilter} onValueChange={setProgram}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Programs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            {programs.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.abbreviation ?? p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={levelFilter} onValueChange={setLevel}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {levels.map((l) => (
              <SelectItem key={l.id} value={String(l.id)}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={gradeFilter} onValueChange={setGrade}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Grades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {["Distinction", "Credit", "Pass", "Fail", "N/A"].map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(pageSize)}
          onValueChange={(v) => setPageSize(Number(v))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((s) => (
              <SelectItem key={s} value={String(s)}>
                {s} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grade distribution badges */}
      {GradeStats && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(GradeStats).map(([grade, count]) => (
            <span
              key={grade}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${GRADE_COLORS[grade] ?? GRADE_COLORS["N/A"]}`}
            >
              {grade}: {count}
            </span>
          ))}
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base">
            <span>
              {fetching
                ? "Loading…"
                : `${showingFrom}–${showingTo} of ${totalCount} students`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {SORTABLE_COLS.map(({ key, label }) => (
                    <TableHead
                      key={key}
                      className="cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleSort(key)}
                    >
                      {label}
                      <SortIcon col={key} sortBy={sortBy} order={order} />
                    </TableHead>
                  ))}
                  <TableHead>Proc. Score</TableHead>
                  <TableHead>Care Plan</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fetching ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 9 }).map((__, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-muted animate-pulse rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : grades.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No results found
                    </TableCell>
                  </TableRow>
                ) : (
                  grades.map((g) => (
                    <TableRow key={g.student_id}>
                      <TableCell className="font-mono text-sm cursor-pointer">
                        {g.index_number}
                      </TableCell>
                      <TableCell className="cursor-pointer">
                        {g.full_name}
                      </TableCell>
                      <TableCell
                        className="max-w-[160px] truncate cursor-pointer"
                        title={g.program_name}
                      >
                        {g.program_name}
                      </TableCell>
                      <TableCell className="cursor-pointer">
                        {g.level}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold ${g.percentage >= 60 ? "text-green-700" : g.percentage === 0 ? "text-muted-foreground" : "text-red-600"}`}
                        >
                          {g.percentage}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${GRADE_COLORS[g.grade] ?? GRADE_COLORS["N/A"]}`}
                        >
                          {g.grade}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {g.procedure_score}/{g.procedure_max_score}
                      </TableCell>
                      <TableCell className="text-sm">
                        {g.care_plan_completed ? (
                          `${g.care_plan_score}/${g.care_plan_max_score}`
                        ) : (
                          <span className="text-muted-foreground">–</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {g.total_score}/{g.max_score}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages} · {totalCount} total
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1 || fetching}
            onClick={() => setPage(1)}
          >
            <ChevronsUpDown className="h-4 w-4 rotate-90" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1 || fetching}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page number pills */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4));
            const n = start + i;
            return (
              <Button
                key={n}
                variant={n === page ? "default" : "outline"}
                size="icon"
                className="w-8 h-8 text-xs"
                onClick={() => setPage(n)}
                disabled={fetching}
              >
                {n}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="icon"
            disabled={page >= totalPages || fetching}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={page >= totalPages || fetching}
            onClick={() => setPage(totalPages)}
          >
            <ChevronsUpDown className="h-4 w-4 -rotate-90" />
          </Button>
        </div>
      </div>
    </div>
  );
}
