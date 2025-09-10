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

      <main className="min-h-screen lg:grid lg:grid-cols-5">
        {/* Left Hero Section */}
        <aside className="relative lg:col-span-2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 lg:p-12 flex flex-col justify-center text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/5 to-black/20" />
          <div className="relative z-10">
            <div className="mb-8">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">DealerDelight</h2>
              <p className="text-lg text-white/90 mb-8 max-w-lg">
                All-in-one dealer marketing website and CRM. Launch fast, manage leads, and close more deals.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mt-1">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Beautiful Website</h3>
                  <p className="text-sm text-white/80">Responsive, professional design that converts visitors</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mt-1">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Complete CRM</h3>
                  <p className="text-sm text-white/80">Manage leads, customers, and sales in one place</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mt-1">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Easy Analytics</h3>
                  <p className="text-sm text-white/80">Track performance and grow your business</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Auth Section */}
        <section className="lg:col-span-3 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            <header className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-semibold mb-3">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-muted-foreground">
                {mode === "signin" 
                  ? "Sign in to manage your website, inventory, leads, and analytics." 
                  : "Sign up to launch your dealer website and CRM in minutes."}
              </p>
            </header>

            <div className="space-y-6">
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
        </section>
      </main>
    </div>
  );
};

export default Auth;