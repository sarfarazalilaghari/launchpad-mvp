import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Eye, TrendingUp } from "lucide-react";
import type { Startup, AIScoreBreakdown } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface StartupCardProps {
  startup: Startup;
  showSaveButton?: boolean;
}

export default function StartupCard({ startup, showSaveButton = true }: StartupCardProps) {
  const { user } = useAuth();
  const isInvestor = user?.role === "investor";

  const { data: savedStatus } = useQuery<{ isSaved: boolean }>({
    queryKey: ["/api/saved-startups", startup.id, "check"],
    enabled: isInvestor && showSaveButton,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (savedStatus?.isSaved) {
        return apiRequest("DELETE", `/api/saved-startups/${startup.id}`);
      }
      return apiRequest("POST", `/api/saved-startups/${startup.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-startups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-startups", startup.id, "check"] });
    },
  });

  const scoreBreakdown = startup.aiScoreBreakdown as AIScoreBreakdown | null;

  const getScoreColor = (score: number | null) => {
    if (!score) return "bg-muted text-muted-foreground";
    if (score >= 80) return "bg-green-500/10 text-green-600 dark:text-green-400";
    if (score >= 60) return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
    return "bg-red-500/10 text-red-600 dark:text-red-400";
  };

  const getStageColor = (stage: string | null) => {
    switch (stage) {
      case "idea": return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      case "mvp": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "growth": return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "scale": return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="group hover-elevate overflow-visible" data-testid={`card-startup-${startup.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link href={`/startup/${startup.id}`}>
              <a className="block">
                <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors" data-testid={`text-startup-title-${startup.id}`}>
                  {startup.title}
                </h3>
              </a>
            </Link>
            {startup.industry && (
              <p className="text-sm text-muted-foreground mt-1">{startup.industry}</p>
            )}
          </div>
          
          {/* AI Score Badge */}
          <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl ${getScoreColor(startup.aiScore)}`}>
            <span className="text-xl font-bold" data-testid={`text-ai-score-${startup.id}`}>
              {startup.aiScore || "--"}
            </span>
            <span className="text-[10px] uppercase tracking-wider opacity-70">Score</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {startup.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {startup.stage && (
            <Badge variant="secondary" className={`text-xs ${getStageColor(startup.stage)}`}>
              {startup.stage}
            </Badge>
          )}
          {startup.businessModel && (
            <Badge variant="secondary" className="text-xs">
              {startup.businessModel}
            </Badge>
          )}
          {startup.geography && (
            <Badge variant="secondary" className="text-xs">
              {startup.geography}
            </Badge>
          )}
        </div>

        {/* Score Breakdown Mini */}
        {scoreBreakdown && (
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div>
              <div className="font-semibold text-foreground">{scoreBreakdown.marketPotential}</div>
              <div className="text-muted-foreground">Market</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">{scoreBreakdown.feasibility}</div>
              <div className="text-muted-foreground">Feasibility</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">{scoreBreakdown.innovation}</div>
              <div className="text-muted-foreground">Innovation</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">{scoreBreakdown.scalability}</div>
              <div className="text-muted-foreground">Scale</div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {startup.viewCount || 0}
          </span>
          {startup.fundingAsk && (
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {startup.fundingAsk}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isInvestor && showSaveButton && (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                saveMutation.mutate();
              }}
              disabled={saveMutation.isPending}
              data-testid={`button-save-${startup.id}`}
            >
              {savedStatus?.isSaved ? (
                <BookmarkCheck className="w-4 h-4 text-primary" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
          )}
          <Button asChild size="sm" data-testid={`button-view-${startup.id}`}>
            <Link href={`/startup/${startup.id}`}>
              <a>View Details</a>
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
