import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDealer } from "@/hooks/useDealer";
import { useDealerProfile } from "@/hooks/useDealerProfile";
import { AccountSecurityCard } from "@/components/settings/AccountSecurityCard";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  business_name: z.string().min(2, "Business name is required"),
  contact_email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  website_url: z.string().url("Enter a valid URL").optional().or(z.literal("")).transform((v) => v || undefined),
});

type FormValues = z.infer<typeof schema>;

const Profile: React.FC = () => {
  const { data: dealer, isLoading } = useDealer();
  const { updateProfile, isUpdating } = useDealerProfile();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      business_name: "",
      contact_email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      website_url: "",
    },
  });

  // Populate form with current dealer data
  useEffect(() => {
    if (dealer) {
      form.reset({
        business_name: dealer.business_name,
        contact_email: dealer.contact_email,
        phone: dealer.phone || "",
        address: dealer.address || "",
        city: dealer.city || "",
        state: dealer.state || "",
        zip_code: dealer.zip_code || "",
        website_url: dealer.website_url || "",
      });
    }
  }, [dealer, form]);

  const onSubmit = (values: FormValues) => {
    updateProfile({
      business_name: values.business_name,
      contact_email: values.contact_email,
      phone: values.phone || null,
      address: values.address || null,
      city: values.city || null,
      state: values.state || null,
      zip_code: values.zip_code || null,
      website_url: values.website_url || null,
    });
  };

  if (isLoading) {
    return (
      <main className="space-y-6">
        <SEO title="Profile & Account | Dealer CRM" description="Manage your personal details and account settings." />
        <PageHeader title="Profile & Account" description="Update your personal information and preferences" />
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <SEO title="Profile & Account | Dealer CRM" description="Manage your personal details and account settings." />
      <PageHeader title="Profile & Account" description="Update your personal information and preferences" />
      
      <section className="grid gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  {/* ... keep existing form fields ... */}
                  <FormField
                    control={form.control}
                    name="business_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business name</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Auto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@dealer.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zip_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP</FormLabel>
                          <FormControl>
                            <Input placeholder="ZIP Code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={isUpdating}
                      className="min-w-[120px]"
                    >
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.reset()}
                      disabled={isUpdating}
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <AccountSecurityCard />
        </div>
      </section>
    </main>
  );
};

export default Profile;
