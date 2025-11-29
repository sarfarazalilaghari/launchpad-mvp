import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Rocket, TrendingUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RoleSelect() {
  const [selectedRole, setSelectedRole] = useState<"founder" | "investor" | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (role: string) => {
      return apiRequest("POST", "/api/auth/role", { role });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Redirect based on role after a short delay to ensure query is invalidated
      setTimeout(() => {
        if (data.role === "founder") {
          navigate("/dashboard");
        } else if (data.role === "investor") {
          navigate("/browse");
        }
      }, 100);
    },
    onError: (error) => {
      setSelectedRole(null);
      toast({
        title: "Error",
        description: "Failed to set role. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRoleSelect = (role: "founder" | "investor") => {
    setSelectedRole(role);
    mutation.mutate(role);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to LaunchPad</h1>
          <p className="text-xl text-muted-foreground">
            Choose how you want to use the platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className={`cursor-pointer transition-all hover-elevate ${
              selectedRole === "founder" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => !mutation.isPending && handleRoleSelect("founder")}
            data-testid="card-select-founder"
          >
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">I'm a Founder</CardTitle>
              <CardDescription className="text-base">
                I want to post my startup ideas and connect with investors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Post and manage startup ideas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Generate AI pitch decks
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Get matched with investors
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Receive AI idea scoring
                </li>
              </ul>
              <Button 
                className="w-full mt-6" 
                disabled={mutation.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelect("founder");
                }}
                data-testid="button-confirm-founder"
              >
                {mutation.isPending && selectedRole === "founder" ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Continue as Founder
              </Button>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover-elevate ${
              selectedRole === "investor" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => !mutation.isPending && handleRoleSelect("investor")}
            data-testid="card-select-investor"
          >
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">I'm an Investor</CardTitle>
              <CardDescription className="text-base">
                I want to discover promising startups and connect with founders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Browse startup ideas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Filter by industry & score
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Save interesting startups
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Contact founders directly
                </li>
              </ul>
              <Button 
                className="w-full mt-6" 
                disabled={mutation.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelect("investor");
                }}
                data-testid="button-confirm-investor"
              >
                {mutation.isPending && selectedRole === "investor" ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Continue as Investor
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
