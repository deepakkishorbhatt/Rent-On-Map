import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";

export function PropertyCardSkeleton() {
    return (
        <Card className="w-full overflow-hidden">
            <CardHeader className="p-0">
                <Skeleton className="w-full aspect-[4/3]" />
            </CardHeader>
            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-6 w-1/4" />
                </div>
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2 pt-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <div className="flex gap-3 w-full">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                </div>
            </CardFooter>
        </Card>
    );
}
