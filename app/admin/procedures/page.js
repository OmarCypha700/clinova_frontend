"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Plus,
  Pencil,
  Trash2,
  Search,
  Download,
  Upload,
  FileText,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = { name: "", program_id: "", total_score: "" };
const PAGE_SIZES = [25, 50, 100, 200];

export default function ProceduresPage() {
  const router = useRouter();

  const [programs, setPrograms] = useState([]);
  const [supportLoading, setSupportLoading] = useState(true);
  const [procedures, setProcedures] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("all");

  // Selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAllMode, setSelectAllMode] = useState(false);

  // CRUD
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Import
  const fileInputRef = useRef(null);
  const [importDialog, setImportDialog] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  // Debounce search — resets page to 1 alongside the debounced value (matches student page)
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Reset page when filters or page size change
  useEffect(() => {
    setPage(1);
    clearSelection();
  }, [programFilter, pageSize]);

  // Load programs once
  useEffect(() => {
    api
      .get("/exams/admin/programs/")
      .then((res) =>
        setPrograms(
          Array.isArray(res.data) ? res.data : (res.data?.results ?? []),
        ),
      )
      .catch(() => toast.error("Failed to load programs"))
      .finally(() => setSupportLoading(false));
  }, []);

  // Fetch procedures — useCallback so mutation handlers can call it directly
  const fetchProcedures = useCallback(async () => {
    setFetching(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      });
      if (debouncedSearch)         params.set("search", debouncedSearch);
      if (programFilter !== "all") params.set("program_id", programFilter);

      const res = await api.get(`/exams/admin/procedures/?${params}`);
      if (res.data?.results !== undefined) {
        setProcedures(res.data.results);
        setTotalCount(res.data.count ?? res.data.results.length);
      } else {
        const arr = Array.isArray(res.data) ? res.data : [];
        setProcedures(arr);
        setTotalCount(arr.length);
      }
    } catch {
      toast.error("Failed to load procedures");
    } finally {
      setFetching(false);
    }
  }, [page, pageSize, debouncedSearch, programFilter]);

  useEffect(() => {
    if (!supportLoading) fetchProcedures();
  }, [fetchProcedures, supportLoading]);


  // Selection helpers
  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectAllMode(false);
  };
  const pageIds = procedures.map((p) => p.id);
  const isRowChecked = (id) => selectAllMode || selectedIds.has(id);
  const allOnPageChecked =
    procedures.length > 0 && pageIds.every((id) => isRowChecked(id));
  const someOnPageChecked =
    !selectAllMode &&
    pageIds.some((id) => selectedIds.has(id)) &&
    !pageIds.every((id) => selectedIds.has(id));
  const logicalCount = selectAllMode ? totalCount : selectedIds.size;
  const showSelectAllBanner =
    !selectAllMode &&
    allOnPageChecked &&
    selectedIds.size > 0 &&
    totalCount > pageSize;

  const handleHeaderCheckbox = (checked) => {
    if (selectAllMode) {
      clearSelection();
      return;
    }
    if (checked) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.add(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
    }
  };

  const handleRowCheckbox = (id, checked) => {
    if (selectAllMode) {
      setSelectAllMode(false);
      setSelectedIds(new Set(pageIds.filter((pid) => pid !== id)));
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  };

  // Navigate to steps page when row is clicked
  const goToSteps = (proc) => router.push(`/admin/procedures/${proc.id}/steps`);

  // CRUD
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        program_id: parseInt(formData.program_id),
        total_score: parseInt(formData.total_score),
      };
      if (editingProcedure) {
        await api.patch(
          `/exams/admin/procedures/${editingProcedure.id}/`,
          payload,
        );
        toast.success("Procedure updated");
      } else {
        await api.post("/exams/admin/procedures/", payload);
        toast.success("Procedure created");
      }
      setDialogOpen(false);
      resetForm();
      fetchProcedures();
    } catch {
      toast.error("Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (proc, e) => {
    e.stopPropagation();
    setEditingProcedure(proc);
    setFormData({
      name: proc.name,
      program_id: String(proc.program_id),
      total_score: String(proc.total_score),
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/exams/admin/procedures/${deleteDialog.id}/`);
      toast.success("Procedure deleted");
      setDeleteDialog({ open: false, id: null });
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteDialog.id);
        return next;
      });
      fetchProcedures();
    } catch {
      toast.error("Failed to delete. It may have related records.");
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      let idsToDelete;
      if (selectAllMode) {
        toast.info("Fetching all matching procedure IDs…");
        const params = new URLSearchParams({ page_size: "5000" });
        if (debouncedSearch)         params.set("search", debouncedSearch);
        if (programFilter !== "all") params.set("program_id", programFilter);
        let allIds = [],
          currentPage = 1,
          hasMore = true;
        while (hasMore) {
          params.set("page", String(currentPage));
          const res = await api.get(`/exams/admin/procedures/?${params}`);
          const results =
            res.data?.results ?? (Array.isArray(res.data) ? res.data : []);
          allIds = allIds.concat(results.map((p) => p.id));
          hasMore = Boolean(res.data?.next) && results.length > 0;
          currentPage++;
        }
        idsToDelete = allIds;
      } else {
        idsToDelete = [...selectedIds];
      }
      if (!idsToDelete.length) {
        toast.error("No procedures to delete");
        return;
      }
      await api.post("/exams/procedures/bulk-delete/", {
        procedure_ids: idsToDelete,
      });
      toast.success(
        `Deleted ${idsToDelete.length.toLocaleString()} procedure(s)`,
      );
      setBulkDeleteDialog(false);
      clearSelection();
      fetchProcedures();
    } catch (err) {
      toast.error(err.response?.data?.error || "Bulk delete failed");
    } finally {
      setBulkDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingProcedure(null);
  };

  const handleExport = async (format) => {
    try {
      const params = new URLSearchParams({ export: format });
      if (debouncedSearch)         params.set("search", debouncedSearch);
      if (programFilter !== "all") params.set("program_id", programFilter);
      const res = await api.get(`/exams/admin/procedures/?${params}`, {
        responseType: "blob",
      });
      const ext = format === "excel" ? "xlsx" : format;
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `procedures.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed");
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append("file", importFile);
      const res = await api.post("/exams/procedures/import/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const d = res.data;
      toast.success(
        `Imported: ${d.procedures_created} created, ${d.procedures_updated} updated`,
      );
      if (d.error_details?.length)
        d.error_details.forEach((e) => toast.warning(e));
      setImportDialog(false);
      setImportFile(null);
      fetchProcedures();
    } catch {
      toast.error("Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await api.get("/exams/procedures/template/", {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "procedures_import_template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download template");
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const showingFrom = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, totalCount);
  const pagePills = (() => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  })();

  if (supportLoading) return <DashboardSkeleton showStats={false} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Procedures</h2>
          <p className="text-muted-foreground">
            Manage assessment procedures — click a row to view its steps
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {logicalCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteDialog(true)}
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Delete (
              {logicalCount.toLocaleString()})
            </Button>
          )}
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
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                <FileText className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="mr-1.5 h-4 w-4" />
                Import
                <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setImportDialog(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload file
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Procedure
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search procedures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
            className="pl-8"
          />
        </div>
        <Select value={programFilter} onValueChange={setProgramFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All Programs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            {programs.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => setPageSize(Number(v))}
        >
          <SelectTrigger className="w-[110px]">
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

      {/* Select-all offer banner */}
      {showSelectAllBanner && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-primary/5 border border-primary/20 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Layers className="h-4 w-4 text-primary shrink-0" />
            All <strong className="text-foreground">
              {selectedIds.size}
            </strong>{" "}
            procedures on this page are selected.
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 border-primary/40 text-primary hover:bg-primary/10"
            onClick={() => setSelectAllMode(true)}
          >
            Select all{" "}
            <strong className="ml-1">{totalCount.toLocaleString()}</strong>{" "}
            procedures
          </Button>
        </div>
      )}

      {/* All-selected banner */}
      {selectAllMode && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-primary/5 border border-primary/20 text-sm">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary shrink-0" />
            All <strong>{totalCount.toLocaleString()}</strong> procedures
            matching the current filters are selected.
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="shrink-0 text-muted-foreground"
            onClick={clearSelection}
          >
            Clear selection
          </Button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base">
            <span>
              {fetching
                ? "Loading…"
                : `${showingFrom}–${showingTo} of ${totalCount} procedures`}
            </span>
            {logicalCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                {logicalCount.toLocaleString()} selected
                <button
                  className="ml-2 underline text-xs"
                  onClick={clearSelection}
                >
                  Clear
                </button>
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 pl-4">
                  <Checkbox
                    checked={selectAllMode || allOnPageChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = someOnPageChecked;
                    }}
                    onCheckedChange={handleHeaderCheckbox}
                    aria-label="Select all on this page"
                  />
                </TableHead>
                <TableHead>Procedure Name</TableHead>
                <TableHead>Program</TableHead>
                <TableHead className="text-center">Total Score</TableHead>
                <TableHead className="text-center">Steps</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fetching ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : procedures.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No procedures found
                  </TableCell>
                </TableRow>
              ) : (
                procedures.map((proc) => {
                  const checked = isRowChecked(proc.id);
                  return (
                    <TableRow
                      key={proc.id}
                      data-state={checked ? "selected" : undefined}
                      className={`cursor-pointer hover:bg-muted/50 transition-colors ${checked ? "bg-muted/40" : ""}`}
                      onClick={() => goToSteps(proc)}
                    >
                      <TableCell
                        className="pl-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(c) => handleRowCheckbox(proc.id, c)}
                          aria-label={`Select ${proc.name}`}
                        />
                      </TableCell>
                      <TableCell title={proc.name}>
                        <div className="flex items-center gap-1.5">
                          <span className="max-w-[250px] truncate font-medium">
                            {proc.name}
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                        </div>
                      </TableCell>
                      <TableCell>{proc.program}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {proc.total_score} pts
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge>
                          {proc.step_count ?? 0} step
                          {proc.step_count !== 1 ? "s" : ""}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="text-right pr-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View steps"
                            onClick={() => goToSteps(proc)}
                          >
                            <Layers className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleEdit(proc, e)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteDialog({ open: true, id: proc.id });
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {!fetching && totalCount > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} &middot; {totalCount} total procedures
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => setPage(1)}
              title="First"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {pagePills.map((n) => (
              <Button
                key={n}
                variant={n === page ? "default" : "outline"}
                size="icon"
                className="w-8 h-8 text-xs"
                onClick={() => setPage(n)}
              >
                {n}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              title="Last"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProcedure ? "Edit Procedure" : "Add New Procedure"}
            </DialogTitle>
            <DialogDescription>
              {editingProcedure
                ? "Update procedure information"
                : "Create a new assessment procedure"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proc-name">Procedure Name</Label>
              <Input
                id="proc-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., IV Catheter Insertion"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Program</Label>
              <Select
                value={formData.program_id}
                onValueChange={(v) =>
                  setFormData({ ...formData, program_id: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proc-score">Total Score</Label>
              <Input
                id="proc-score"
                type="number"
                min={1}
                value={formData.total_score}
                onChange={(e) =>
                  setFormData({ ...formData, total_score: e.target.value })
                }
                placeholder="e.g., 20"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !formData.program_id}
              >
                {submitting
                  ? "Saving…"
                  : editingProcedure
                    ? "Update"
                    : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Single delete */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this procedure?</AlertDialogTitle>
            <AlertDialogDescription>
              All steps for this procedure will also be deleted. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete */}
      <AlertDialog open={bulkDeleteDialog} onOpenChange={setBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {logicalCount.toLocaleString()} procedure
              {logicalCount !== 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  All steps for the selected procedures will be permanently
                  deleted.
                </p>
                {selectAllMode && (
                  <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                    <span>⚠</span>
                    <span>
                      You are about to delete{" "}
                      <strong>
                        all {totalCount.toLocaleString()} procedures
                      </strong>{" "}
                      matching the current filters. This cannot be reversed.
                    </span>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkDeleting
                ? "Deleting…"
                : `Delete ${logicalCount.toLocaleString()}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import dialog */}
      <Dialog open={importDialog} onOpenChange={setImportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Procedures</DialogTitle>
            <DialogDescription>
              Upload an Excel or CSV file. Use the template for the correct
              format.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {importFile ? (
                <p className="text-sm font-medium">{importFile.name}</p>
              ) : (
                <>
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to select or drag & drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    .xlsx, .xls, .csv
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setImportDialog(false);
                setImportFile(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!importFile || importing}>
              {importing ? "Importing…" : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}