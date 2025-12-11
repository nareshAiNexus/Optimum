import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Mail, Lock, Sparkles, ArrowLeft, ShieldCheck } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, sendVerificationEmail } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
        toast({ title: "Signed in", description: "Welcome back!" });
      } else {
        await signUpWithEmail(email, password);
        toast({
          title: "Account created",
          description: "Check your inbox for a verification email.",
        });
      }
      setLocation("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      toast({ title: "Signed in with Google" });
      setLocation("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google sign-in failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setError(null);
    try {
      await sendVerificationEmail();
      toast({ title: "Verification email sent", description: "Please check your inbox." });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send verification email");
    }
  };

  const isVerified = user?.emailVerified;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <span className="text-xs text-muted-foreground">OPTIMUM</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-5 h-5 text-primary" />
              {mode === "signin" ? "Sign in" : "Create an account"}
            </CardTitle>
            <CardDescription>
              {mode === "signin"
                ? "Use your email and password or continue with Google."
                : "Sign up with email and verify your address to save quiz results."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {user && !loading && !isVerified && (
              <div className="flex items-start gap-2 rounded-md border border-yellow-300/60 bg-yellow-50/80 px-3 py-2 text-xs text-yellow-900">
                <ShieldCheck className="w-4 h-4 mt-0.5" />
                <div>
                  <p className="font-medium">Email not verified</p>
                  <p className="mt-0.5">
                    We've sent a verification email to <span className="font-semibold">{user.email}</span>. After verifying, refresh the page.
                  </p>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="mt-1 text-xs font-medium text-primary hover:underline"
                  >
                    Resend verification email
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1 rounded-full bg-secondary/60 p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`flex-1 px-3 py-1 rounded-full text-center ${
                  mode === "signin" ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 px-3 py-1 rounded-full text-center ${
                  mode === "signup" ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
              >
                Sign up
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </span>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full mt-1"
                disabled={submitting || !email || !password}
              >
                {submitting ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex-1 h-px bg-border" />
              <span>or</span>
              <span className="flex-1 h-px bg-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={handleGoogle}
              disabled={submitting}
            >
              <Sparkles className="w-4 h-4" />
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
