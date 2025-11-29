import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Users, Sparkles, TrendingUp, BarChart3, MessageSquare } from "lucide-react";
import { SiGoogle, SiLinkedin } from "react-icons/si";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-xl tracking-tight">LaunchPad</span>
          </div>
          <Button asChild data-testid="button-login">
            <a href="/api/login">Sign In</a>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Startup Marketplace
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text">
            Where Founders Meet
            <span className="block text-primary">Their Perfect Investors</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Post your startup idea, get AI-powered pitch decks and scoring, 
            and connect with investors who match your vision. The smarter way to fund your dream.
          </p>
          <div className="flex flex-col gap-6 justify-center max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" asChild data-testid="button-get-started-founder">
                <a href="/api/login">Start as Founder</a>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild data-testid="button-get-started-investor">
                <a href="/api/login">Browse as Investor</a>
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or sign in with</span>
              </div>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="lg" className="w-full" asChild data-testid="button-login-google">
                <a href="/api/login?provider=google" className="flex items-center justify-center gap-2">
                  <SiGoogle className="w-5 h-5" />
                  Google
                </a>
              </Button>
              <Button variant="outline" size="lg" className="w-full" asChild data-testid="button-login-linkedin">
                <a href="/api/login?provider=linkedin" className="flex items-center justify-center gap-2">
                  <SiLinkedin className="w-5 h-5" />
                  LinkedIn
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Launch
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform helps founders build compelling pitches and investors discover high-potential startups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Pitch Deck Generator</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Transform your idea into a professional 5-slide pitch deck in seconds with our AI-powered generator.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Idea Scoring</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get instant AI evaluation across market potential, feasibility, innovation, and scalability dimensions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Market Analysis</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Understand your competitive landscape with AI-generated market size estimates and risk assessments.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Investor Matching</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get matched with investors whose focus areas align with your startup's industry and stage.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Direct Messaging</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Connect directly with interested parties through our built-in messaging system.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Launch Ready</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Everything you need to present your startup professionally and start fundraising faster.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">Three simple steps to connect founders and investors</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Post Your Idea</h3>
              <p className="text-muted-foreground">
                Describe your startup vision, problem, solution, and target market. Our AI does the rest.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Get AI Insights</h3>
              <p className="text-muted-foreground">
                Receive automatic scoring, pitch deck generation, and market analysis to strengthen your pitch.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect & Fund</h3>
              <p className="text-muted-foreground">
                Get matched with interested investors and start conversations that lead to funding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Launch Your Startup?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-10">
            Join thousands of founders and investors building the future together.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 py-6"
            asChild
            data-testid="button-cta-get-started"
          >
            <a href="/api/login">Get Started Free</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Rocket className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">LaunchPad</span>
          </div>
          <p className="text-sm text-muted-foreground">
            AI Startup Marketplace. Built for founders, by founders.
          </p>
        </div>
      </footer>
    </div>
  );
}
