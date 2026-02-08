"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Search, UserCheck, UserX, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import DashboardSkeleton from "@/components/DashboardSkeleton";

export default function ExaminersPage() {
  const [examiners, setExaminers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [editMode, setEditMode] = useState(false);
  const [currentExaminerId, setCurrentExaminerId] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    role: "examiner",
  });
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchExaminers();
  }, []);

  const fetchExaminers = async () => {
    try {
      const res = await api.get("/exams/admin/examiners/");
      setExaminers(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load examiners");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editMode) {
        // Update examiner
        const updateData = { ...formData };
        // Only include password if it's been changed
        if (!updateData.password) {
          delete updateData.password;
        }
        await api.patch(`/exams/admin/examiners/${currentExaminerId}/`, updateData);
        toast.success("Examiner updated successfully");
      } else {
        // Create new examiner
        await api.post("/exams/admin/examiners/", formData);
        toast.success("Examiner created successfully");
      }
      setDialogOpen(false);
      resetForm();
      fetchExaminers();
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.password?.[0] || 
        err.response?.data?.username?.[0] ||
        `Failed to ${editMode ? 'update' : 'create'} examiner`;
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (examiner) => {
    setEditMode(true);
    setCurrentExaminerId(examiner.id);
    setFormData({
      username: examiner.username,
      email: examiner.email,
      first_name: examiner.first_name,
      last_name: examiner.last_name,
      password: "", // Leave password empty
      role: "examiner",
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/exams/admin/examiners/${deleteDialog.id}/`);
      toast.success("Examiner deleted successfully");
      setDeleteDialog({ open: false, id: null });
      fetchExaminers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete examiner");
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await api.post(`/exams/admin/examiners/${id}/toggle_active/`);
      toast.success("Status updated successfully");
      fetchExaminers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get("/accounts/examiners/export/", {
        responseType: "blob",
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `examiners_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Examiners exported successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export examiners");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/accounts/examiners/import/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { created, errors } = response.data;
      
      if (created > 0) {
        toast.success(`Successfully imported ${created} examiner(s)`);
        fetchExaminers();
      }
      
      if (errors && errors.length > 0) {
        errors.forEach(error => toast.error(error));
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to import examiners");
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      password: "",
      role: "examiner",
    });
    setEditMode(false);
    setCurrentExaminerId(null);
  };

  const filteredExaminers = examiners.filter(
    (examiner) =>
      examiner.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      examiner.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      examiner.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      examiner.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <DashboardSkeleton showStats={false} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Examiners</h2>
          <p className="text-muted-foreground">
            Manage examiner accounts and permissions
          </p>
        </div>
        <div className="flex gap-2">
          {/* Export Button */}
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          {/* Import Button */}
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
          
          {/* Add Examiner Button */}
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Examiner
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editMode ? "Edit Examiner" : "Add New Examiner"}
                </DialogTitle>
                <DialogDescription>
                  {editMode 
                    ? "Update examiner account details" 
                    : "Create a new examiner account"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    disabled={editMode}
                  />
                  {editMode && (
                    <p className="text-xs text-muted-foreground">
                      Username cannot be changed
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password {editMode && "(leave blank to keep current)"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!editMode}
                    placeholder={editMode ? "Leave blank to keep current" : ""}
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
                  <Button type="submit" disabled={submitting}>
                    {submitting 
                      ? (editMode ? "Updating..." : "Creating...") 
                      : (editMode ? "Update Examiner" : "Create Examiner")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search examiners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Examiners ({filteredExaminers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Joined</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExaminers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No examiners found
                  </TableCell>
                </TableRow>
              ) : (
                filteredExaminers.map((examiner) => (
                  <TableRow key={examiner.id}>
                    <TableCell className="font-medium">
                      {examiner.first_name + " " + examiner.last_name}
                    </TableCell>
                    <TableCell>{examiner.username}</TableCell>
                    <TableCell>{examiner.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={examiner.is_active ? "bg-green-500" : "bg-red-500"}
                      >
                        {examiner.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(examiner.date_joined).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(examiner)}
                          title="Edit examiner"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(examiner.id)}
                          title={examiner.is_active ? "Deactivate" : "Activate"}
                        >
                          {examiner.is_active ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setDeleteDialog({ open: true, id: examiner.id })
                          }
                          title="Delete examiner"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the examiner account. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}