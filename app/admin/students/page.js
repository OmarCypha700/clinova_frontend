// "use client";

// import { useCallback, useEffect, useRef, useState } from "react";
// import { api } from "@/lib/api";
// import DashboardSkeleton from "@/components/DashboardSkeleton";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { Badge } from "@/components/ui/badge";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Plus, Pencil, Trash2, Search, Download, Upload,
//   UserCheck, UserX, ChevronDown, FileText,
//   ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
// } from "lucide-react";
// import { toast } from "sonner";

// // ─── constants ───────────────────────────────────────────────────────────────

// const EMPTY_FORM = {
//   index_number: "",
//   full_name: "",
//   program_id: "",
//   level_id: "",
//   is_active: true,
// };

// const PAGE_SIZES = [25, 50, 100, 200];

// // ─── component ────────────────────────────────────────────────────────────────

// export default function StudentsPage() {
//   // Support data (programs / levels – fetched once, never paginated)
//   const [programs, setPrograms] = useState([]);
//   const [levels, setLevels] = useState([]);
//   const [supportLoading, setSupportLoading] = useState(true);

//   // Paginated student data
//   const [students, setStudents] = useState([]);
//   const [totalCount, setTotalCount] = useState(0);
//   const [fetching, setFetching] = useState(false);

//   // Pagination
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(50);

//   // Filters / search
//   const [searchQuery, setSearchQuery] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");
//   const [filterProgram, setFilterProgram] = useState("all");
//   const [filterLevel, setFilterLevel] = useState("all");

//   // Selection
//   const [selectedStudents, setSelectedStudents] = useState([]);

//   // CRUD dialogs
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editingStudent, setEditingStudent] = useState(null);
//   const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
//   const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
//   const [formData, setFormData] = useState(EMPTY_FORM);
//   const [submitting, setSubmitting] = useState(false);

//   // Import
//   const fileInputRef = useRef(null);
//   const [importDialog, setImportDialog] = useState(false);
//   const [importFile, setImportFile] = useState(null);
//   const [importing, setImporting] = useState(false);
//   const [importResult, setImportResult] = useState(null);

//   // ── debounce search ──────────────────────────────────────────────────────────

//   useEffect(() => {
//     const t = setTimeout(() => {
//       setDebouncedSearch(searchQuery);
//       setPage(1); // reset to first page on new search
//     }, 350);
//     return () => clearTimeout(t);
//   }, [searchQuery]);

//   // Reset page when filters change
//   useEffect(() => { setPage(1); }, [filterProgram, filterLevel, pageSize]);

//   // ── load programs & levels once ──────────────────────────────────────────────

//   useEffect(() => {
//     Promise.all([
//       api.get("/exams/programs/"),
//       api.get("/exams/levels/"),
//     ])
//       .then(([pr, lr]) => {
//         // Both endpoints return plain arrays (not paginated)
//         setPrograms(Array.isArray(pr.data) ? pr.data : (pr.data?.results ?? []));
//         setLevels(Array.isArray(lr.data) ? lr.data : (lr.data?.results ?? []));
//       })
//       .catch(() => toast.error("Failed to load programs/levels"))
//       .finally(() => setSupportLoading(false));
//   }, []);

//   // ── fetch students (server-side pagination + filtering) ──────────────────────

//   const fetchStudents = useCallback(async () => {
//     setFetching(true);
//     try {
//       const params = new URLSearchParams({
//         page: String(page),
//         page_size: String(pageSize),
//       });
//       if (debouncedSearch)          params.set("search", debouncedSearch);
//       if (filterProgram !== "all")  params.set("program_id", filterProgram);
//       if (filterLevel !== "all")    params.set("level_id", filterLevel);

//       const res = await api.get(`/exams/admin/students/?${params}`);

//       // DRF PageNumberPagination returns { count, next, previous, results }
//       if (res.data?.results !== undefined) {
//         setStudents(res.data.results);
//         setTotalCount(res.data.count ?? res.data.results.length);
//       } else {
//         // Fallback: plain array (pagination disabled)
//         const arr = Array.isArray(res.data) ? res.data : [];
//         setStudents(arr);
//         setTotalCount(arr.length);
//       }
//     } catch {
//       toast.error("Failed to load students");
//     } finally {
//       setFetching(false);
//     }
//   }, [page, pageSize, debouncedSearch, filterProgram, filterLevel]);

//   useEffect(() => {
//     if (!supportLoading) fetchStudents();
//   }, [fetchStudents, supportLoading]);

//   // ── selection helpers ────────────────────────────────────────────────────────

//   const allOnPageSelected =
//     students.length > 0 && students.every((s) => selectedStudents.includes(s.id));
//   const someOnPageSelected =
//     students.some((s) => selectedStudents.includes(s.id)) && !allOnPageSelected;

//   const handleSelectAll = (checked) => {
//     if (checked) {
//       // Add all current-page IDs (deduplicated)
//       setSelectedStudents((prev) => [
//         ...new Set([...prev, ...students.map((s) => s.id)]),
//       ]);
//     } else {
//       // Remove current-page IDs only
//       const pageIds = new Set(students.map((s) => s.id));
//       setSelectedStudents((prev) => prev.filter((id) => !pageIds.has(id)));
//     }
//   };

//   const handleSelectStudent = (studentId, checked) => {
//     if (checked) {
//       setSelectedStudents((prev) => [...prev, studentId]);
//     } else {
//       setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
//     }
//   };

//   // ── CRUD ─────────────────────────────────────────────────────────────────────

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     try {
//       if (editingStudent) {
//         await api.patch(`/exams/admin/students/${editingStudent.id}/`, formData);
//         toast.success("Student updated successfully");
//       } else {
//         await api.post("/exams/admin/students/", formData);
//         toast.success("Student created successfully");
//       }
//       setDialogOpen(false);
//       resetForm();
//       fetchStudents();
//     } catch (err) {
//       toast.error(err.response?.data?.index_number?.[0] || "Operation failed");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleEdit = (student) => {
//     setEditingStudent(student);
//     setFormData({
//       index_number: student.index_number,
//       full_name: student.full_name,
//       // program_id is the integer id to send; student.program is the nested object
//       program_id: student.program?.id ?? "",
//       // student.level is the FK integer from the serializer
//       level_id: student.level ?? "",
//       is_active: student.is_active,
//     });
//     setDialogOpen(true);
//   };

//   const handleDelete = async () => {
//     try {
//       await api.delete(`/exams/admin/students/${deleteDialog.id}/`);
//       toast.success("Student deleted successfully");
//       setDeleteDialog({ open: false, id: null });
//       setSelectedStudents((prev) => prev.filter((id) => id !== deleteDialog.id));
//       fetchStudents();
//     } catch {
//       toast.error("Failed to delete student");
//     }
//   };

//   const handleBulkDelete = async () => {
//     try {
//       await api.post("/exams/students/bulk-delete/", { student_ids: selectedStudents });
//       toast.success(`Successfully deleted ${selectedStudents.length} student(s)`);
//       setBulkDeleteDialog(false);
//       setSelectedStudents([]);
//       fetchStudents();
//     } catch (err) {
//       toast.error(err.response?.data?.error || "Failed to delete students");
//     }
//   };

//   const handleToggleActive = async (id, currentStatus) => {
//     // Optimistic update
//     setStudents((prev) =>
//       prev.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s))
//     );
//     try {
//       await api.post(`/exams/admin/students/${id}/toggle_active/`);
//       toast.success(`Student ${!currentStatus ? "activated" : "deactivated"} successfully`);
//     } catch {
//       // Revert on error
//       setStudents((prev) =>
//         prev.map((s) => (s.id === id ? { ...s, is_active: currentStatus } : s))
//       );
//       toast.error("Failed to update status");
//     }
//   };

//   const resetForm = () => {
//     setFormData(EMPTY_FORM);
//     setEditingStudent(null);
//   };

//   // ── export ────────────────────────────────────────────────────────────────────

//   const handleExport = async (extension) => {
//     try {
//       const format = extension.replace(".", "");
//       const params = new URLSearchParams({ export: format });
//       if (filterProgram !== "all") params.set("program_id", filterProgram);
//       if (filterLevel !== "all")   params.set("level_id", filterLevel);
//       if (debouncedSearch)         params.set("search", debouncedSearch);

//       const res = await api.get(`/exams/admin/students/?${params}`, {
//         responseType: "blob",
//       });
//       const url = URL.createObjectURL(new Blob([res.data]));
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `students${extension}`;
//       a.click();
//       URL.revokeObjectURL(url);
//       toast.success(`Exported as ${format.toUpperCase()}`);
//     } catch {
//       toast.error("Export failed");
//     }
//   };

//   const handleDownloadTemplate = async () => {
//     try {
//       const res = await api.get("/exams/students/template/", { responseType: "blob" });
//       const url = URL.createObjectURL(new Blob([res.data]));
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "students_import_template.xlsx";
//       a.click();
//       URL.revokeObjectURL(url);
//       toast.success("Template downloaded");
//     } catch {
//       toast.error("Failed to download template");
//     }
//   };

//   // ── import ────────────────────────────────────────────────────────────────────

//   const handleFileSelect = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const validTypes = [
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       "application/vnd.ms-excel",
//       "text/csv",
//     ];
//     if (!validTypes.includes(file.type) && !file.name.endsWith(".csv")) {
//       toast.error("Please upload a valid Excel (.xlsx) or CSV file");
//       return;
//     }
//     setImportFile(file);
//     setImportDialog(true);
//   };

//   const handleImportSubmit = async () => {
//     if (!importFile) return;
//     setImporting(true);
//     setImportResult(null);
//     try {
//       const fd = new FormData();
//       fd.append("file", importFile);
//       const res = await api.post("/exams/students/import/", fd, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       setImportResult(res.data);
//       if (res.data.errors === 0) {
//         toast.success(`Import done — Created: ${res.data.created}, Updated: ${res.data.updated}`);
//         setTimeout(() => {
//           setImportDialog(false);
//           setImportFile(null);
//           setImportResult(null);
//           fetchStudents();
//         }, 2500);
//       } else {
//         toast.warning(`Import completed with ${res.data.errors} errors`);
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.error || "Import failed");
//     } finally {
//       setImporting(false);
//     }
//   };

//   // ── pagination helpers ────────────────────────────────────────────────────────

//   const totalPages   = Math.max(1, Math.ceil(totalCount / pageSize));
//   const showingFrom  = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
//   const showingTo    = Math.min(page * pageSize, totalCount);

//   // Build at most 5 page-number pills centred around current page
//   const pagePills = (() => {
//     const start = Math.max(1, Math.min(page - 2, totalPages - 4));
//     const end   = Math.min(totalPages, start + 4);
//     return Array.from({ length: end - start + 1 }, (_, i) => start + i);
//   })();

//   // ─────────────────────────────────────────────────────────────────────────────

//   if (supportLoading) return <DashboardSkeleton showStats={false} />;

//   return (
//     <div className="space-y-6">

//       {/* ── Header ── */}
//       <div className="flex flex-col justify-between gap-2">
//         <div>
//           <h2 className="text-2xl font-bold tracking-tight">Students</h2>
//           <p className="text-muted-foreground">
//             Manage student records and enrollments
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           {/* Export */}
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" size="sm">
//                 <Download className="mr-1.5 h-4 w-4" />
//                 Export
//                 <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-60" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuItem onClick={() => handleExport(".csv")}>
//                 <FileText className="mr-2 h-4 w-4" /> CSV
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => handleExport(".xlsx")}>
//                 <FileText className="mr-2 h-4 w-4" /> Excel
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => handleExport(".pdf")}>
//                 <FileText className="mr-2 h-4 w-4" /> PDF
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>

//           {/* Import */}
//           <input
//             ref={fileInputRef}
//             type="file"
//             accept=".xlsx,.xls,.csv"
//             className="hidden"
//             onChange={handleFileSelect}
//           />
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" size="sm">
//                 <Upload className="mr-1.5 h-4 w-4" />
//                 Import
//                 <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-60" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
//                 <Upload className="mr-2 h-4 w-4" /> Upload file
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={handleDownloadTemplate}>
//                 <Download className="mr-2 h-4 w-4" /> Download template
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>

//           <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
//             <Plus className="mr-2 h-4 w-4" />
//             Add Student
//           </Button>
//         </div>
//       </div>

//       {/* ── Filters ── */}
//       <div className="flex flex-wrap gap-2 items-center">
//         {/* Search */}
//         <div className="relative flex-1 min-w-[200px] max-w-sm">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search by name or index..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-8"
//           />
//         </div>

//         {/* Program filter */}
//         <Select value={filterProgram} onValueChange={setFilterProgram}>
//           <SelectTrigger className="w-48">
//             <SelectValue placeholder="All Programs" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Programs</SelectItem>
//             {programs.map((p) => (
//               <SelectItem key={p.id} value={String(p.id)}>
//                 {p.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         {/* Level filter */}
//         <Select value={filterLevel} onValueChange={setFilterLevel}>
//           <SelectTrigger className="w-40">
//             <SelectValue placeholder="All Levels" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Levels</SelectItem>
//             {levels.map((l) => (
//               <SelectItem key={l.id} value={String(l.id)}>
//                 {l.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         {/* Page size */}
//         <Select
//           value={String(pageSize)}
//           onValueChange={(v) => setPageSize(Number(v))}
//         >
//           <SelectTrigger className="w-[110px]">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent>
//             {PAGE_SIZES.map((s) => (
//               <SelectItem key={s} value={String(s)}>
//                 {s} / page
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         {/* Bulk delete button */}
//         {selectedStudents.length > 0 && (
//           <Button variant="destructive" size="sm" onClick={() => setBulkDeleteDialog(true)}>
//             <Trash2 className="mr-2 h-4 w-4" />
//             Delete Selected ({selectedStudents.length})
//           </Button>
//         )}
//       </div>

//       {/* ── Table ── */}
//       <Card>
//         <CardHeader className="pb-2">
//           <CardTitle className="flex items-center justify-between text-base">
//             <span>
//               {fetching
//                 ? "Loading…"
//                 : `${showingFrom}–${showingTo} of ${totalCount} students`}
//             </span>
//             {selectedStudents.length > 0 && (
//               <span className="text-sm font-normal text-muted-foreground">
//                 {selectedStudents.length} selected
//                 <button
//                   className="ml-2 underline text-xs"
//                   onClick={() => setSelectedStudents([])}
//                 >
//                   Clear
//                 </button>
//               </span>
//             )}
//           </CardTitle>
//         </CardHeader>

//         <CardContent className="p-0">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-12 pl-4">
//                   <Checkbox
//                     checked={allOnPageSelected}
//                     // indeterminate when some (but not all) on this page are checked
//                     ref={(el) => el && (el.indeterminate = someOnPageSelected)}
//                     onCheckedChange={handleSelectAll}
//                     aria-label="Select all on this page"
//                   />
//                 </TableHead>
//                 <TableHead>Index Number</TableHead>
//                 <TableHead>Full Name</TableHead>
//                 <TableHead>Program</TableHead>
//                 <TableHead>Level</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead className="text-right pr-4">Actions</TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {/* Loading skeleton rows */}
//               {fetching ? (
//                 Array.from({ length: 8 }).map((_, i) => (
//                   <TableRow key={i}>
//                     {Array.from({ length: 7 }).map((__, j) => (
//                       <TableCell key={j}>
//                         <div className="h-4 bg-muted animate-pulse rounded" />
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))
//               ) : students.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
//                     No students found
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 students.map((student) => (
//                   <TableRow
//                     key={student.id}
//                     data-state={selectedStudents.includes(student.id) ? "selected" : undefined}
//                     className={selectedStudents.includes(student.id) ? "bg-muted/40" : undefined}
//                   >
//                     <TableCell className="pl-4">
//                       <Checkbox
//                         checked={selectedStudents.includes(student.id)}
//                         onCheckedChange={(checked) =>
//                           handleSelectStudent(student.id, checked)
//                         }
//                         aria-label={`Select ${student.full_name}`}
//                       />
//                     </TableCell>
//                     <TableCell className="font-medium font-mono text-sm">
//                       {student.index_number}
//                     </TableCell>
//                     <TableCell>{student.full_name}</TableCell>
//                     <TableCell>{student.program?.name ?? "—"}</TableCell>
//                     <TableCell>{student.level_name ?? "—"}</TableCell>
//                     <TableCell>
//                       <Badge
//                         className={
//                           student.is_active
//                             ? "bg-green-600 hover:bg-green-700"
//                             : "bg-red-500 hover:bg-red-600"
//                         }
//                       >
//                         {student.is_active ? "Active" : "Inactive"}
//                       </Badge>
//                     </TableCell>
//                     <TableCell className="text-right pr-4">
//                       <div className="flex items-center justify-end gap-1">
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => handleToggleActive(student.id, student.is_active)}
//                           title={student.is_active ? "Deactivate" : "Activate"}
//                         >
//                           {student.is_active
//                             ? <UserX className="h-4 w-4 text-red-500" />
//                             : <UserCheck className="h-4 w-4 text-green-500" />}
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => handleEdit(student)}
//                         >
//                           <Pencil className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => setDeleteDialog({ open: true, id: student.id })}
//                         >
//                           <Trash2 className="h-4 w-4 text-destructive" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>

//       {/* ── Pagination controls ── */}
//       {!fetching && totalCount > 0 && (
//         <div className="flex items-center justify-between flex-wrap gap-3">
//           <p className="text-sm text-muted-foreground">
//             Page {page} of {totalPages} &middot; {totalCount} total students
//           </p>

//           <div className="flex items-center gap-1">
//             {/* First */}
//             <Button
//               variant="outline" size="icon"
//               disabled={page <= 1}
//               onClick={() => setPage(1)}
//               title="First page"
//             >
//               <ChevronsLeft className="h-4 w-4" />
//             </Button>

//             {/* Prev */}
//             <Button
//               variant="outline" size="icon"
//               disabled={page <= 1}
//               onClick={() => setPage((p) => p - 1)}
//               title="Previous page"
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </Button>

//             {/* Page pills */}
//             {pagePills.map((n) => (
//               <Button
//                 key={n}
//                 variant={n === page ? "default" : "outline"}
//                 size="icon"
//                 className="w-8 h-8 text-xs"
//                 onClick={() => setPage(n)}
//               >
//                 {n}
//               </Button>
//             ))}

//             {/* Next */}
//             <Button
//               variant="outline" size="icon"
//               disabled={page >= totalPages}
//               onClick={() => setPage((p) => p + 1)}
//               title="Next page"
//             >
//               <ChevronRight className="h-4 w-4" />
//             </Button>

//             {/* Last */}
//             <Button
//               variant="outline" size="icon"
//               disabled={page >= totalPages}
//               onClick={() => setPage(totalPages)}
//               title="Last page"
//             >
//               <ChevronsRight className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       )}

//       {/* ── Add / Edit Dialog ── */}
//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>
//               {editingStudent ? "Edit Student" : "Add New Student"}
//             </DialogTitle>
//             <DialogDescription>
//               {editingStudent ? "Update student information" : "Create a new student record"}
//             </DialogDescription>
//           </DialogHeader>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="index_number">Index Number</Label>
//               <Input
//                 id="index_number"
//                 value={formData.index_number}
//                 onChange={(e) => setFormData({ ...formData, index_number: e.target.value })}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="full_name">Full Name</Label>
//               <Input
//                 id="full_name"
//                 value={formData.full_name}
//                 onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label>Program</Label>
//               <Select
//                 value={String(formData.program_id || "")}
//                 onValueChange={(v) => setFormData({ ...formData, program_id: parseInt(v) })}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select program" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {programs.map((p) => (
//                     <SelectItem key={p.id} value={String(p.id)}>
//                       {p.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label>Level</Label>
//               <Select
//                 value={String(formData.level_id || "")}
//                 onValueChange={(v) => setFormData({ ...formData, level_id: parseInt(v) })}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select level" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {levels.map((l) => (
//                     <SelectItem key={l.id} value={String(l.id)}>
//                       {l.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <DialogFooter>
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => { setDialogOpen(false); resetForm(); }}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={submitting}>
//                 {submitting ? "Saving…" : editingStudent ? "Update Student" : "Create Student"}
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* ── Delete Dialog ── */}
//       <AlertDialog
//         open={deleteDialog.open}
//         onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This will permanently delete the student record and cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleDelete} className="bg-destructive">
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       {/* ── Bulk Delete Dialog ── */}
//       <AlertDialog open={bulkDeleteDialog} onOpenChange={setBulkDeleteDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete {selectedStudents.length} student(s)?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. All selected student records will be permanently removed.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive">
//               Delete {selectedStudents.length} Student(s)
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       {/* ── Import Dialog ── */}
//       <Dialog open={importDialog} onOpenChange={setImportDialog}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Import Students</DialogTitle>
//             <DialogDescription>
//               Upload an Excel or CSV file to import student records
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4">
//             {importFile && (
//               <div className="p-4 bg-muted rounded-lg">
//                 <p className="text-sm font-medium">Selected file:</p>
//                 <p className="text-sm text-muted-foreground">{importFile.name}</p>
//               </div>
//             )}

//             {importResult && (
//               <div
//                 className={`p-4 rounded-lg border ${
//                   importResult.errors === 0 ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
//                 }`}
//               >
//                 <p className="font-semibold mb-2">Import Results:</p>
//                 <ul className="text-sm space-y-1">
//                   <li>✓ Created: {importResult.created}</li>
//                   <li>✓ Updated: {importResult.updated}</li>
//                   {importResult.errors > 0 && (
//                     <li className="text-red-600">✗ Errors: {importResult.errors}</li>
//                   )}
//                 </ul>
//                 {importResult.error_details?.length > 0 && (
//                   <div className="mt-3">
//                     <p className="text-sm font-medium mb-1">Error Details:</p>
//                     <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
//                       {importResult.error_details.map((err, i) => (
//                         <li key={i} className="text-red-600">{err}</li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           <DialogFooter>
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => {
//                 setImportDialog(false);
//                 setImportFile(null);
//                 setImportResult(null);
//               }}
//             >
//               Cancel
//             </Button>
//             <Button onClick={handleImportSubmit} disabled={importing || !importFile}>
//               {importing ? "Importing…" : "Import"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }




"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus, Pencil, Trash2, Search, Download, Upload,
  UserCheck, UserX, ChevronDown, FileText,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Users,
} from "lucide-react";
import { toast } from "sonner";

// ─── constants ───────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  index_number: "",
  full_name: "",
  program_id: "",
  level_id: "",
  is_active: true,
};

const PAGE_SIZES = [25, 50, 100, 200];

// ─── component ────────────────────────────────────────────────────────────────

export default function StudentsPage() {
  // Support data
  const [programs, setPrograms]             = useState([]);
  const [levels, setLevels]                 = useState([]);
  const [supportLoading, setSupportLoading] = useState(true);

  // Paginated student data
  const [students, setStudents]     = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [fetching, setFetching]     = useState(false);

  // Pagination
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Filters / search
  const [searchQuery, setSearchQuery]         = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterProgram, setFilterProgram]     = useState("all");
  const [filterLevel, setFilterLevel]         = useState("all");

  // ── Selection ───────────────────────────────────────────────────────────────
  // selectedIds  – Set of IDs explicitly ticked (current + previous pages)
  // selectAllMode – true when user chose "Select all N students" across all pages
  const [selectedIds, setSelectedIds]     = useState(new Set());
  const [selectAllMode, setSelectAllMode] = useState(false);

  // CRUD dialogs
  const [dialogOpen, setDialogOpen]             = useState(false);
  const [editingStudent, setEditingStudent]     = useState(null);
  const [deleteDialog, setDeleteDialog]         = useState({ open: false, id: null });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting]         = useState(false);
  const [formData, setFormData]                 = useState(EMPTY_FORM);
  const [submitting, setSubmitting]             = useState(false);

  // Import
  const fileInputRef = useRef(null);
  const [importDialog, setImportDialog] = useState(false);
  const [importFile, setImportFile]     = useState(null);
  const [importing, setImporting]       = useState(false);
  const [importResult, setImportResult] = useState(null);

  // ── debounce search ──────────────────────────────────────────────────────────

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Reset page + clear selection when filters change
  useEffect(() => {
    setPage(1);
    clearSelection();
  }, [filterProgram, filterLevel, pageSize, debouncedSearch]);

  // ── load programs & levels once ──────────────────────────────────────────────

  useEffect(() => {
    Promise.all([
      api.get("/exams/programs/"),
      api.get("/exams/levels/"),
    ])
      .then(([pr, lr]) => {
        setPrograms(Array.isArray(pr.data) ? pr.data : (pr.data?.results ?? []));
        setLevels(Array.isArray(lr.data) ? lr.data : (lr.data?.results ?? []));
      })
      .catch(() => toast.error("Failed to load programs/levels"))
      .finally(() => setSupportLoading(false));
  }, []);

  // ── fetch students (server-side) ─────────────────────────────────────────────

  // Builds the shared filter params (no page/page_size) so both
  // fetchStudents and handleBulkDelete use the same filters.
  const buildFilterParams = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedSearch)          params.set("search", debouncedSearch);
    if (filterProgram !== "all")  params.set("program_id", filterProgram);
    if (filterLevel !== "all")    params.set("level_id", filterLevel);
    return params;
  }, [debouncedSearch, filterProgram, filterLevel]);

  const fetchStudents = useCallback(async () => {
    setFetching(true);
    try {
      const params = buildFilterParams();
      params.set("page", String(page));
      params.set("page_size", String(pageSize));

      const res = await api.get(`/exams/admin/students/?${params}`);
      if (res.data?.results !== undefined) {
        setStudents(res.data.results);
        setTotalCount(res.data.count ?? res.data.results.length);
      } else {
        const arr = Array.isArray(res.data) ? res.data : [];
        setStudents(arr);
        setTotalCount(arr.length);
      }
    } catch {
      toast.error("Failed to load students");
    } finally {
      setFetching(false);
    }
  }, [page, pageSize, buildFilterParams]);

  useEffect(() => {
    if (!supportLoading) fetchStudents();
  }, [fetchStudents, supportLoading]);

  // ── selection helpers ────────────────────────────────────────────────────────

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectAllMode(false);
  };

  const pageIds = students.map((s) => s.id);

  // In selectAllMode every visible row is "checked"
  const isRowChecked = (id) => selectAllMode || selectedIds.has(id);

  const allOnPageChecked =
    students.length > 0 && pageIds.every((id) => isRowChecked(id));

  const someOnPageChecked =
    !selectAllMode &&
    pageIds.some((id) => selectedIds.has(id)) &&
    !pageIds.every((id) => selectedIds.has(id));

  // How many students are logically selected (drives button labels + dialog copy)
  const logicalSelectionCount = selectAllMode ? totalCount : selectedIds.size;

  // Show "select all across pages" offer once every row on the page is ticked
  // and there are more students beyond this page
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
      // Unchecking a single row exits selectAllMode; keep rest of page selected
      setSelectAllMode(false);
      const next = new Set(pageIds.filter((pid) => pid !== id));
      setSelectedIds(next);
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  };

  // ── CRUD ─────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingStudent) {
        await api.patch(`/exams/admin/students/${editingStudent.id}/`, formData);
        toast.success("Student updated successfully");
      } else {
        await api.post("/exams/admin/students/", formData);
        toast.success("Student created successfully");
      }
      setDialogOpen(false);
      resetForm();
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.index_number?.[0] || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      index_number: student.index_number,
      full_name: student.full_name,
      program_id: student.program?.id ?? "",
      level_id: student.level ?? "",
      is_active: student.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/exams/admin/students/${deleteDialog.id}/`);
      toast.success("Student deleted successfully");
      setDeleteDialog({ open: false, id: null });
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteDialog.id);
        return next;
      });
      fetchStudents();
    } catch {
      toast.error("Failed to delete student");
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      let idsToDelete;

      if (selectAllMode) {
        // Fetch every matching ID across all pages respecting active filters.
        // Uses the same filter params as the table, with a large page_size
        // so we collect everything. Loops if totalCount > 5000.
        toast.info("Fetching all matching student IDs…");
        const params = buildFilterParams();
        params.set("page_size", "5000");

        let allIds = [];
        let currentPage = 1;
        let hasMore = true;

        while (hasMore) {
          params.set("page", String(currentPage));
          const res = await api.get(`/exams/admin/students/?${params}`);
          const results = res.data?.results ?? (Array.isArray(res.data) ? res.data : []);
          allIds = allIds.concat(results.map((s) => s.id));
          hasMore = Boolean(res.data?.next) && results.length > 0;
          currentPage++;
        }

        idsToDelete = allIds;
      } else {
        idsToDelete = [...selectedIds];
      }

      if (idsToDelete.length === 0) {
        toast.error("No students to delete");
        return;
      }

      await api.post("/exams/students/bulk-delete/", { student_ids: idsToDelete });
      toast.success(`Successfully deleted ${idsToDelete.length.toLocaleString()} student(s)`);
      setBulkDeleteDialog(false);
      clearSelection();
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete students");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s))
    );
    try {
      await api.post(`/exams/admin/students/${id}/toggle_active/`);
      toast.success(`Student ${!currentStatus ? "activated" : "deactivated"} successfully`);
    } catch {
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_active: currentStatus } : s))
      );
      toast.error("Failed to update status");
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingStudent(null);
  };

  // ── export ────────────────────────────────────────────────────────────────────

  const handleExport = async (extension) => {
    try {
      const format = extension.replace(".", "");
      const params = buildFilterParams();
      params.set("export", format);
      const res = await api.get(`/exams/admin/students/?${params}`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `students${extension}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch {
      toast.error("Export failed");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await api.get("/exams/students/template/", { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "students_import_template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Template downloaded");
    } catch {
      toast.error("Failed to download template");
    }
  };

  // ── import ────────────────────────────────────────────────────────────────────

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (!validTypes.includes(file.type) && !file.name.endsWith(".csv")) {
      toast.error("Please upload a valid Excel (.xlsx) or CSV file");
      return;
    }
    setImportFile(file);
    setImportDialog(true);
  };

  const handleImportSubmit = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const fd = new FormData();
      fd.append("file", importFile);
      const res = await api.post("/exams/students/import/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImportResult(res.data);
      if (res.data.errors === 0) {
        toast.success(`Import done — Created: ${res.data.created}, Updated: ${res.data.updated}`);
        setTimeout(() => {
          setImportDialog(false);
          setImportFile(null);
          setImportResult(null);
          fetchStudents();
        }, 2500);
      } else {
        toast.warning(`Import completed with ${res.data.errors} errors`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  // ── pagination helpers ────────────────────────────────────────────────────────

  const totalPages  = Math.max(1, Math.ceil(totalCount / pageSize));
  const showingFrom = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo   = Math.min(page * pageSize, totalCount);

  const pagePills = (() => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    const end   = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  })();

  // ─────────────────────────────────────────────────────────────────────────────

  if (supportLoading) return <DashboardSkeleton showStats={false} />;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">Manage student records and enrollments</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-1.5 h-4 w-4" />
                Export
                <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport(".csv")}>
                <FileText className="mr-2 h-4 w-4" /> CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport(".xlsx")}>
                <FileText className="mr-2 h-4 w-4" /> Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport(".pdf")}>
                <FileText className="mr-2 h-4 w-4" /> PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileSelect} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="mr-1.5 h-4 w-4" />
                Import
                <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Upload file
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" /> Download template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or index..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={filterProgram} onValueChange={setFilterProgram}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Programs" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            {programs.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterLevel} onValueChange={setFilterLevel}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Levels" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {levels.map((l) => (
              <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
          <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((s) => (
              <SelectItem key={s} value={String(s)}>{s} / page</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {logicalSelectionCount > 0 && (
          <Button variant="destructive" size="sm" onClick={() => setBulkDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete ({logicalSelectionCount.toLocaleString()})
          </Button>
        )}
      </div>

      {/* ── "Select all across pages" offer banner ── */}
      {showSelectAllBanner && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-primary/5 border border-primary/20 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 text-primary shrink-0" />
            All <strong className="text-foreground">{selectedIds.size}</strong> students on this page are selected.
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 border-primary/40 text-primary hover:bg-primary/10"
            onClick={() => setSelectAllMode(true)}
          >
            Select all <strong className="ml-1">{totalCount.toLocaleString()}</strong> students
          </Button>
        </div>
      )}

      {/* ── "All N selected" confirmation banner ── */}
      {selectAllMode && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-primary/5 border border-primary/20 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary shrink-0" />
            All <strong>{totalCount.toLocaleString()}</strong> students matching the current filters are selected.
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            onClick={clearSelection}
          >
            Clear selection
          </Button>
        </div>
      )}

      {/* ── Table ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base">
            <span>
              {fetching ? "Loading…" : `${showingFrom}–${showingTo} of ${totalCount} students`}
            </span>
            {logicalSelectionCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                {logicalSelectionCount.toLocaleString()} selected
                <button className="ml-2 underline text-xs" onClick={clearSelection}>Clear</button>
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 pl-4">
                  <Checkbox
                    checked={selectAllMode || allOnPageChecked}
                    ref={(el) => { if (el) el.indeterminate = someOnPageChecked; }}
                    onCheckedChange={handleHeaderCheckbox}
                    aria-label="Select all on this page"
                  />
                </TableHead>
                <TableHead>Index Number</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {fetching ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => {
                  const checked = isRowChecked(student.id);
                  return (
                    <TableRow
                      key={student.id}
                      data-state={checked ? "selected" : undefined}
                      className={checked ? "bg-muted/40" : undefined}
                    >
                      <TableCell className="pl-4">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(c) => handleRowCheckbox(student.id, c)}
                          aria-label={`Select ${student.full_name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium font-mono text-sm">{student.index_number}</TableCell>
                      <TableCell>{student.full_name}</TableCell>
                      <TableCell>{student.program?.name ?? "—"}</TableCell>
                      <TableCell>{student.level_name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge className={student.is_active ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}>
                          {student.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleToggleActive(student.id, student.is_active)} title={student.is_active ? "Deactivate" : "Activate"}>
                            {student.is_active ? <UserX className="h-4 w-4 text-red-500" /> : <UserCheck className="h-4 w-4 text-green-500" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(student)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, id: student.id })}>
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

      {/* ── Pagination ── */}
      {!fetching && totalCount > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} &middot; {totalCount} total students
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(1)} title="First page"><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} title="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
            {pagePills.map((n) => (
              <Button key={n} variant={n === page ? "default" : "outline"} size="icon" className="w-8 h-8 text-xs" onClick={() => setPage(n)}>{n}</Button>
            ))}
            <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} title="Next page"><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage(totalPages)} title="Last page"><ChevronsRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
            <DialogDescription>{editingStudent ? "Update student information" : "Create a new student record"}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="index_number">Index Number</Label>
              <Input id="index_number" value={formData.index_number} onChange={(e) => setFormData({ ...formData, index_number: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Program</Label>
              <Select value={String(formData.program_id || "")} onValueChange={(v) => setFormData({ ...formData, program_id: parseInt(v) })}>
                <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                <SelectContent>
                  {programs.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Level</Label>
              <Select value={String(formData.level_id || "")} onValueChange={(v) => setFormData({ ...formData, level_id: parseInt(v) })}>
                <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>
                  {levels.map((l) => <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : editingStudent ? "Update Student" : "Create Student"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete single ── */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the student record and cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Bulk delete ── */}
      <AlertDialog open={bulkDeleteDialog} onOpenChange={setBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {logicalSelectionCount.toLocaleString()} student{logicalSelectionCount !== 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>This action cannot be undone. All selected student records will be permanently removed.</p>
                {selectAllMode && (
                  <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                    <span>⚠</span>
                    <span>
                      You are about to delete <strong>all {totalCount.toLocaleString()} students</strong> matching the current filters. This cannot be reversed.
                    </span>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkDeleting ? "Deleting…" : `Delete ${logicalSelectionCount.toLocaleString()} student${logicalSelectionCount !== 1 ? "s" : ""}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Import ── */}
      <Dialog open={importDialog} onOpenChange={setImportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Students</DialogTitle>
            <DialogDescription>Upload an Excel or CSV file to import student records</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {importFile && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Selected file:</p>
                <p className="text-sm text-muted-foreground">{importFile.name}</p>
              </div>
            )}
            {importResult && (
              <div className={`p-4 rounded-lg border ${importResult.errors === 0 ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
                <p className="font-semibold mb-2">Import Results:</p>
                <ul className="text-sm space-y-1">
                  <li>✓ Created: {importResult.created}</li>
                  <li>✓ Updated: {importResult.updated}</li>
                  {importResult.errors > 0 && <li className="text-red-600">✗ Errors: {importResult.errors}</li>}
                </ul>
                {importResult.error_details?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-1">Error Details:</p>
                    <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                      {importResult.error_details.map((err, i) => <li key={i} className="text-red-600">{err}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { setImportDialog(false); setImportFile(null); setImportResult(null); }}>Cancel</Button>
            <Button onClick={handleImportSubmit} disabled={importing || !importFile}>{importing ? "Importing…" : "Import"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}