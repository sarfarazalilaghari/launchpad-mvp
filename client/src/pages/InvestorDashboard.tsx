import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import StartupCard from "@/components/StartupCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Startup } from "@shared/schema";

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "E-commerce",
  "Education",
  "Entertainment",
  "Real Estate",
  "Food & Beverage",
  "Transportation",
  "Energy",
  "Other",
];

const STAGES = [
  { value: "idea", label: "Idea Stage" },
  { value: "mvp", label: "MVP" },
  { value: "growth", label: "Growth" },
  { value: "scale", label: "Scale" },
];

const BUSINESS_MODELS = [
  "SaaS",
  "Marketplace",
  "E-commerce",
  "Subscription",
  "Freemium",
  "Advertising",
  "Transaction Fee",
  "Licensing",
  "Other",
];

const GEOGRAPHIES = [
  "North America",
  "Europe",
  "Asia",
  "South America",
  "Africa",
  "Australia",
  "Global",
];

export default function InvestorDashboard() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    industry: "",
    stage: "",
    businessModel: "",
    geography: "",
    minScore: 0,
    maxScore: 100,
  });

  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.set("search", filters.search);
  if (filters.industry) queryParams.set("industry", filters.industry);
  if (filters.stage) queryParams.set("stage", filters.stage);
  if (filters.businessModel) queryParams.set("businessModel", filters.businessModel);
  if (filters.geography) queryParams.set("geography", filters.geography);
  if (filters.minScore > 0) queryParams.set("minScore", filters.minScore.toString());
  if (filters.maxScore < 100) queryParams.set("maxScore", filters.maxScore.toString());

  const { data: startups, isLoading } = useQuery<Startup[]>({
    queryKey: ["/api/startups", queryParams.toString()],
  });

  const clearFilters = () => {
    setFilters({
      search: "",
      industry: "",
      stage: "",
      businessModel: "",
      geography: "",
      minScore: 0,
      maxScore: 100,
    });
  };

  const hasActiveFilters = 
    filters.industry || 
    filters.stage || 
    filters.businessModel || 
    filters.geography || 
    filters.minScore > 0 || 
    filters.maxScore < 100;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover Startups</h1>
          <p className="text-muted-foreground">
            Find and evaluate high-potential startup ideas
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search startups..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <Button
            variant={showFilters ? "secondary" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
            data-testid="button-toggle-filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Filters</CardTitle>
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="gap-1 text-muted-foreground"
                    data-testid="button-clear-filters"
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select
                    value={filters.industry}
                    onValueChange={(value) => setFilters({ ...filters, industry: value })}
                  >
                    <SelectTrigger data-testid="select-industry">
                      <SelectValue placeholder="All industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All industries</SelectItem>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Stage</Label>
                  <Select
                    value={filters.stage}
                    onValueChange={(value) => setFilters({ ...filters, stage: value })}
                  >
                    <SelectTrigger data-testid="select-stage">
                      <SelectValue placeholder="All stages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All stages</SelectItem>
                      {STAGES.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Business Model</Label>
                  <Select
                    value={filters.businessModel}
                    onValueChange={(value) => setFilters({ ...filters, businessModel: value })}
                  >
                    <SelectTrigger data-testid="select-business-model">
                      <SelectValue placeholder="All models" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All models</SelectItem>
                      {BUSINESS_MODELS.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Geography</Label>
                  <Select
                    value={filters.geography}
                    onValueChange={(value) => setFilters({ ...filters, geography: value })}
                  >
                    <SelectTrigger data-testid="select-geography">
                      <SelectValue placeholder="All regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All regions</SelectItem>
                      {GEOGRAPHIES.map((geo) => (
                        <SelectItem key={geo} value={geo}>
                          {geo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label>AI Score Range</Label>
                    <span className="text-sm text-muted-foreground">
                      {filters.minScore} - {filters.maxScore}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Slider
                      value={[filters.minScore, filters.maxScore]}
                      onValueChange={([min, max]) =>
                        setFilters({ ...filters, minScore: min, maxScore: max })
                      }
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                      data-testid="slider-score-range"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${startups?.length || 0} startups found`}
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
        ) : startups?.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No startups found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search terms
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startups?.map((startup) => (
              <StartupCard key={startup.id} startup={startup} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
