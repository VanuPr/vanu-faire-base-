import UserManagement from "@/app/users/components/user-management";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

function UserManagementSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>User Accounts</CardTitle>
                <CardDescription>Manage, search, and filter user accounts.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between gap-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-44" />
                      <Skeleton className="h-10 w-32" />
                    </div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}


export default function UsersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Control</h1>
        <p className="text-muted-foreground">
          Enable, disable, and manage user accounts in your project.
        </p>
      </div>
      <Suspense fallback={<UserManagementSkeleton />}>
        <UserManagement />
      </Suspense>
    </div>
  );
}
