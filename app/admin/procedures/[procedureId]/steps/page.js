// // "use client";

// // import { useEffect, useState } from "react";
// // import { useParams, useRouter } from "next/navigation";
// // import { api } from "@/lib/api";
// // import DashboardSkeleton from "@/components/DashboardSkeleton";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Textarea } from "@/components/ui/textarea";
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogDescription,
// //   DialogFooter,
// //   DialogHeader,
// //   DialogTitle,
// // } from "@/components/ui/dialog";
// // import {
// //   AlertDialog,
// //   AlertDialogAction,
// //   AlertDialogCancel,
// //   AlertDialogContent,
// //   AlertDialogDescription,
// //   AlertDialogFooter,
// //   AlertDialogHeader,
// //   AlertDialogTitle,
// // } from "@/components/ui/alert-dialog";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import {
// //   Plus,
// //   Pencil,
// //   Trash2,
// //   ArrowLeft,
// //   ArrowUp,
// //   ArrowDown,
// // } from "lucide-react";
// // import { toast } from "sonner";

// // export default function ProcedureStepsPage() {
// //   const { procedureId } = useParams();
// //   const router = useRouter();
// //   const [procedure, setProcedure] = useState(null);
// //   const [steps, setSteps] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [dialogOpen, setDialogOpen] = useState(false);
// //   const [editingStep, setEditingStep] = useState(null);
// //   const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
// //   const [formData, setFormData] = useState({
// //     description: "",
// //     step_order: "",
// //   });
// //   const [submitting, setSubmitting] = useState(false);

// //   useEffect(() => {
// //     fetchData();
// //   }, [procedureId]);

// //   const fetchData = async () => {
// //     try {
// //       const [procedureRes, stepsRes] = await Promise.all([
// //         api.get(`/exams/admin/procedures/${procedureId}/`),
// //         api.get(`/exams/admin/procedure-steps/?procedure_id=${procedureId}`),
// //       ]);
// //       setProcedure(procedureRes.data);
// //       setSteps(stepsRes.data.sort((a, b) => a.step_order - b.step_order));
// //       setLoading(false);
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Failed to load data");
// //       setLoading(false);
// //     }
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setSubmitting(true);

// //     const stepData = {
// //       ...formData,
// //       procedure_id: parseInt(procedureId),
// //     };

// //     try {
// //       if (editingStep) {
// //         await api.patch(
// //           `/exams/admin/procedure-steps/${editingStep.id}/`,
// //           stepData
// //         );
// //         toast.success("Step updated successfully");
// //       } else {
// //         await api.post("/exams/admin/procedure-steps/", stepData);
// //         toast.success("Step created successfully");
// //       }
// //       setDialogOpen(false);
// //       resetForm();
// //       fetchData();
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Operation failed");
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   const handleEdit = (step) => {
// //     setEditingStep(step);
// //     setFormData({
// //       description: step.description,
// //       step_order: step.step_order,
// //     });
// //     setDialogOpen(true);
// //   };

// //   const handleDelete = async () => {
// //     try {
// //       await api.delete(`/exams/admin/procedure-steps/${deleteDialog.id}/`);
// //       toast.success("Step deleted successfully");
// //       setDeleteDialog({ open: false, id: null });
// //       fetchData();
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Failed to delete step");
// //     }
// //   };

// //   const handleReorder = async (stepId, direction) => {
// //     const currentIndex = steps.findIndex((s) => s.id === stepId);
// //     if (
// //       (direction === "up" && currentIndex === 0) ||
// //       (direction === "down" && currentIndex === steps.length - 1)
// //     ) {
// //       return;
// //     }

// //     const newSteps = [...steps];
// //     const targetIndex =
// //       direction === "up" ? currentIndex - 1 : currentIndex + 1;
// //     [newSteps[currentIndex], newSteps[targetIndex]] = [
// //       newSteps[targetIndex],
// //       newSteps[currentIndex],
// //     ];

// //     // Update step orders
// //     try {
// //       await Promise.all(
// //         newSteps.map((step, index) =>
// //           api.patch(`/exams/admin/procedure-steps/${step.id}/`, {
// //             step_order: index + 1,
// //             description: step.description,
// //             procedure_id: parseInt(procedureId),
// //           })
// //         )
// //       );
// //       toast.success("Order updated successfully");
// //       fetchData();
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Failed to update order");
// //     }
// //   };

// //   const resetForm = () => {
// //     setFormData({
// //       description: "",
// //       step_order: steps.length + 1,
// //     });
// //     setEditingStep(null);
// //   };

// //   const openAddDialog = () => {
// //     resetForm();
// //     setFormData({
// //       ...formData,
// //       step_order: steps.length + 1,
// //     });
// //     setDialogOpen(true);
// //   };

// //   if (loading) {
// //     return <DashboardSkeleton showStats={false} showFilters={false} />;
// //   }

// //   if (!procedure) {
// //     return <div className="p-6">Procedure not found</div>;
// //   }

// //   return (
// //     <div className="space-y-6">
// //       {/* Header */}
// //       <div className="flex flex-col md:flex-row items-center gap-4">
// //         <div className="flex items-center justify-between w-full md:w-auto">
// //           <Button
// //             variant="ghost"
// //             size="sm"
// //             onClick={() => router.push("/admin/procedures")}
// //           >
// //             <ArrowLeft className="h-4 w-4 mr-2" />
// //             Back
// //           </Button>

// //           <Button onClick={openAddDialog} className="md:hidden">
// //             <Plus className="mr-2 h-4 w-4" />
// //             Add Step
// //           </Button>
// //         </div>

// //         <div className="flex-1">
// //           <h2 className="text-2xl font-bold tracking-tight">
// //             {procedure.name} - Steps
// //           </h2>
// //           <p className="text-muted-foreground">
// //             Program: {procedure.program} | Total Score: {procedure.total_score}
// //           </p>
// //         </div>
// //         <Button onClick={openAddDialog} className="hidden md:inline-flex">
// //           <Plus className="mr-2 h-4 w-4" />
// //           Add Step
// //         </Button>
// //       </div>

// //       {/* Steps Table */}
// //       <Card>
// //         <CardHeader>
// //           <CardTitle>Procedure Steps ({steps.length})</CardTitle>
// //         </CardHeader>
// //         <CardContent>
// //           {steps.length === 0 ? (
// //             <div className="text-center py-12">
// //               <p className="text-muted-foreground mb-4">No steps added yet</p>
// //               <Button onClick={openAddDialog}>
// //                 <Plus className="mr-2 h-4 w-4" />
// //                 Add First Step
// //               </Button>
// //             </div>
// //           ) : (
// //             <Table>
// //               <TableHeader>
// //                 <TableRow>
// //                   <TableHead className="w-20">Order</TableHead>
// //                   <TableHead className="min-w-[12rem] max-w-xs truncate lg:truncate">
// //                     Description
// //                   </TableHead>
// //                   <TableHead className="w-32 text-center">Reorder</TableHead>
// //                   <TableHead className="w-32 text-right">Actions</TableHead>
// //                 </TableRow>
// //               </TableHeader>
// //               <TableBody>
// //                 {steps.map((step, index) => (
// //                   <TableRow key={step.id}>
// //                     <TableCell className="font-medium">
// //                       {step.step_order}
// //                     </TableCell>
// //                     <TableCell
// //                       className="font-medium min-w-[12rem] max-w-xs truncate lg:truncate cursor-pointer"
// //                       title={step.description}
// //                     >
// //                       {step.description}
// //                     </TableCell>
// //                     <TableCell>
// //                       <div className="flex items-center justify-center gap-1">
// //                         <Button
// //                           variant="ghost"
// //                           size="sm"
// //                           onClick={() => handleReorder(step.id, "up")}
// //                           disabled={index === 0}
// //                         >
// //                           <ArrowUp className="h-4 w-4" />
// //                         </Button>
// //                         <Button
// //                           variant="ghost"
// //                           size="sm"
// //                           onClick={() => handleReorder(step.id, "down")}
// //                           disabled={index === steps.length - 1}
// //                         >
// //                           <ArrowDown className="h-4 w-4" />
// //                         </Button>
// //                       </div>
// //                     </TableCell>
// //                     <TableCell className="text-right">
// //                       <div className="flex items-center justify-end gap-2">
// //                         <Button
// //                           variant="ghost"
// //                           size="sm"
// //                           onClick={() => handleEdit(step)}
// //                         >
// //                           <Pencil className="h-4 w-4" />
// //                         </Button>
// //                         <Button
// //                           variant="ghost"
// //                           size="sm"
// //                           onClick={() =>
// //                             setDeleteDialog({ open: true, id: step.id })
// //                           }
// //                         >
// //                           <Trash2 className="h-4 w-4 text-destructive" />
// //                         </Button>
// //                       </div>
// //                     </TableCell>
// //                   </TableRow>
// //                 ))}
// //               </TableBody>
// //             </Table>
// //           )}
// //         </CardContent>
// //       </Card>

// //       {/* Add/Edit Dialog */}
// //       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
// //         <DialogContent className="sm:max-w-lg">
// //           <DialogHeader>
// //             <DialogTitle>
// //               {editingStep ? "Edit Step" : "Add New Step"}
// //             </DialogTitle>
// //             <DialogDescription>
// //               {editingStep
// //                 ? "Update step information"
// //                 : "Create a new procedure step"}
// //             </DialogDescription>
// //           </DialogHeader>
// //           <form onSubmit={handleSubmit} className="space-y-4">
// //             <div className="space-y-2">
// //               <Label htmlFor="step_order">Step Order</Label>
// //               <Input
// //                 id="step_order"
// //                 type="number"
// //                 value={formData.step_order}
// //                 onChange={(e) =>
// //                   setFormData({ ...formData, step_order: e.target.value })
// //                 }
// //                 required
// //               />
// //             </div>

// //             <div className="space-y-2">
// //               <Label htmlFor="description">Description</Label>
// //               <Textarea
// //                 id="description"
// //                 rows={4}
// //                 value={formData.description}
// //                 onChange={(e) =>
// //                   setFormData({ ...formData, description: e.target.value })
// //                 }
// //                 required
// //               />
// //             </div>

// //             <DialogFooter>
// //               <Button
// //                 type="button"
// //                 variant="outline"
// //                 onClick={() => {
// //                   setDialogOpen(false);
// //                   resetForm();
// //                 }}
// //               >
// //                 Cancel
// //               </Button>
// //               <Button type="submit" disabled={submitting}>
// //                 {submitting
// //                   ? "Saving..."
// //                   : editingStep
// //                   ? "Update Step"
// //                   : "Create Step"}
// //               </Button>
// //             </DialogFooter>
// //           </form>
// //         </DialogContent>
// //       </Dialog>

// //       {/* Delete Dialog */}
// //       <AlertDialog
// //         open={deleteDialog.open}
// //         onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
// //       >
// //         <AlertDialogContent>
// //           <AlertDialogHeader>
// //             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
// //             <AlertDialogDescription>
// //               This will permanently delete the step. This action cannot be
// //               undone.
// //             </AlertDialogDescription>
// //           </AlertDialogHeader>
// //           <AlertDialogFooter>
// //             <AlertDialogCancel>Cancel</AlertDialogCancel>
// //             <AlertDialogAction
// //               onClick={handleDelete}
// //               className="bg-destructive"
// //             >
// //               Delete
// //             </AlertDialogAction>
// //           </AlertDialogFooter>
// //         </AlertDialogContent>
// //       </AlertDialog>
// //     </div>
// //   );
// // }



// "use client";

// import { useEffect, useState, useRef } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { api } from "@/lib/api";
// import DashboardSkeleton from "@/components/DashboardSkeleton";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
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
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Plus,
//   Pencil,
//   Trash2,
//   ArrowLeft,
//   ArrowUp,
//   ArrowDown,
//   Upload,
//   Download,
// } from "lucide-react";
// import { toast } from "sonner";

// export default function ProcedureStepsPage() {
//   const { procedureId } = useParams();
//   const router = useRouter();
//   const fileInputRef = useRef(null);
//   const [procedure, setProcedure] = useState(null);
//   const [steps, setSteps] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editingStep, setEditingStep] = useState(null);
//   const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
//   const [importDialog, setImportDialog] = useState(false);
//   const [importing, setImporting] = useState(false);
//   const [formData, setFormData] = useState({
//     description: "",
//     step_order: "",
//   });
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     fetchData();
//   }, [procedureId]);

//   const fetchData = async () => {
//     try {
//       const [procedureRes, stepsRes] = await Promise.all([
//         api.get(`/exams/admin/procedures/${procedureId}/`),
//         api.get(`/exams/admin/procedure-steps/?procedure_id=${procedureId}`),
//       ]);
//       setProcedure(procedureRes.data);
//       setSteps(stepsRes.data.sort((a, b) => a.step_order - b.step_order));
//       setLoading(false);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load data");
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);

//     const stepData = {
//       ...formData,
//       procedure_id: parseInt(procedureId),
//     };

//     try {
//       if (editingStep) {
//         await api.patch(
//           `/exams/admin/procedure-steps/${editingStep.id}/`,
//           stepData
//         );
//         toast.success("Step updated successfully");
//       } else {
//         await api.post("/exams/admin/procedure-steps/", stepData);
//         toast.success("Step created successfully");
//       }
//       setDialogOpen(false);
//       resetForm();
//       fetchData();
//     } catch (err) {
//       console.error(err);
//       toast.error("Operation failed");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleEdit = (step) => {
//     setEditingStep(step);
//     setFormData({
//       description: step.description,
//       step_order: step.step_order,
//     });
//     setDialogOpen(true);
//   };

//   const handleDelete = async () => {
//     try {
//       await api.delete(`/exams/admin/procedure-steps/${deleteDialog.id}/`);
//       toast.success("Step deleted successfully");
//       setDeleteDialog({ open: false, id: null });
//       fetchData();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete step");
//     }
//   };

//   const handleReorder = async (stepId, direction) => {
//     const currentIndex = steps.findIndex((s) => s.id === stepId);
//     if (
//       (direction === "up" && currentIndex === 0) ||
//       (direction === "down" && currentIndex === steps.length - 1)
//     ) {
//       return;
//     }

//     const newSteps = [...steps];
//     const targetIndex =
//       direction === "up" ? currentIndex - 1 : currentIndex + 1;
//     [newSteps[currentIndex], newSteps[targetIndex]] = [
//       newSteps[targetIndex],
//       newSteps[currentIndex],
//     ];

//     // Update step orders
//     try {
//       await Promise.all(
//         newSteps.map((step, index) =>
//           api.patch(`/exams/admin/procedure-steps/${step.id}/`, {
//             step_order: index + 1,
//             description: step.description,
//             procedure_id: parseInt(procedureId),
//           })
//         )
//       );
//       toast.success("Order updated successfully");
//       fetchData();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to update order");
//     }
//   };

//   const handleDownloadTemplate = async () => {
//     try {
//       const response = await api.get(
//         `/exams/procedures/${procedureId}/steps/template/`,
//         {
//           responseType: "blob",
//         }
//       );

//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", `${procedure.name}_steps_template.xlsx`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();

//       toast.success("Template downloaded successfully");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to download template");
//     }
//   };

//   const handleFileSelect = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("file", file);

//     setImporting(true);

//     try {
//       const response = await api.post(
//         `/exams/procedures/${procedureId}/steps/import/`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       const { created, updated, errors, error_details } = response.data;

//       let message = `Import completed: ${created} created, ${updated} updated`;
//       if (errors > 0) {
//         message += `, ${errors} errors`;
//         console.error("Import errors:", error_details);
//         toast.warning(message, {
//           description: error_details?.slice(0, 3).join("\n"),
//         });
//       } else {
//         toast.success(message);
//       }

//       setImportDialog(false);
//       fetchData();
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.data?.error || "Import failed");
//     } finally {
//       setImporting(false);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       description: "",
//       step_order: steps.length + 1,
//     });
//     setEditingStep(null);
//   };

//   const openAddDialog = () => {
//     resetForm();
//     setFormData({
//       ...formData,
//       step_order: steps.length + 1,
//     });
//     setDialogOpen(true);
//   };

//   if (loading) {
//     return <DashboardSkeleton showStats={false} showFilters={false} />;
//   }

//   if (!procedure) {
//     return <div className="p-6">Procedure not found</div>;
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row items-center gap-4">
//         <div className="flex items-center justify-between w-full md:w-auto">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => router.push("/admin/procedures")}
//           >
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back
//           </Button>

//           <div className="flex gap-2 md:hidden">
//             <Button variant="outline" onClick={() => setImportDialog(true)}>
//               <Upload className="h-4 w-4 mr-2" />
//               Import
//             </Button>
//             <Button onClick={openAddDialog}>
//               <Plus className="h-4 w-4 mr-2" />
//               Add
//             </Button>
//           </div>
//         </div>

//         <div className="flex-1">
//           <h2 className="text-2xl font-bold tracking-tight">
//             {procedure.name} - Steps
//           </h2>
//           <p className="text-muted-foreground">
//             Program: {procedure.program} | Total Score: {procedure.total_score}
//           </p>
//         </div>

//         <div className="hidden md:flex gap-2">
//           <Button variant="outline" onClick={() => setImportDialog(true)}>
//             <Upload className="mr-2 h-4 w-4" />
//             Import Steps
//           </Button>
//           <Button onClick={openAddDialog}>
//             <Plus className="mr-2 h-4 w-4" />
//             Add Step
//           </Button>
//         </div>
//       </div>

//       {/* Steps Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Procedure Steps ({steps.length})</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {steps.length === 0 ? (
//             <div className="text-center py-12">
//               <p className="text-muted-foreground mb-4">No steps added yet</p>
//               <div className="flex gap-2 justify-center">
//                 <Button variant="outline" onClick={() => setImportDialog(true)}>
//                   <Upload className="mr-2 h-4 w-4" />
//                   Import Steps
//                 </Button>
//                 <Button onClick={openAddDialog}>
//                   <Plus className="mr-2 h-4 w-4" />
//                   Add First Step
//                 </Button>
//               </div>
//             </div>
//           ) : (
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="w-20">Order</TableHead>
//                   <TableHead className="min-w-[12rem] max-w-xs truncate lg:truncate">
//                     Description
//                   </TableHead>
//                   <TableHead className="w-32 text-center">Reorder</TableHead>
//                   <TableHead className="w-32 text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {steps.map((step, index) => (
//                   <TableRow key={step.id}>
//                     <TableCell className="font-medium">
//                       {step.step_order}
//                     </TableCell>
//                     <TableCell
//                       className="font-medium min-w-[12rem] max-w-xs truncate lg:truncate cursor-pointer"
//                       title={step.description}
//                     >
//                       {step.description}
//                     </TableCell>
//                     <TableCell>
//                       <div className="flex items-center justify-center gap-1">
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => handleReorder(step.id, "up")}
//                           disabled={index === 0}
//                         >
//                           <ArrowUp className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => handleReorder(step.id, "down")}
//                           disabled={index === steps.length - 1}
//                         >
//                           <ArrowDown className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex items-center justify-end gap-2">
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => handleEdit(step)}
//                         >
//                           <Pencil className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() =>
//                             setDeleteDialog({ open: true, id: step.id })
//                           }
//                         >
//                           <Trash2 className="h-4 w-4 text-destructive" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           )}
//         </CardContent>
//       </Card>

//       {/* Import Dialog */}
//       <Dialog open={importDialog} onOpenChange={setImportDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Import Procedure Steps</DialogTitle>
//             <DialogDescription>
//               Upload an Excel or CSV file containing procedure steps
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4">
//             <div className="border-2 border-dashed rounded-lg p-6 text-center">
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept=".csv,.xlsx,.xls"
//                 onChange={handleFileSelect}
//                 className="hidden"
//                 disabled={importing}
//               />
//               <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
//               <p className="text-sm text-muted-foreground mb-4">
//                 Select a CSV or Excel file to import
//               </p>
//               <Button
//                 onClick={() => fileInputRef.current?.click()}
//                 disabled={importing}
//               >
//                 {importing ? "Importing..." : "Choose File"}
//               </Button>
//             </div>

//             <div className="flex items-center gap-2">
//               <Button
//                 variant="outline"
//                 onClick={handleDownloadTemplate}
//                 className="flex-1"
//               >
//                 <Download className="mr-2 h-4 w-4" />
//                 Download Template
//               </Button>
//             </div>

//             <div className="text-sm text-muted-foreground space-y-1">
//               <p className="font-medium">File Requirements:</p>
//               <ul className="list-disc list-inside space-y-1">
//                 <li>Format: Excel (.xlsx) or CSV (.csv)</li>
//                 <li>Required columns: Step Order, Description</li>
//                 <li>Existing steps will be updated</li>
//                 <li>New steps will be created</li>
//               </ul>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Add/Edit Dialog */}
//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent className="sm:max-w-lg">
//           <DialogHeader>
//             <DialogTitle>
//               {editingStep ? "Edit Step" : "Add New Step"}
//             </DialogTitle>
//             <DialogDescription>
//               {editingStep
//                 ? "Update step information"
//                 : "Create a new procedure step"}
//             </DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="step_order">Step Order</Label>
//               <Input
//                 id="step_order"
//                 type="number"
//                 value={formData.step_order}
//                 onChange={(e) =>
//                   setFormData({ ...formData, step_order: e.target.value })
//                 }
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="description">Description</Label>
//               <Textarea
//                 id="description"
//                 rows={4}
//                 value={formData.description}
//                 onChange={(e) =>
//                   setFormData({ ...formData, description: e.target.value })
//                 }
//                 required
//               />
//             </div>

//             <DialogFooter>
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => {
//                   setDialogOpen(false);
//                   resetForm();
//                 }}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={submitting}>
//                 {submitting
//                   ? "Saving..."
//                   : editingStep
//                   ? "Update Step"
//                   : "Create Step"}
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Dialog */}
//       <AlertDialog
//         open={deleteDialog.open}
//         onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This will permanently delete the step. This action cannot be
//               undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleDelete}
//               className="bg-destructive"
//             >
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }








"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus, Pencil, Trash2, ArrowLeft, ArrowUp, ArrowDown, Upload, Download,
} from "lucide-react";
import { toast } from "sonner";

export default function ProcedureStepsPage() {
  const { procedureId } = useParams();
  const router          = useRouter();
  const fileInputRef    = useRef(null);

  const [procedure, setProcedure]   = useState(null);
  const [steps, setSteps]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [reordering, setReordering] = useState(false);

  const [dialogOpen, setDialogOpen]     = useState(false);
  const [editingStep, setEditingStep]   = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [importDialog, setImportDialog] = useState(false);
  const [importing, setImporting]       = useState(false);

  const [formData, setFormData]     = useState({ description: "", step_order: "" });
  const [submitting, setSubmitting] = useState(false);

  // ── data fetching ─────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      const [procRes, stepsRes] = await Promise.all([
        api.get(`/exams/admin/procedures/${procedureId}/`),
        api.get(`/exams/admin/procedure-steps/?procedure_id=${procedureId}`),
      ]);
      setProcedure(procRes.data);
      const arr = Array.isArray(stepsRes.data)
        ? stepsRes.data
        : (stepsRes.data?.results ?? []);
      setSteps([...arr].sort((a, b) => a.step_order - b.step_order));
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [procedureId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── form helpers ─────────────────────────────────────────────────────────────

  const resetForm = (len = 0) => {
    setFormData({ description: "", step_order: len + 1 });
    setEditingStep(null);
  };

  const openAddDialog = () => {
    resetForm(steps.length);
    setDialogOpen(true);
  };

  // ── CRUD ─────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      description: formData.description,
      step_order:  parseInt(formData.step_order),
      procedure_id: parseInt(procedureId),
    };
    try {
      if (editingStep) {
        await api.patch(`/exams/admin/procedure-steps/${editingStep.id}/`, payload);
        toast.success("Step updated");
      } else {
        await api.post("/exams/admin/procedure-steps/", payload);
        toast.success("Step created");
      }
      setDialogOpen(false);
      resetForm(steps.length);
      fetchData();
    } catch {
      toast.error("Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (step) => {
    setEditingStep(step);
    setFormData({ description: step.description, step_order: step.step_order });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/exams/admin/procedure-steps/${deleteDialog.id}/`);
      toast.success("Step deleted");
      setDeleteDialog({ open: false, id: null });
      fetchData();
    } catch {
      toast.error("Failed to delete step");
    }
  };

  // ── reorder with optimistic UI ────────────────────────────────────────────────

  const handleReorder = async (stepId, direction) => {
    const idx = steps.findIndex((s) => s.id === stepId);
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === steps.length - 1)) return;

    const swapped = [...steps];
    const target  = direction === "up" ? idx - 1 : idx + 1;
    [swapped[idx], swapped[target]] = [swapped[target], swapped[idx]];
    const reordered = swapped.map((s, i) => ({ ...s, step_order: i + 1 }));

    // Optimistic update
    setSteps(reordered);
    setReordering(true);

    try {
      await Promise.all(
        reordered.map((s) =>
          api.patch(`/exams/admin/procedure-steps/${s.id}/`, {
            step_order:   s.step_order,
            description:  s.description,
            procedure_id: parseInt(procedureId),
          }),
        ),
      );
      toast.success("Order updated");
    } catch {
      toast.error("Failed to update order");
      fetchData(); // revert
    } finally {
      setReordering(false);
    }
  };

  // ── import / template ─────────────────────────────────────────────────────────

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    setImporting(true);

    try {
      const res = await api.post(
        `/exams/procedures/${procedureId}/steps/import/`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      const { created, updated, errors, error_details } = res.data;
      const msg = `Import completed: ${created} created, ${updated} updated${errors > 0 ? `, ${errors} errors` : ""}`;
      errors > 0
        ? toast.warning(msg, { description: error_details?.slice(0, 3).join("\n") })
        : toast.success(msg);
      setImportDialog(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Import failed");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await api.get(`/exams/procedures/${procedureId}/steps/template/`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement("a");
      a.href     = url;
      a.download = `${procedure?.name ?? "procedure"}_steps_template.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Template downloaded");
    } catch {
      toast.error("Failed to download template");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  if (loading)     return <DashboardSkeleton showStats={false} showFilters={false} />;
  if (!procedure)  return <div className="p-6 text-muted-foreground">Procedure not found</div>;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/procedures")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Procedures
          </Button>
          {/* Mobile buttons */}
          <div className="flex gap-2 md:hidden">
            <Button variant="outline" size="icon" onClick={() => setImportDialog(true)}>
              <Upload className="h-4 w-4" />
            </Button>
            <Button size="icon" onClick={openAddDialog}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-bold tracking-tight">{procedure.name}</h2>
            <Badge variant="outline">{procedure.program}</Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            Total Score: <strong>{procedure.total_score}</strong>
            {" "}&middot;{" "}
            {steps.length} step{steps.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Desktop buttons */}
        <div className="hidden md:flex gap-2 shrink-0">
          <Button variant="outline" onClick={() => setImportDialog(true)}>
            <Upload className="mr-2 h-4 w-4" /> Import Steps
          </Button>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Step
          </Button>
        </div>
      </div>

      {/* Steps table */}
      <Card>
        <CardHeader>
          <CardTitle>Procedure Steps ({steps.length})</CardTitle>
        </CardHeader>
        <CardContent className={steps.length === 0 ? undefined : "p-0"}>
          {steps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No steps added yet</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setImportDialog(true)}>
                  <Upload className="mr-2 h-4 w-4" /> Import Steps
                </Button>
                <Button onClick={openAddDialog}>
                  <Plus className="mr-2 h-4 w-4" /> Add First Step
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 pl-4">#</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-28 text-center">Reorder</TableHead>
                  <TableHead className="w-24 text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {steps.map((step, index) => (
                  <TableRow key={step.id} className={reordering ? "opacity-60 pointer-events-none" : undefined}>
                    <TableCell className="pl-4 font-mono text-sm text-muted-foreground">
                      {step.step_order}
                    </TableCell>
                    <TableCell className="py-3 pr-4">
                      <p className="text-sm leading-relaxed">{step.description}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => handleReorder(step.id, "up")}
                          disabled={index === 0 || reordering}
                          title="Move up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => handleReorder(step.id, "down")}
                          disabled={index === steps.length - 1 || reordering}
                          title="Move down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(step)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => setDeleteDialog({ open: true, id: step.id })}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={importDialog} onOpenChange={setImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Procedure Steps</DialogTitle>
            <DialogDescription>Upload an Excel or CSV file containing procedure steps</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                disabled={importing}
              />
              <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">Select a CSV or Excel file to import</p>
              <Button onClick={() => fileInputRef.current?.click()} disabled={importing}>
                {importing ? "Importing…" : "Choose File"}
              </Button>
            </div>
            <Button variant="outline" onClick={handleDownloadTemplate} className="w-full">
              <Download className="mr-2 h-4 w-4" /> Download Template
            </Button>
            <div className="text-xs text-muted-foreground space-y-0.5 px-1">
              <p className="font-medium text-sm">File requirements:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Format: Excel (.xlsx) or CSV (.csv)</li>
                <li>Required columns: Step Order, Description</li>
                <li>Existing steps (same order) will be updated</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingStep ? "Edit Step" : "Add New Step"}</DialogTitle>
            <DialogDescription>
              {editingStep ? "Update step information" : "Create a new procedure step"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="step_order">Step Order</Label>
              <Input
                id="step_order"
                type="number"
                min={1}
                value={formData.step_order}
                onChange={(e) => setFormData({ ...formData, step_order: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what the student must do in this step…"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(steps.length); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving…" : editingStep ? "Update Step" : "Create Step"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the step. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}