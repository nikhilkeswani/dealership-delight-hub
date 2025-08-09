import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const { toast } = useToast();
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Create your DealerDelight account" description="Sign up to launch your dealership site in minutes." noIndex />

      <main className="container py-16">
        <h1 className="text-3xl md:text-4xl font-semibold mb-4">Create your account</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          To enable secure authentication, database, file storage, and bookings, please connect your project to Supabase using Lovable's native integration.
        </p>

        <div className="space-y-4">
          <Button
            variant="hero"
            size="xl"
            onClick={() =>
              toast({
                title: "Supabase required",
                description:
                  "Click the green Supabase button (top right) in Lovable to connect. Then we’ll enable email/password auth and onboarding.",
              })
            }
          >
            Continue with Email (connect Supabase first)
          </Button>

          <p className="text-sm text-muted-foreground">
            Learn more: <a className="underline" href="https://docs.lovable.dev/integrations/supabase/" target="_blank" rel="noreferrer">Supabase integration docs</a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Signup;
