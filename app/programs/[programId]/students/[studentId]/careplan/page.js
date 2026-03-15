// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, useParams } from "next/navigation";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { ArrowLeft, Lock, Save, CheckCircle, User } from "lucide-react";
// import { api } from "@/lib/api";
// import { toast } from "sonner";
// import { Alert, AlertDescription } from "@/components/ui/alert";

// export default function CarePlanPage() {
//   const router = useRouter();
//   const { programId, studentId } = useParams();

//   const [student, setStudent]     = useState(null);
//   const [carePlan, setCarePlan]   = useState(null);
//   const [score, setScore]         = useState("");
//   const [loading, setLoading]     = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     Promise.all([
//       api.get(`/exams/students/${studentId}/`),
//       api.get(`/exams/students/${studentId}/programs/${programId}/care-plan/`),
//     ])
//       .then(([studentRes, carePlanRes]) => {
//         setStudent(studentRes.data);
//         if (carePlanRes.data?.exists !== false) {
//           setCarePlan(carePlanRes.data);
//         }
//       })
//       .catch(() => toast.error("Failed to load data"))
//       .finally(() => setLoading(false));
//   }, [studentId, programId]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const scoreNum = parseInt(score, 10);
//     if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 20) {
//       toast.error("Score must be between 0 and 20");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       await api.post(
//         `/exams/students/${studentId}/programs/${programId}/care-plan/`,
//         { score: scoreNum },
//       );
//       toast.success("Care plan submitted successfully");

//       // Refresh to show locked read-only state
//       const res = await api.get(
//         `/exams/students/${studentId}/programs/${programId}/care-plan/`,
//       );
//       if (res.data?.exists !== false) setCarePlan(res.data);
//     } catch (err) {
//       toast.error(err.response?.data?.error || "Failed to submit care plan");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ── Loading skeleton ──────────────────────────────────────────────────────

//   if (loading) {
//     return (
//       <div className="container mx-auto p-6 space-y-6">
//         <Skeleton className="h-8 w-1/3" />
//         <div className="p-4 border rounded-lg">
//           <div className="flex items-center gap-3">
//             <Skeleton className="h-10 w-10 rounded-full" />
//             <div className="space-y-2 flex-1">
//               <Skeleton className="h-4 w-40" />
//               <Skeleton className="h-3 w-28" />
//             </div>
//           </div>
//         </div>
//         <Skeleton className="h-72 rounded-lg" />
//       </div>
//     );
//   }

//   // ─────────────────────────────────────────────────────────────────────────

//   return (
//     <div className="container mx-auto p-6 space-y-6">
//       {/* Student info banner */}
//       {student && (
//         <div className="p-4 bg-gray-50 rounded-lg border">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-primary/10 rounded-full shrink-0">
//               <User className="h-6 w-6 text-primary" />
//             </div>
//             <div className="min-w-0">
//               <h2 className="text-lg font-bold truncate">{student.full_name}</h2>
//               <p className="text-sm text-muted-foreground">
//                 Index: {student.index_number}
//               </p>
//               {student.program?.name && (
//                 <p className="text-sm text-muted-foreground">
//                   Program: {student.program.name}
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       <div className="flex items-center gap-4">
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={() =>
//             router.push(`/programs/${programId}/students/${studentId}`)
//           }
//         >
//           <ArrowLeft className="h-5 w-5" />
//         </Button>
//         <h1 className="text-3xl font-bold">Care Plan Assessment</h1>
//       </div>

//       {/* Already-submitted banner */}
//       {carePlan?.is_locked && (
//         <Alert className="bg-green-50 border-green-200">
//           <CheckCircle className="h-4 w-4 text-green-600" />
//           <AlertDescription className="text-green-800">
//             <div className="flex items-center justify-between flex-wrap gap-2">
//               <div>
//                 <p className="font-semibold">Care Plan Already Submitted</p>
//                 <p className="text-sm mt-0.5">
//                   Assessed by {carePlan.examiner_name} on{" "}
//                   {new Date(carePlan.assessed_at).toLocaleString()}
//                 </p>
//               </div>
//               <Badge className="bg-green-600 text-white shrink-0">
//                 {carePlan.score}/{carePlan.max_score} (
//                 {carePlan.percentage?.toFixed(1)}%)
//               </Badge>
//             </div>
//           </AlertDescription>
//         </Alert>
//       )}

//       {/* Assessment card */}
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle className="text-2xl">Score Care Plan</CardTitle>
//               <CardDescription>
//                 Single examiner assessment out of 20 points
//               </CardDescription>
//             </div>
//             {carePlan?.is_locked && (
//               <Badge variant="secondary" className="flex items-center gap-1">
//                 <Lock className="h-3 w-3" />
//                 Locked
//               </Badge>
//             )}
//           </div>
//         </CardHeader>

//         <CardContent>
//           {/* Read-only view (already submitted) */}
//           {carePlan?.is_locked ? (
//             <div className="space-y-6">
//               <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
//                 <div>
//                   <Label className="text-sm text-muted-foreground">Score</Label>
//                   <p className="text-3xl font-bold">
//                     {carePlan.score} / {carePlan.max_score}
//                   </p>
//                 </div>
//                 <div>
//                   <Label className="text-sm text-muted-foreground">
//                     Percentage
//                   </Label>
//                   <p className="text-3xl font-bold">
//                     {carePlan.percentage?.toFixed(1)}%
//                   </p>
//                 </div>
//               </div>

//               {carePlan.comments && (
//                 <div className="space-y-2">
//                   <Label>Comments</Label>
//                   <div className="p-3 bg-gray-50 rounded-md text-sm">
//                     {carePlan.comments}
//                   </div>
//                 </div>
//               )}

//               <div className="text-sm text-muted-foreground space-y-1">
//                 <p>
//                   Assessed by:{" "}
//                   <span className="font-medium">{carePlan.examiner_name}</span>
//                 </p>
//                 <p>
//                   Date:{" "}
//                   <span className="font-medium">
//                     {new Date(carePlan.assessed_at).toLocaleString()}
//                   </span>
//                 </p>
//               </div>
//             </div>
//           ) : (
//             /* Scoring form */
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="space-y-2">
//                 <Label htmlFor="score">
//                   Score (0–20) <span className="text-red-500">*</span>
//                 </Label>
//                 <Input
//                   id="score"
//                   type="number"
//                   min="0"
//                   max="20"
//                   value={score}
//                   onChange={(e) => setScore(e.target.value)}
//                   placeholder="Enter score (0–20)"
//                   required
//                   disabled={submitting}
//                   className="max-w-xs"
//                 />
//                 <p className="text-sm text-muted-foreground">
//                   Maximum score: 20 points
//                 </p>
//               </div>

//               <Alert className="bg-yellow-50 border-yellow-200">
//                 <Lock className="h-4 w-4" />
//                 <AlertDescription>
//                   <strong>Important:</strong> Once submitted, this assessment is
//                   locked and cannot be edited. Please review your score before
//                   submitting.
//                 </AlertDescription>
//               </Alert>

//               <div className="flex gap-2">
//                 <Button
//                   type="submit"
//                   disabled={submitting || !score}
//                   className="flex-1"
//                 >
//                   <Save className="mr-2 h-4 w-4" />
//                   {submitting ? "Submitting…" : "Submit Assessment"}
//                 </Button>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => router.back()}
//                   disabled={submitting}
//                 >
//                   Cancel
//                 </Button>
//               </div>
//             </form>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Lock,
  LockOpen,
  Save,
  CheckCircle,
  User,
  RefreshCw,
  Info,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CarePlanPage() {
  const router = useRouter();
  const { programId, studentId } = useParams();

  const [student, setStudent] = useState(null);
  const [carePlan, setCarePlan] = useState(null);
  const [lockMode, setLockMode] = useState(true); // care_plan_lock_on_submit flag
  const [score, setScore] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ── fetch data ────────────────────────────────────────────────────────────
  //
  // Settings is fetched separately so that a permission error on that endpoint
  // (e.g. if the backend GET is misconfigured) never kills the whole page.
  // The student + care-plan fetch still fail-fast together since both are
  // required to render anything useful.

  useEffect(() => {
    const fetchPage = async () => {
      try {
        // Student and care plan are required — fail together if either errors
        const [studentRes, carePlanRes] = await Promise.all([
          api.get(`/exams/students/${studentId}/`),
          api.get(
            `/exams/students/${studentId}/programs/${programId}/care-plan/`,
          ),
        ]);

        setStudent(studentRes.data);

        const plan =
          carePlanRes.data?.exists !== false ? carePlanRes.data : null;
        setCarePlan(plan);

        // Settings is best-effort: fetch independently and fall back to
        // the safe default (lock ON) if the request fails for any reason.
        let flagOn = true;
        try {
          const settingsRes = await api.get("/exams/settings/");
          flagOn = settingsRes.data?.care_plan_lock_on_submit ?? true;
        } catch {
          // Permission error or network issue — default to locked behaviour
        }
        setLockMode(flagOn);

        // Pre-fill the score input when rescoring is allowed and a plan exists
        if (plan && !flagOn) {
          setScore(String(plan.score));
        }
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [studentId, programId]);

  // ── submit / rescore ──────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    const scoreNum = parseInt(score, 10);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 20) {
      toast.error("Score must be between 0 and 20");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(
        `/exams/students/${studentId}/programs/${programId}/care-plan/`,
        { score: scoreNum },
      );

      toast.success(
        carePlan
          ? "Care plan score updated successfully"
          : "Care plan submitted successfully",
      );

      // Refresh the care plan state after save
      const res = await api.get(
        `/exams/students/${studentId}/programs/${programId}/care-plan/`,
      );
      if (res.data?.exists !== false) {
        setCarePlan(res.data);
        // Keep the input populated when still in rescore mode
        if (!lockMode) setScore(String(res.data.score));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit care plan");
    } finally {
      setSubmitting(false);
    }
  };

  // ── derived state ─────────────────────────────────────────────────────────

  // Truly read-only: plan was locked at submit time (flag was ON when submitted)
  const isReadOnly = Boolean(carePlan?.is_locked);

  // Editable: plan exists but was not locked (flag is OFF)
  const isRescoreMode = Boolean(carePlan && !carePlan.is_locked);

  // Brand-new: no plan exists yet
  const isFirstSubmission = !carePlan;

  // ── loading skeleton ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        </div>
        <Skeleton className="h-72 rounded-lg" />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Student info banner */}
      {student && (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full shrink-0">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold truncate">
                {student.full_name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Index: {student.index_number}
              </p>
              {student.program?.name && (
                <p className="text-sm text-muted-foreground">
                  Program: {student.program.name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            router.push(`/programs/${programId}/students/${studentId}`)
          }
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Care Plan Assessment</h1>
      </div>

      {/* ── Context banners ── */}

      {/* Locked — submitted while flag was ON */}
      {isReadOnly && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-semibold">Care Plan Submitted & Locked</p>
                <p className="text-sm mt-0.5">
                  Assessed by{" "}
                  <span className="font-medium">{carePlan.examiner_name}</span>{" "}
                  on {new Date(carePlan.assessed_at).toLocaleString()}
                </p>
              </div>
              <Badge className="bg-green-600 text-white shrink-0">
                {carePlan.score}/{carePlan.max_score} (
                {carePlan.percentage?.toFixed(1)}%)
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Rescore mode — plan exists but flag is OFF */}
      {isRescoreMode && (
        <Alert className="bg-blue-50 border-blue-200">
          <RefreshCw className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-semibold">
                  Previously Scored — Rescoring Enabled
                </p>
                <p className="text-sm mt-0.5">
                  Last scored by{" "}
                  <span className="font-medium">{carePlan.examiner_name}</span>{" "}
                  on {new Date(carePlan.assessed_at).toLocaleString()}
                </p>
              </div>
              <Badge className="bg-blue-600 text-white shrink-0">
                Current: {carePlan.score}/{carePlan.max_score}
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Assessment card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">
                {isRescoreMode ? "Update Score" : "Score Care Plan"}
              </CardTitle>
              <CardDescription>
                Single examiner assessment out of 20 points
              </CardDescription>
            </div>

            {isReadOnly && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 shrink-0"
              >
                <Lock className="h-3 w-3" />
                Locked
              </Badge>
            )}
            {!lockMode && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 shrink-0 border-blue-300 text-blue-700"
              >
                <LockOpen className="h-3 w-3" />
                Rescoring enabled
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* ── READ-ONLY view ── */}
          {isReadOnly ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm text-muted-foreground">Score</Label>
                  <p className="text-3xl font-bold">
                    {carePlan.score} / {carePlan.max_score}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Percentage
                  </Label>
                  <p className="text-3xl font-bold">
                    {carePlan.percentage?.toFixed(1)}%
                  </p>
                </div>
              </div>

              {carePlan.comments && (
                <div className="space-y-2">
                  <Label>Comments</Label>
                  <div className="p-3 bg-gray-50 rounded-md text-sm">
                    {carePlan.comments}
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  Assessed by:{" "}
                  <span className="font-medium">{carePlan.examiner_name}</span>
                </p>
                <p>
                  Date:{" "}
                  <span className="font-medium">
                    {new Date(carePlan.assessed_at).toLocaleString()}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            /* ── SCORING / RESCORING form ── */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Previous score context strip (rescore mode only) */}
              {isRescoreMode && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50 border text-sm">
                  <Info className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    The current score is{" "}
                    <strong className="text-foreground">
                      {carePlan.score}/{carePlan.max_score}
                    </strong>{" "}
                    ({carePlan.percentage?.toFixed(1)}%), entered by{" "}
                    <strong className="text-foreground">
                      {carePlan.examiner_name}
                    </strong>
                    . Submitting will overwrite this.
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="score">
                  {isRescoreMode ? "New Score (0–20)" : "Score (0–20)"}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="20"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="Enter score (0–20)"
                  required
                  disabled={submitting}
                  className="max-w-xs"
                />
                <p className="text-sm text-muted-foreground">
                  Maximum score: 20 points
                </p>
              </div>

              {/* Lock warning — first submission only, flag ON */}
              {lockMode && isFirstSubmission && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> Once submitted, this assessment
                    is locked and cannot be edited. Please review your score
                    carefully before submitting.
                  </AlertDescription>
                </Alert>
              )}

              {/* Rescore info — flag OFF */}
              {!lockMode && (
                <Alert className="bg-blue-50 border-blue-200">
                  <LockOpen className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Rescoring is enabled.</strong> This score can be
                    updated at any time. The most recent submission will be used
                    for grading.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={submitting || !score}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      {isRescoreMode ? "Updating…" : "Submitting…"}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isRescoreMode ? "Update Score" : "Submit Assessment"}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
