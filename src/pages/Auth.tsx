import { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState, robustSignOut } from "@/lib/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { errorHandlers, withErrorHandling } from "@/lib/errors";
import LoadingState from "@/components/common/LoadingState";

const Auth = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);

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
    
    const result = await withErrorHandling(async () => {
      cleanupAuthState();
      try { await supabase.auth.signOut({ scope: "global" }); } catch (_) {}

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      toast({ title: "Signed in", description: "Welcome back!" });
      // Redirect handled by onAuthStateChange
    }, 'sign in');

    setLoading(false);
    return result;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await withErrorHandling(async () => {
      cleanupAuthState();
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl },
      });
      if (error) throw error;
      
      toast({ title: "Check your email", description: "We sent a confirmation link to complete sign up." });
    }, 'sign up');

    setLoading(false);
    return result;
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: "Enter your email first", variant: "destructive" });
      return;
    }

    await withErrorHandling(async () => {
      const redirectTo = `${window.location.origin}/auth`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      
      toast({ title: "Reset email sent", description: "Check your inbox to continue." });
    }, 'password reset');
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Log in or Sign up – DealerDelight" description="Access your DealerDelight dashboard with secure email and password authentication." noIndex />

      <main className="container grid min-h-screen items-center py-8 lg:grid-cols-2 gap-8">
        <aside className="hidden lg:block p-8 rounded-2xl bg-gradient-to-b from-primary/10 to-muted border">
          <h2 className="text-3xl font-semibold">DealerDelight</h2>
          <p className="text-muted-foreground mt-2 max-w-md">All-in-one dealer marketing website and CRM. Launch fast, manage leads, and close more deals.</p>
          <ul className="mt-6 space-y-3 text-sm">
            <li>• Beautiful, responsive website</li>
            <li>• CRM with leads, customers and sales</li>
            <li>• Easy customization and analytics</li>
          </ul>
        </aside>

        <section>
          <header className="mb-6">
            <h1 className="text-3xl md:text-4xl font-semibold">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
            <p className="text-muted-foreground mt-2">{mode === "signin" ? "Sign in to manage your website, inventory, leads, and analytics." : "Sign up to launch your dealer website and CRM in minutes."}</p>
          </header>

          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>{mode === "signin" ? "Sign in" : "Create account"}</CardTitle>
              <CardDescription>Use your work email and a secure password.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Create account</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@dealership.com" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <button 
                          type="button" 
                          className="text-sm underline hover:no-underline" 
                          onClick={handleForgotPassword}
                          disabled={loading}
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
                        <button type="button" aria-label="Toggle password visibility" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword((s) => !s)}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" variant="hero" size="xl" disabled={loading} aria-label="Sign in" className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign in"
                      )}
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email2">Email</Label>
                      <Input id="email2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@dealership.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password2">Password</Label>
                      <Input id="password2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Create a strong password" />
                    </div>
                    <Button type="submit" variant="hero" size="xl" disabled={loading} aria-label="Create account" className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-4 text-sm text-muted-foreground">
                {mode === "signin" ? (
                  <span>
                    New here? <button className="underline" onClick={() => setMode("signup")}>Create an account</button>
                  </span>
                ) : (
                  <span>
                    Have an account? <button className="underline" onClick={() => setMode("signin")}>Sign in</button>
                  </span>
                )}
              </div>

              <div className="mt-6">
                <Button variant="outline" size="lg" onClick={robustSignOut}>Sign out (if stuck)</Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Auth;
