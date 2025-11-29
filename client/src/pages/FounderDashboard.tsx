import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import StartupCard from "@/components/StartupCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  Rocket, 
  Eye, 
  MessageSquare, 
  TrendingUp,
  PlusCircle,
  Users,
  Sparkles
} from "lucide-react";
import type { Startup, InvestorMatch, User } from "@shared/schema";

interface MatchWithInvestor extends InvestorMatch {
  investor: User;
}

export default function FounderDashboard() {
  const { user } = useAuth();

  const { data: startups, isLoading } = useQuery<Startup[]>({
    queryKey: ["/api/startups/my"],
  });

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
  });

  // Get matches for the first startup (if any)
  const firstStartupId = startups?.[0]?.id;
  const { data: matches } = useQuery<MatchWithInvestor[]>({
    queryKey: ["/api/startups", firstStartupId, "matches"],
    enabled: !!firstStartupId,
  });

  const totalViews = startups?.reduce((sum, s) => sum + (s.viewCount || 0), 0) || 0;
  const avgScore = startups?.length
    ? Math.round(startups.reduce((sum, s) => sum + (s.aiScore || 0), 0) / startups.length)
    : 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName || "Founder"}
          </h1>
          <p className="text-muted-foreground">
            Manage your startup ideas and track investor interest
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ideas Posted</p>
                  <p className="text-3xl font-bold" data-testid="stat-ideas-posted">{startups?.length || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-3xl font-bold" data-testid="stat-total-views">{totalViews}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Messages</p>
                  <p className="text-3xl font-bold" data-testid="stat-messages">{unreadCount?.count || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg AI Score</p>
                  <p className="text-3xl font-bold" data-testid="stat-avg-score">{avgScore || "--"}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Startups List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Your Startup Ideas</h2>
              <Button asChild data-testid="button-post-new-idea">
                <Link href="/post-idea">
                  <a className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Post New Idea
                  </a>
                </Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-6 w-3/4 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : startups?.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <Rocket className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No ideas yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Post your first startup idea and let AI help you create the perfect pitch.
                  </p>
                  <Button asChild data-testid="button-post-first-idea">
                    <Link href="/post-idea">
                      <a>Post Your First Idea</a>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {startups?.map((startup) => (
                  <StartupCard key={startup.id} startup={startup} showSaveButton={false} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recommended Investors */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Recommended Investors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!matches || matches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Post a startup idea to get matched with investors.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {matches.slice(0, 5).map((match) => (
                      <div 
                        key={match.id} 
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        data-testid={`investor-match-${match.investorId}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {match.investor?.firstName} {match.investor?.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {match.investor?.company || "Investor"}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-primary">
                          {match.matchScore}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  Complete all fields in your startup idea for better AI scoring
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  Generate a pitch deck to make your idea more compelling
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  Respond quickly to investor messages
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
