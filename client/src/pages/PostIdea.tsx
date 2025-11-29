import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Sparkles, Rocket } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  problem: z.string().min(30, "Problem statement must be at least 30 characters"),
  solution: z.string().min(30, "Solution must be at least 30 characters"),
  targetMarket: z.string().min(20, "Target market must be at least 20 characters"),
  industry: z.string().min(1, "Please select an industry"),
  stage: z.string().min(1, "Please select a stage"),
  businessModel: z.string().optional(),
  geography: z.string().optional(),
  fundingAsk: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

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
  { value: "idea", label: "Idea Stage - Just an idea, no product yet" },
  { value: "mvp", label: "MVP - Minimum viable product built" },
  { value: "growth", label: "Growth - Product-market fit achieved" },
  { value: "scale", label: "Scale - Scaling operations" },
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

const FUNDING_ASKS = [
  "Pre-seed ($50K-$500K)",
  "Seed ($500K-$2M)",
  "Series A ($2M-$15M)",
  "Series B ($15M-$50M)",
  "Not seeking funding",
];

export default function PostIdea() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      problem: "",
      solution: "",
      targetMarket: "",
      industry: "",
      stage: "",
      businessModel: "",
      geography: "",
      fundingAsk: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/startups", data);
    },
    onSuccess: (startup: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/startups/my"] });
      toast({
        title: "Success!",
        description: "Your startup idea has been posted. AI is analyzing it now.",
      });
      navigate(`/startup/${startup.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to post your idea. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Post Your Startup Idea</h1>
          <p className="text-muted-foreground">
            Share your vision and let AI help you create a compelling pitch
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              Startup Details
            </CardTitle>
            <CardDescription>
              Fill in the details about your startup. Our AI will analyze your idea and generate 
              a professional pitch deck and market analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Startup Name / Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., EcoTrack - Sustainable Living Platform" 
                          {...field} 
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brief Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your startup in 2-3 sentences..."
                          className="min-h-24"
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormDescription>
                        A concise overview that captures the essence of your startup
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="problem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem Statement</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What problem are you solving? Why does it matter?"
                          className="min-h-24"
                          {...field}
                          data-testid="input-problem"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="solution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Solution</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="How does your product/service solve this problem?"
                          className="min-h-24"
                          {...field}
                          data-testid="input-solution"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetMarket"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Market</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Who are your target customers? What's the market size?"
                          className="min-h-24"
                          {...field}
                          data-testid="input-target-market"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-industry">
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {INDUSTRIES.map((industry) => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stage</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-stage">
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STAGES.map((stage) => (
                              <SelectItem key={stage.value} value={stage.value}>
                                {stage.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="businessModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Model (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-business-model">
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BUSINESS_MODELS.map((model) => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="geography"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Geography (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-geography">
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {GEOGRAPHIES.map((geo) => (
                              <SelectItem key={geo} value={geo}>
                                {geo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="fundingAsk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Funding Ask (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-funding">
                            <SelectValue placeholder="Select funding range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FUNDING_ASKS.map((funding) => (
                            <SelectItem key={funding} value={funding}>
                              {funding}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="gap-2"
                    data-testid="button-submit"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Post & Analyze
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    AI will score your idea and generate a pitch deck
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
