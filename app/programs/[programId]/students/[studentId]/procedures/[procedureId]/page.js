"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  ArrowLeft,
  User,
  Lock,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export default function ProcedureStepsPage() {
  const { programId, studentId, procedureId } = useParams();
  const router = useRouter();

  const [procedure, setProcedure] = useState(null);
  const [student, setStudent] = useState(null);
  const [scores, setScores] = useState({});
  const [savingStep, setSavingStep] = useState(null);
  const [completionStatus, setCompletionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch procedure + student in parallel ─────────────────────────────────

  useEffect(() => {
    if (!programId || !procedureId || !studentId) return;

    Promise.all([
      api.get(`/exams/students/${studentId}/procedures/${procedureId}/`),
      api.get(`/exams/students/${studentId}/`),
    ])
      .then(([procedureRes, studentRes]) => {
        setProcedure(procedureRes.data);
        setStudent(studentRes.data);

        // Seed the local score map with this examiner's existing scores
        const mapped = {};
        procedureRes.data.scores?.forEach((item) => {
          mapped[item.step] = item.score;
        });
        setScores(mapped);
      })
      .catch((err) => {
        // 403 means the examiner is not assigned — backend sends a structured error
        const detail = err.response?.data?.detail;
        if (detail) {
          toast.error(detail);
        }
        // Redirect back to procedure list on any fetch error
        router.replace(
          `/programs/${programId}/students/${studentId}/procedures`,
        );
      })
      .finally(() => setLoading(false));
  }, [programId, procedureId, studentId, router]);

  // ── Autosave handler ─────────────────────────────────────────────────────

  const handleScoreChange = async (stepId, value) => {
    if (!procedure?.studentProcedureId) return;

    // Optimistic local update
    setScores((prev) => ({ ...prev, [stepId]: value }));
    setSavingStep(stepId);

    try {
      const res = await api.post("/exams/autosave-step-score/", {
        step: stepId,
        student_procedure: procedure.studentProcedureId,
        score: value,
      });

      setCompletionStatus({
        status: res.data.status,
        examinerAComplete: res.data.examiner_a_complete,
        examinerBComplete: res.data.examiner_b_complete,
        isLocked: res.data.is_locked,
        bothAssigned: res.data.both_examiners_assigned,
      });
    } catch (err) {
      // Revert optimistic update
      setScores((prev) => {
        const next = { ...prev };
        delete next[stepId];
        return next;
      });
      const detail = err.response?.data?.detail ?? "Failed to save score.";
      toast.error(detail);

      // If procedure is now locked/reconciled, send back
      if (err.response?.status === 403) {
        router.replace(
          `/programs/${programId}/students/${studentId}/procedures`,
        );
      }
    } finally {
      setSavingStep(null);
    }
  };

  // ── Derived state ─────────────────────────────────────────────────────────

  const totalSteps = procedure?.steps?.length ?? 0;
  const completedSteps = Object.keys(scores).length;
  const isComplete = completedSteps === totalSteps && totalSteps > 0;

  const canModify = procedure?.can_modify_scores ?? true;
  const isLocked = procedure?.is_locked ?? false;

  const showReconcileLink =
    isComplete &&
    completionStatus?.status === "scored" &&
    completionStatus?.examinerAComplete &&
    completionStatus?.examinerBComplete &&
    completionStatus?.bothAssigned;

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-4 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-24" />
        <div className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-3 w-36" />
        <div className="p-4 border rounded-md space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-6" />
              ))}
            </div>
          </div>
          <Separator className="bg-gray-200" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <Skeleton className="h-4 flex-1" />
                <div className="flex gap-4">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <Skeleton key={j} className="h-4 w-4 rounded-full" />
                  ))}
                </div>
              </div>
              <Separator className="bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Shouldn't render if redirect fired, but guard anyway
  if (!procedure || !student) return null;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Back button */}
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            router.push(
              `/programs/${programId}/students/${studentId}/procedures`,
            )
          }
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Student info card */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full shrink-0">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold truncate">{student.full_name}</h2>
            <p className="text-sm text-muted-foreground">
              Index: {student.index_number}
            </p>
            {student.program && (
                <p className="text-sm text-muted-foreground">
                  Program: {student.program.name} | {student.level_name}
                </p>
              )}
          </div>
          {procedure.examiner_role && (
            <Badge className="bg-purple-500 text-white shrink-0">
              Examiner {procedure.examiner_role}
            </Badge>
          )}
        </div>
      </div>

      {/* Procedure title */}
      <h1 className="text-xl font-bold uppercase mb-2">{procedure.name}</h1>

      {/* Status alerts ─────────────────────────────────────────────────── */}

      {/* Locked — reconciler has been assigned */}
      {isLocked && (
        <Alert className="mb-4 border-orange-300 bg-orange-50">
          <Lock className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <p className="font-semibold">Scores locked</p>
            <p className="text-sm mt-0.5">
              A reconciler has been assigned. You can no longer modify scores.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Waiting for the other examiner */}
      {!isLocked &&
        !procedure.both_examiners_assigned &&
        procedure.is_examiner && (
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <p className="font-semibold">Waiting for second examiner</p>
              <p className="text-sm mt-0.5">
                Your scores are saved. Another examiner must access this
                procedure before reconciliation can begin.
              </p>
            </AlertDescription>
          </Alert>
        )}

      {/* Completion + reconciliation link */}
      {isComplete && !isLocked && (
        <Alert className="mb-4 border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            You have scored all {totalSteps} steps.
            {showReconcileLink && (
              <span className="block mt-1 font-semibold">
                <Link
                  className="underline"
                  href={`/programs/${programId}/students/${studentId}/procedures/${procedureId}/reconcile`}
                >
                  Reconciliation is now available — click here.
                </Link>
              </span>
            )}
            {completionStatus?.bothAssigned &&
              !showReconcileLink &&
              completionStatus?.status !== "scored" && (
                <span className="block mt-1 text-sm">
                  Waiting for the other examiner to finish scoring.
                </span>
              )}
          </AlertDescription>
        </Alert>
      )}

      {/* Progress bar */}
      <div className="mb-4 space-y-1 sticky top-16 bg-white z-10">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>
            {completedSteps} / {totalSteps}
          </span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-700 rounded-full transition-all duration-300"
            style={{
              width:
                totalSteps > 0
                  ? `${(completedSteps / totalSteps) * 100}%`
                  : "0%",
            }}
          />
        </div>
      </div>

      {/* Scoring table */}
      <div className="p-4 border rounded-md">
        {/* Column headers */}
        <div className="flex justify-between items-center mb-3 text-sm font-bold">
          <span>Procedure Steps</span>
          <div className="grid grid-cols-5 gap-6 text-center pr-2">
            {[0, 1, 2, 3, 4].map((v) => (
              <span key={v}>{v}</span>
            ))}
          </div>
        </div>

        <Separator className="mb-3 bg-gray-300" />

        <div className="space-y-4">
          {procedure.steps.map((step, index) => {
            const isSaving = savingStep === step.id;
            const hasScore = scores[step.id] !== undefined;

            return (
              <div key={step.id}>
                <div className="flex items-start justify-between gap-4">
                  {/* Step description */}
                  <p
                    className={`text-sm flex-1 ${
                      hasScore ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <span className="font-medium">{index + 1}.</span>{" "}
                    {step.description}
                  </p>

                  {/* Radio buttons (0–4) */}
                  <div className="grid grid-cols-5 gap-4 text-center shrink-0">
                    {[0, 1, 2, 3, 4].map((val) => {
                      const inputId = `step-${step.id}-score-${val}`;
                      return (
                        <label
                          key={val}
                          htmlFor={inputId}
                          className={`flex flex-col items-center select-none ${
                            canModify && !isLocked
                              ? "cursor-pointer"
                              : "cursor-not-allowed opacity-60"
                          }`}
                        >
                          <input
                            id={inputId}
                            type="radio"
                            name={`step-${step.id}`}
                            value={val}
                            checked={scores[step.id] === val}
                            onChange={() => {
                              if (canModify && !isLocked) {
                                handleScoreChange(step.id, val);
                              }
                            }}
                            // ✅ Fix: disable when locked or not allowed to modify
                            disabled={!canModify || isLocked || isSaving}
                            className="h-4 w-4 accent-primary"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Per-step saving indicator */}
                {isSaving && (
                  <p className="text-xs text-muted-foreground mt-1 animate-pulse">
                    Saving…
                  </p>
                )}

                <Separator className="my-3 bg-gray-200" />
              </div>
            );
          })}
        </div>

        {/* Bottom summary */}
        {!canModify && !isLocked && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            You are viewing this procedure in read-only mode.
          </p>
        )}
      </div>
    </div>
  );
}
