import { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState, robustSignOut } from "@/lib/auth";

const Auth = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    // Listen first to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Full refresh to ensure clean state
        window.location.href = "/app";
      }
    });

    // Then load any existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        window.location.href = "/app";
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      cleanupAuthState();
      try { await supabase.auth.signOut({ scope: "global" }); } catch (_) {}

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: "Signed in", description: "Welcome back!" });
      // Redirect handled by onAuthStateChange
    } catch (err: any) {
      toast({ title: "Sign in failed", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      cleanupAuthState();
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl },
      });
      if (error) throw error;
      toast({ title: "Check your email", description: "We sent a confirmation link to complete sign up." });
    } catch (err: any) {
      toast({ title: "Sign up failed", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Log in or Sign up – DealerDelight" description="Access your DealerDelight dashboard with secure email and password authentication." noIndex />

      <main className="container py-16">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {mode === "signin"
              ? "Sign in to manage your website, inventory, leads, bookings, and analytics."
              : "Sign up to launch your dealer website and CRM in minutes."}
          </p>
        </header>

        <article className="max-w-md">
          <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@dealership.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>

            <Button type="submit" variant="hero" size="xl" disabled={loading} aria-label={mode === "signin" ? "Sign in" : "Create account"}>
              {loading ? (mode === "signin" ? "Signing in..." : "Creating account...") : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="mt-4 text-sm text-muted-foreground">
            {mode === "signin" ? (
              <span>
                New here?{" "}
                <button className="underline" onClick={() => setMode("signup")}>Create an account</button>
              </span>
            ) : (
              <span>
                Have an account?{" "}
                <button className="underline" onClick={() => setMode("signin")}>Sign in</button>
              </span>
            )}
          </div>

          <div className="mt-8">
            <Button variant="outline" size="lg" onClick={robustSignOut}>Sign out (if stuck)</Button>
          </div>
        </article>
      </main>
    </div>
  );
};

export default Auth;
