"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft, User } from "lucide-react";

export default function ProcedureStepsPage() {
  const { programId, studentId, procedureId } = useParams();
  const router = useRouter();

  const [procedure, setProcedure] = useState(null);
  const [student, setStudent] = useState(null);
  const [scores, setScores] = useState({});
  const [savingStep, setSavingStep] = useState(null);
  const [completionStatus, setCompletionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch procedure + student data
  useEffect(() => {
    if (!programId || !procedureId || !studentId) return;

    // Fetch procedure details
    const fetchProcedure = api.get(
      `/exams/students/${studentId}/procedures/${procedureId}/`
    );

    // Fetch student details
    const fetchStudent = api.get(`/exams/students/${studentId}/`);

    Promise.all([fetchProcedure, fetchStudent])
      .then(([procedureRes, studentRes]) => {
        setProcedure(procedureRes.data);
        setStudent(studentRes.data);

        // Map existing scores from backend (only current user's scores)
        const mappedScores = {};
        procedureRes.data.scores?.forEach((item) => {
          mappedScores[item.step] = item.score;
        });
        setScores(mappedScores);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [programId, procedureId, studentId]);

  // Autosave handler
  const handleScoreChange = async (stepId, value) => {
    if (!procedure) return;

    setScores((prev) => ({
      ...prev,
      [stepId]: value,
    }));

    setSavingStep(stepId);

    try {
      const response = await api.post(`/exams/autosave-step-score/`, {
        step: stepId,
        student_procedure: procedure.studentProcedureId,
        score: value,
      });

      setCompletionStatus({
        status: response.data.status,
        examinerAComplete: response.data.examiner_a_complete,
        examinerBComplete: response.data.examiner_b_complete,
      });
    } catch (err) {
      console.error("Autosave failed", err);
      alert("Failed to save score. Please try again.");
    } finally {
      setSavingStep(null);
    }
  };


  if (loading) {
  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4 animate-pulse">
      {/* Back button */}
      <div className="h-8 w-24 bg-gray-200 rounded" />

      {/* Student info card */}
      <div className="p-4 border rounded-lg space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-28 bg-gray-200 rounded" />
          </div>
          <div className="h-6 w-24 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Procedure title */}
      <div className="h-6 w-3/4 bg-gray-200 rounded" />

      {/* Progress indicator */}
      <div className="h-3 w-40 bg-gray-200 rounded" />

      {/* Steps container */}
      <div className="p-4 border rounded-md space-y-4">
        {/* Header row */}
        <div className="flex justify-between items-center">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-6 bg-gray-200 rounded" />
            ))}
          </div>
        </div>

        <Separator className="bg-gray-300" />

        {/* Step rows */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="grid grid-cols-5 gap-4">
                {[...Array(5)].map((_, j) => (
                  <div
                    key={j}
                    className="h-4 w-4 bg-gray-200 rounded-full"
                  />
                ))}
              </div>
            </div>
            <Separator className="bg-gray-300" />
          </div>
        ))}
      </div>
    </div>
  );
}


  if (!procedure || !student) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <p>Error loading data.</p>
      </div>
    );
  }

  // Check if current user has completed all steps
  const totalSteps = procedure.steps?.length || 0;
  const completedSteps = Object.keys(scores).length;
  const isComplete = completedSteps === totalSteps && totalSteps > 0;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Student Info Card */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold">{student.full_name}</h2>
            <p className="text-sm text-muted-foreground">
              Index Number: {student.index_number}
            </p>
          </div>
          {procedure.examiner_role && (
            <Badge className="bg-purple-500 text-white">
              Examiner {procedure.examiner_role}
            </Badge>
          )}
        </div>
      </div>

      {/* Procedure Title */}
      <h1 className="text-xl font-bold uppercase mb-4">{procedure.name}</h1>

      {/* Completion Alert */}
      {isComplete && (
        <Alert className="mb-4 border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            You have completed scoring all steps for this procedure.
            {completionStatus?.status === "scored" && (
              <span className="block mt-1 font-semibold">
                Both examiners have completed scoring. Reconciliation is now
                available.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Progress indicator */}
      <div className="mb-4 text-sm text-muted-foreground">
        Progress: {completedSteps} / {totalSteps} steps completed
      </div>

      <div className="p-4 border rounded-md">
        {/* Header row */}
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
          {procedure.steps.map((step, index) => (
            <div key={step.id}>
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm flex-1">
                  {index + 1}. {step.description}
                </p>

                {/* Scoring radios with autosave */}
                <div className="grid grid-cols-5 gap-4 text-center">
                  {[0, 1, 2, 3, 4].map((val) => {
                    const inputId = `step-${step.id}-score-${val}`;

                    return (
                      <label
                        key={val}
                        htmlFor={inputId}
                        className="flex flex-col items-center cursor-pointer select-none"
                      >
                        <span className="text-xs font-semibold mb-1">
                          {val}
                        </span>
                        <input
                          id={inputId}
                          type="radio"
                          name={`step-${step.id}`}
                          value={val}
                          checked={scores[step.id] === val}
                          onChange={() => handleScoreChange(step.id, val)}
                          className="h-4 w-4 accent-primary"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Autosave feedback */}
              {savingStep === step.id && (
                <p className="text-xs text-muted-foreground mt-1">Saving...</p>
              )}

              <Separator className="my-3 bg-gray-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
