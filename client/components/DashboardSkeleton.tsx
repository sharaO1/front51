import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Skeleton className="h-10 w-full sm:w-[140px]" />
          <Skeleton className="h-10 w-full sm:w-[120px]" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Sales Chart Skeleton */}
        <Card className="col-span-4 shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>

        {/* Product Categories Skeleton */}
        <Card className="col-span-3 shadow-md border-0 bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="pb-6">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <Skeleton className="h-40 w-40 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {/* Recent Activity Skeleton */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-full mb-2" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Alerts Skeleton */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24 mb-2" />
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-1.5 w-16 rounded-full" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Table Skeleton */}
      <Card className="shadow-md border-0">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4 pb-2 border-b">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-full" />
              ))}
            </div>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="grid grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, colIndex) => (
                  <Skeleton key={colIndex} className="h-4 w-full" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
