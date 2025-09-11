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
        <div className="grid min-h-screen xl:grid-cols-5 lg:grid-cols-3">
          {/* Hero Section - Takes more space on larger screens */}
          <div className="relative xl:col-span-3 lg:col-span-2 flex flex-col justify-center px-6 py-12 sm:px-8 lg:px-16 xl:px-20 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
              <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full blur-3xl opacity-20" style={{ background: "var(--gradient-primary)" }} />
              <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full blur-3xl opacity-15" style={{ background: "var(--gradient-primary)" }} />
              <div className="absolute top-1/4 right-1/4 h-48 w-48 rounded-full blur-3xl opacity-10" style={{ background: "var(--gradient-primary)" }} />
            </div>
            
            <div className="relative max-w-2xl mx-auto lg:mx-0 space-y-12 animate-fade-in">
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl" style={{ background: "var(--gradient-primary)" }} />
                  <span className="text-2xl font-bold">DealerDelight</span>
                </div>
                <div className="space-y-6">
                  <h1 className="text-4xl md:text-6xl font-[600] leading-tight">
                    {mode === "signin" ? (
                      <>Welcome back to your <span className="text-primary">dealer hub</span></>
                    ) : (
                      <>Start your <span className="text-primary">dealer journey</span> today</>
                    )}
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-xl">
                    {mode === "signin" 
                      ? "Access your complete dealer management dashboard and continue growing your automotive business with powerful tools and insights."
                      : "Launch your professional dealer website in minutes. No coding required, no setup fees. Join thousands of successful dealers already using our platform."
                    }
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="rounded-2xl border bg-card/60 backdrop-blur p-8 space-y-6">
                  <h3 className="font-medium text-lg">Core Features</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-lg">✓</span>
                      </div>
                      <div>
                        <div className="font-medium">Professional Website</div>
                        <div className="text-sm text-muted-foreground">Custom dealer website with your branding</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-lg">✓</span>
                      </div>
                      <div>
                        <div className="font-medium">Lead Management</div>
                        <div className="text-sm text-muted-foreground">Advanced CRM and lead tracking tools</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-2xl border bg-card/60 backdrop-blur p-8 space-y-6">
                  <h3 className="font-medium text-lg">Growth Tools</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-lg">✓</span>
                      </div>
                      <div>
                        <div className="font-medium">Analytics Dashboard</div>
                        <div className="text-sm text-muted-foreground">Performance tracking and insights</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-lg">✓</span>
                      </div>
                      <div>
                        <div className="font-medium">Inventory Management</div>
                        <div className="text-sm text-muted-foreground">Easy vehicle listing and updates</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Form - Optimized width */}
          <div className="relative xl:col-span-2 lg:col-span-1 flex items-center justify-center px-6 py-12 sm:px-8 lg:px-12">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 pointer-events-none opacity-5" aria-hidden>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full blur-3xl" style={{ background: "var(--gradient-primary)" }} />
            </div>
            
            <div className="relative w-full max-w-md">
              <div className="rounded-2xl border bg-card/80 backdrop-blur p-10 space-y-8 animate-fade-in shadow-2xl" style={{ animationDelay: "0.1s" }}>
                <div className="text-center space-y-3">
                  <h2 className="text-3xl font-semibold">
                    {mode === "signin" ? "Sign in" : "Create account"}
                  </h2>
                  <p className="text-muted-foreground">
                    {mode === "signin" 
                      ? "Welcome back! Please enter your details"
                      : "Join thousands of successful dealers"
                    }
                  </p>
                </div>
              <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
                <TabsList className="grid grid-cols-2 w-full mb-8">
                  <TabsTrigger value="signin" className="text-base py-3">Sign in</TabsTrigger>
                  <TabsTrigger value="signup" className="text-base py-3">Create account</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-base">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        placeholder="you@dealership.com"
                        className="h-14 text-base"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-base">Password</Label>
                        <button 
                          type="button" 
                          className="text-sm text-primary hover:underline font-medium" 
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
                          className="h-14 text-base pr-12"
                        />
                        <button 
                          type="button" 
                          aria-label="Toggle password visibility" 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" 
                          onClick={() => setShowPassword((s) => !s)}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      variant="hero" 
                      size="lg" 
                      disabled={loading} 
                      aria-label="Sign in" 
                      className="w-full h-14 text-base font-semibold"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign in"
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="email2" className="text-base">Email</Label>
                      <Input 
                        id="email2" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        placeholder="you@dealership.com"
                        className="h-14 text-base"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="password2" className="text-base">Password</Label>
                      <Input 
                        id="password2" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        placeholder="Create a strong password"
                        className="h-14 text-base"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      variant="hero" 
                      size="lg" 
                      disabled={loading} 
                      aria-label="Create account" 
                      className="w-full h-14 text-base font-semibold"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

                <div className="text-center text-muted-foreground">
                  {mode === "signin" ? (
                    <span>
                      New here? <button className="text-primary hover:underline font-medium" onClick={() => setMode("signup")}>Create an account</button>
                    </span>
                  ) : (
                    <span>
                      Have an account? <button className="text-primary hover:underline font-medium" onClick={() => setMode("signin")}>Sign in</button>
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