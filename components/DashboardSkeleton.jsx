import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton({ 
  showStats = true, 
  showFilters = true, 
  showTable = true,
  statsCount = 4,
  tableRows = 5,
  tableColumns = 6
}) {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      {showStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: statsCount }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters Skeleton */}
      {showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-10 flex-1 max-w-sm" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
      )}

      {/* Table Skeleton */}
      {showTable && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Table Header */}
              <div className="flex gap-4 pb-3 border-b">
                {Array.from({ length: tableColumns }).map((_, i) => (
                  <Skeleton key={i} className="h-4 flex-1" />
                ))}
              </div>
              
              {/* Table Rows */}
              {Array.from({ length: tableRows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4 py-3">
                  {Array.from({ length: tableColumns }).map((_, colIndex) => (
                    <Skeleton key={colIndex} className="h-4 flex-1" />
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}