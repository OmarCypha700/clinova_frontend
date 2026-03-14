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
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, FileText, ArrowLeft, User } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function AssessmentOptionsPage() {
  const router = useRouter();
  const { programId, studentId } = useParams();

  const [student, setStudent] = useState(null);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    api
      .get(`/exams/students/${studentId}/`)
      .then((res) => setStudent(res.data))
      .catch(() => toast.error("Failed to load student data"))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    );
  }

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
              <h2 className="text-lg font-bold truncate">{student.full_name}</h2>
              <p className="text-sm text-muted-foreground">
                Index: {student.index_number}
              </p>
              {/* program is a nested object from the serializer */}
              {student.program?.name && (
                <p className="text-sm text-muted-foreground">
                  Program: {student.program.name} | {student.level_name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/programs/${programId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl uppercase font-bold">Assessment Options</h1>
      </div>

      {/* Assessment cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Procedures */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() =>
            router.push(
              `/programs/${programId}/students/${studentId}/procedures`,
            )
          }
        >
          <CardHeader>
            <ClipboardList className="h-12 w-12 text-blue-600 mb-1" />
            <CardTitle className="text-2xl">Procedures</CardTitle>
            <CardDescription>
              Assess clinical procedures with dual examiner scoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Multiple procedures assessed by two examiners with reconciliation
              process
            </p>
            <Button className="w-full">Go to Procedures</Button>
          </CardContent>
        </Card>

        {/* Care Plan */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() =>
            router.push(
              `/programs/${programId}/students/${studentId}/careplan`,
            )
          }
        >
          <CardHeader>
            <FileText className="h-12 w-12 text-green-600 mb-1" />
            <CardTitle className="text-2xl">Care Plan</CardTitle>
            <CardDescription>Score student's care plan</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Single assessment scored out of 20 points, locked after submission
            </p>
            <Button className="w-full">Go to Care Plan</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}