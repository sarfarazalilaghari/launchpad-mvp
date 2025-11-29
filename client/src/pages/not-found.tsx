import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="pt-10 pb-8 text-center">
          <div className="text-8xl font-bold text-primary mb-4">404</div>
          <h1 className="text-2xl font-semibold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline" data-testid="button-go-back">
              <a onClick={() => window.history.back()} className="gap-2 cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </a>
            </Button>
            <Button asChild data-testid="button-go-home">
              <Link href="/">
                <a className="gap-2">
                  <Home className="w-4 h-4" />
                  Home
                </a>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
