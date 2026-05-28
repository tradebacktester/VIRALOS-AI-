import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">404</h1>
          <p className="text-muted-foreground mt-1">Page not found</p>
        </div>
        <Link href="/">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
