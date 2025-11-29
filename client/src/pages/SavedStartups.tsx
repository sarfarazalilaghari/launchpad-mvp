import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import StartupCard from "@/components/StartupCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Bookmark, Search } from "lucide-react";
import type { SavedStartup, Startup } from "@shared/schema";

interface SavedWithStartup extends SavedStartup {
  startup: Startup;
}

export default function SavedStartups() {
  const { data: savedStartups, isLoading } = useQuery<SavedWithStartup[]>({
    queryKey: ["/api/saved-startups"],
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Saved Startups</h1>
          <p className="text-muted-foreground">
            Your bookmarked startup ideas for easy reference
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : savedStartups?.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No saved startups</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                When you find interesting startup ideas, save them here for easy access later.
              </p>
              <Button asChild data-testid="button-browse-startups">
                <Link href="/browse">
                  <a className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Browse Startups
                  </a>
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {savedStartups?.length} saved startup{savedStartups?.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedStartups?.map((saved) =>
                saved.startup ? (
                  <StartupCard key={saved.id} startup={saved.startup} />
                ) : null
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
