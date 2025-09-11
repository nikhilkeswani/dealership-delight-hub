import { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

      <div className="min-h-screen bg-background">
        <div className="grid min-h-screen lg:grid-cols-2">
          {/* Hero Section */}
          <div className="relative flex flex-col justify-center px-8 py-12 lg:px-12 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
              <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full blur-3xl opacity-15" style={{ background: "var(--gradient-primary)" }} />
              <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-15" style={{ background: "var(--gradient-primary)" }} />
            </div>
            
            <div className="relative max-w-md space-y-8 animate-fade-in">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md" style={{ background: "var(--gradient-primary)" }} />
                  <span className="text-xl font-semibold">DealerDelight</span>
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                    {mode === "signin" ? "Welcome back" : "Start your journey"}
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    {mode === "signin" 
                      ? "Access your dealer management dashboard and grow your business"
                      : "Launch your professional dealer website in minutes, no coding required"
                    }
                  </p>
                </div>
              </div>

              <div className="rounded-xl border bg-card/60 backdrop-blur p-6 space-y-4">
                <h3 className="font-medium">What you'll get:</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-medium">✓</span>
                    </div>
                    <span className="text-muted-foreground">Professional dealer website</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-medium">✓</span>
                    </div>
                    <span className="text-muted-foreground">Lead management & CRM tools</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-medium">✓</span>
                    </div>
                    <span className="text-muted-foreground">Analytics & performance tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Form */}
          <div className="relative flex items-center justify-center px-8 py-12 lg:px-12">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 pointer-events-none opacity-5" aria-hidden>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full blur-3xl" style={{ background: "var(--gradient-primary)" }} />
            </div>
            
            <div className="relative w-full max-w-sm">
              <div className="rounded-xl border bg-card/60 backdrop-blur p-8 space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold">
                    {mode === "signin" ? "Sign in" : "Create account"}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {mode === "signin" 
                      ? "Welcome back! Please enter your details"
                      : "Join thousands of successful dealers"
                    }
                  </p>
                </div>
              <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
                <TabsList className="grid grid-cols-2 w-full mb-6">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Create account</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        placeholder="you@dealership.com"
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <button 
                          type="button" 
                          className="text-sm text-primary hover:underline" 
                          onClick={handleForgotPassword}
                          disabled={loading}
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"} 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          required 
                          placeholder="••••••••"
                          className="h-12"
                        />
                        <button 
                          type="button" 
                          aria-label="Toggle password visibility" 
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" 
                          onClick={() => setShowPassword((s) => !s)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      variant="hero" 
                      size="lg" 
                      disabled={loading} 
                      aria-label="Sign in" 
                      className="w-full h-12"
                    >
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
                  <form onSubmit={handleSignUp} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email2">Email</Label>
                      <Input 
                        id="email2" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        placeholder="you@dealership.com"
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password2">Password</Label>
                      <Input 
                        id="password2" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        placeholder="Create a strong password"
                        className="h-12"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      variant="hero" 
                      size="lg" 
                      disabled={loading} 
                      aria-label="Create account" 
                      className="w-full h-12"
                    >
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

                <div className="text-center text-sm text-muted-foreground">
                  {mode === "signin" ? (
                    <span>
                      New here? <button className="text-primary hover:underline" onClick={() => setMode("signup")}>Create an account</button>
                    </span>
                  ) : (
                    <span>
                      Have an account? <button className="text-primary hover:underline" onClick={() => setMode("signin")}>Sign in</button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;