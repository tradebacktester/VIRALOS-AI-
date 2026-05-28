import { SignIn } from "@clerk/react";
import { Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function AuthPage() {
  const [location] = useLocation();
  const isSignUp = location.includes("sign-up");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-accent/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center glow-blue">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold gradient-text tracking-tight">VIRALOS AI</h1>
            <p className="text-sm text-muted-foreground mt-1">Autonomous Viral Content OS</p>
          </div>
        </div>

        <SignIn
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-card border border-card-border shadow-xl rounded-xl",
              headerTitle: "text-foreground font-bold",
              headerSubtitle: "text-muted-foreground",
              formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
              formFieldInput: "bg-input border-border text-foreground",
              formFieldLabel: "text-foreground",
              footerActionLink: "text-primary hover:text-primary/80",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground",
              socialButtonsIconButton: "border-border bg-secondary hover:bg-secondary/80",
            },
          }}
        />
      </div>
    </div>
  );
}
