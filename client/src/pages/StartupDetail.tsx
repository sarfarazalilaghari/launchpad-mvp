import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Eye,
  MessageSquare,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Target,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";
import type { Startup, User, PitchDeck, AIScoreBreakdown, MarketAnalysis, PitchSlide } from "@shared/schema";

interface StartupWithFounder extends Startup {
  founder: User;
}

export default function StartupDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: startup, isLoading } = useQuery<StartupWithFounder>({
    queryKey: ["/api/startups", id],
  });

  const { data: pitchDeck, isLoading: pitchDeckLoading } = useQuery<PitchDeck>({
    queryKey: ["/api/startups", id, "pitch-deck"],
  });

  const { data: savedStatus } = useQuery<{ isSaved: boolean }>({
    queryKey: ["/api/saved-startups", id, "check"],
    enabled: user?.role === "investor",
  });

  const isOwner = user?.id === startup?.founderId;
  const isInvestor = user?.role === "investor";

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (savedStatus?.isSaved) {
        return apiRequest("DELETE", `/api/saved-startups/${id}`);
      }
      return apiRequest("POST", `/api/saved-startups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-startups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-startups", id, "check"] });
    },
  });

  const generateDeckMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/startups/${id}/pitch-deck`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/startups", id, "pitch-deck"] });
      toast({
        title: "Pitch Deck Generated",
        description: "Your AI-powered pitch deck is ready!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate pitch deck. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/messages", {
        recipientId: startup?.founderId,
        startupId: id,
        content: messageContent,
      });
    },
    onSuccess: () => {
      setMessageOpen(false);
      setMessageContent("");
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the founder.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const scoreBreakdown = startup?.aiScoreBreakdown as AIScoreBreakdown | null;
  const marketAnalysis = startup?.marketAnalysis as MarketAnalysis | null;
  const slides = pitchDeck?.slides as PitchSlide[] | undefined;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/10";
    if (score >= 60) return "bg-yellow-500/10";
    return "bg-red-500/10";
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!startup) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Startup not found</h1>
          <Button asChild>
            <Link href={isInvestor ? "/browse" : "/dashboard"}>
              <a>Go Back</a>
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          asChild
          data-testid="button-back"
        >
          <Link href={isInvestor ? "/browse" : "/dashboard"}>
            <a className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </a>
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2" data-testid="text-startup-title">
                      {startup.title}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                      {startup.industry && (
                        <Badge variant="secondary">{startup.industry}</Badge>
                      )}
                      {startup.stage && (
                        <Badge variant="outline" className="capitalize">
                          {startup.stage}
                        </Badge>
                      )}
                      {startup.geography && (
                        <Badge variant="outline">{startup.geography}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    {startup.viewCount || 0} views
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-startup-description">
                  {startup.description}
                </p>
              </CardContent>
            </Card>

            {/* Details Tabs */}
            <Tabs defaultValue="details">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="pitch-deck">Pitch Deck</TabsTrigger>
                <TabsTrigger value="analysis">Market Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Problem</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{startup.problem}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Solution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{startup.solution}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Target Market</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{startup.targetMarket}</p>
                  </CardContent>
                </Card>

                {startup.businessModel && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Business Model</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge>{startup.businessModel}</Badge>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="pitch-deck" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        AI-Generated Pitch Deck
                      </CardTitle>
                      {isOwner && !pitchDeck && (
                        <Button
                          onClick={() => generateDeckMutation.mutate()}
                          disabled={generateDeckMutation.isPending}
                          className="gap-2"
                          data-testid="button-generate-deck"
                        >
                          {generateDeckMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              Generate Deck
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {pitchDeckLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ) : !pitchDeck || !slides ? (
                      <div className="text-center py-12">
                        <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                          {isOwner
                            ? "Generate a professional pitch deck using AI"
                            : "No pitch deck available yet"}
                        </p>
                      </div>
                    ) : (
                      <div>
                        {/* Slide Display */}
                        <div className="bg-muted rounded-xl p-8 min-h-64 mb-4">
                          <h3 className="text-xl font-semibold mb-4">
                            {slides[currentSlide]?.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {slides[currentSlide]?.content}
                          </p>
                        </div>
                        
                        {/* Navigation */}
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
                            disabled={currentSlide === 0}
                            data-testid="button-prev-slide"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            Slide {currentSlide + 1} of {slides.length}
                          </span>
                          <Button
                            variant="outline"
                            onClick={() =>
                              setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))
                            }
                            disabled={currentSlide === slides.length - 1}
                            data-testid="button-next-slide"
                          >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="mt-6 space-y-6">
                {marketAnalysis ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Target className="w-5 h-5 text-primary" />
                          Market Size
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {marketAnalysis.marketSize}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <TrendingUp className="w-5 h-5 text-blue-500" />
                          Competition
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {marketAnalysis.competition?.map((comp, i) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                              {comp}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            Risks
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {marketAnalysis.risks?.map((risk, i) => (
                              <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2" />
                                {risk}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Sparkles className="w-5 h-5 text-green-500" />
                            Opportunities
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {marketAnalysis.opportunities?.map((opp, i) => (
                              <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                                {opp}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Market analysis will be generated when the startup is posted
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Score Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-center py-4 rounded-xl ${getScoreBg(startup.aiScore || 0)} mb-4`}
                >
                  <span className={`text-5xl font-bold ${getScoreColor(startup.aiScore || 0)}`} data-testid="text-ai-score">
                    {startup.aiScore || "--"}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">out of 100</p>
                </div>

                {scoreBreakdown && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Market Potential</span>
                      <span className={`font-semibold ${getScoreColor(scoreBreakdown.marketPotential)}`}>
                        {scoreBreakdown.marketPotential}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Feasibility</span>
                      <span className={`font-semibold ${getScoreColor(scoreBreakdown.feasibility)}`}>
                        {scoreBreakdown.feasibility}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Innovation</span>
                      <span className={`font-semibold ${getScoreColor(scoreBreakdown.innovation)}`}>
                        {scoreBreakdown.innovation}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Scalability</span>
                      <span className={`font-semibold ${getScoreColor(scoreBreakdown.scalability)}`}>
                        {scoreBreakdown.scalability}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Founder Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Founder</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={startup.founder?.profileImageUrl || undefined}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(startup.founder?.firstName?.[0] || "") +
                        (startup.founder?.lastName?.[0] || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium" data-testid="text-founder-name">
                      {startup.founder?.firstName} {startup.founder?.lastName}
                    </p>
                    {startup.founder?.company && (
                      <p className="text-sm text-muted-foreground">
                        {startup.founder.company}
                      </p>
                    )}
                  </div>
                </div>

                {isInvestor && (
                  <div className="flex flex-col gap-2">
                    <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full gap-2" data-testid="button-contact-founder">
                          <MessageSquare className="w-4 h-4" />
                          Contact Founder
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Send Message</DialogTitle>
                          <DialogDescription>
                            Send a message to {startup.founder?.firstName} about {startup.title}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <Textarea
                            placeholder="Write your message..."
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            className="min-h-32"
                            data-testid="input-message"
                          />
                          <Button
                            className="w-full gap-2"
                            onClick={() => sendMessageMutation.mutate()}
                            disabled={!messageContent.trim() || sendMessageMutation.isPending}
                            data-testid="button-send-message"
                          >
                            {sendMessageMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            Send Message
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => saveMutation.mutate()}
                      disabled={saveMutation.isPending}
                      data-testid="button-save-startup"
                    >
                      {savedStatus?.isSaved ? (
                        <>
                          <BookmarkCheck className="w-4 h-4 text-primary" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Funding Ask */}
            {startup.fundingAsk && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Funding Ask
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    {startup.fundingAsk}
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
