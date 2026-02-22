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
import { ClipboardList, FileText, ArrowLeft, User } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function AssessmentOptionsPage() {
  const router = useRouter();
  const params = useParams();
  const { programId, studentId } = params;

  const [student, setStudent] = useState(null);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentRes, programRes] = await Promise.all([
        api.get(`/exams/students/${studentId}/`),
        api.get(`/exams/programs/`),
      ]);

      setStudent(studentRes.data);
      const foundProgram = programRes.data.find(
        (p) => p.id === parseInt(programId)
      );
      setProgram(foundProgram);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}

      {/* Student Info Header */}
      {student && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{student.full_name}</h2>
              <p className="text-sm text-muted-foreground">
                Index Number: {student.index_number}
              </p>
              {student.program && (
                <p className="text-sm text-muted-foreground">
                  Program: {student.program.name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/programs/${programId}`)}>
          <ArrowLeft className="h-5 w-5" /> Back
        </Button>
        <div>
          <h1 className="text-2xl uppercase font-bold">Assessment Options</h1>
        </div>
      </div>

      {/* Assessment Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Procedures Card */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() =>
            router.push(`/programs/${programId}/students/${studentId}/procedures`)
          }
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <ClipboardList className="h-12 w-12 text-blue-600" />
            </div>
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
            <Button className="w-full" variant="default">
              Go to Procedures
            </Button>
          </CardContent>
        </Card>

        {/* Care Plan Card */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() =>
            router.push(`/programs/${programId}/students/${studentId}/careplan`)
          }
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <FileText className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Care Plan</CardTitle>
            <CardDescription>
              Score student's care plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Single assessment scored out of 20 points, locked after submission
            </p>
            <Button className="w-full" variant="default">
              Go to Care Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
