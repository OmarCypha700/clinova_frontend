"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Stethoscope,
  HeartPulse,
  GraduationCap,
  BookOpen,
  HandHeart,
} from "lucide-react";

const PROGRAM_ICONS = {
  RGN:  Stethoscope,
  RM:   HeartPulse,
  PHN:  HandHeart,
  RNAP: GraduationCap,
};

export default function ProgramsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [programs, setPrograms]         = useState([]);
  const [programsLoading, setProgramsLoading] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/");
  }, [authLoading, isAuthenticated, router]);

  // Fetch programs only once auth is confirmed
  useEffect(() => {
    if (!isAuthenticated) return;

    setProgramsLoading(true);
    api
      .get("/exams/programs/")
      .then((res) => {
        // Endpoint returns a plain array (no pagination wrapper)
        setPrograms(Array.isArray(res.data) ? res.data : (res.data?.results ?? []));
      })
      .catch(() => {
        // Silently fail — user will see an empty grid
      })
      .finally(() => setProgramsLoading(false));
  }, [isAuthenticated]);

  const isLoading = authLoading || programsLoading;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl uppercase text-center font-bold mb-6">
        Select Program
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {/* Skeleton cards while loading */}
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
            </Card>
          ))}

        {/* Program cards */}
        {!isLoading &&
          programs.map((program) => {
            const Icon = PROGRAM_ICONS[program.abbreviation] ?? BookOpen;
            return (
              <Card
                key={program.id}
                onClick={() => router.push(`/programs/${program.id}`)}
                className="cursor-pointer transition hover:shadow-md hover:border-primary"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Icon className="h-6 w-6 text-primary" />
                    <Badge>
                      {program.abbreviation
                        ? program.abbreviation.replace("_", " ")
                        : "General"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{program.name}</CardTitle>
                  <CardDescription>
                    Click to view students and procedures
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}

        {/* Empty state */}
        {!isLoading && programs.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-12">
            No programs available.
          </p>
        )}
      </div>
    </div>
  );
}