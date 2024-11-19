import { createFileRoute } from "@tanstack/react-router";
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
import { changePasswordSchema } from "@/lib/zodSchemas";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

export default function PasswordForm() {
  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const { toast } = useToast();
  const { mutate } = useMutation({
    mutationFn: async (data: z.infer<typeof changePasswordSchema>) => {
      const { data: res } = await axiosInstance.patch(
        `/vendor/users/change-password`,
        data
      );
      return res;
    },
  });
  const onSubmit = (data: z.infer<typeof changePasswordSchema>) => {
    mutate(data, {
      onSuccess: (data) => {
        toast({
          description: data.message,
        });
        form.reset();
      },
      onError: (data) => {
        toast({
          description: data.message,
          variant: "destructive",
        });
      },
    });
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Change Password</CardTitle>
            <CardDescription>Change your login password here.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <FormField
                name="oldPassword"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password">Old Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" required />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              <FormField
                name="newPassword"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password">New Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" required />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              <FormField
                name="confirmPassword"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password">Confirm Password</FormLabel>
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
              Change password
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

export const Route = createFileRoute(
  "/_authenticated/user/security/_forms/_password-form"
)({
  component: () => <div>Hello /user/security/_forms/_password-form!</div>,
});
