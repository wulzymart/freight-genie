import { createFileRoute, redirect, useRouter, useLoaderData } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/auth-context";
import React from "react";
const loginSchema = z.object({
  email: z.string().email({
    message: "Email is required.",
  }),
  password: z.string().min(1, { message: "Password is required" }),
});
export default function LoginForm() {
  const { login } = useAuth();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = React.useCallback(
    async ({ email, password }: z.infer<typeof loginSchema>) => {
      await login(email, password);
      await router.navigate({ to: "/dashboard" });
      navigate({ to: "/dashboard" });
    },
    []
  );
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="m@example.com"
                        required
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" required />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

export const Route = createFileRoute("/(unauthenticated)/login")({
  beforeLoad: ({ context }) => {
    const { isAuthenticated } = context.auth;
    console.log(isAuthenticated);

    if (isAuthenticated) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: () => {
      const {logo} = useLoaderData({from: '__root__'})
     return <section className="w-full flex flex-col items-center justify-center h-screen gap-y-6">
         <div className="flex gap-4 w-fit items-center justify-center">
             <img
                 alt="Freight Genie logo"
                 src="/freight-genie-logo.png"
                 height={100}
                 width={100}
             />{logo && <img
             alt="Company Logo"
             src={logo}
             height={100}
             width={100}
         />}
         </div>
         <LoginForm/>
     </section>
  },
});
