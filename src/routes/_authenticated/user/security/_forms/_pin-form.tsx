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

import { pinSchema } from "@/lib/zodSchemas";
import { useAuth } from "@/hooks/auth-context";
import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

export default function PinForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    data: hasPin,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryFn: async () => {
      const res = await axiosInstance.get(`/vendor/users/${user?.id}/has-pin`);
      const { data } = res;
      return data.hasPin;
    },
    queryKey: ["has-pin"],
  });
  const { mutate } = useMutation({
    mutationFn: async (data: z.infer<typeof pinSchema>) => {
      if (!data.oldPin) data.oldPin = undefined;
      const { data: res } = await axiosInstance.patch(
        `/vendor/users/change-pin`,
        data
      );
      return res;
    },
    mutationKey: ["has-pin"],
  });
  const form = useForm<z.infer<typeof pinSchema>>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      oldPin: hasPin ? "" : undefined,
      newPin: "",
      password: "",
    },
  });
  const onSubmit = (values: z.infer<typeof pinSchema>) => {
    mutate(values, {
      onSuccess: (data) => {
        toast({
          description: data.message,
        });
        refetch();
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
  return isLoading || isError ? (
    <>Loading</>
  ) : (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, () => {
          console.log(form.formState.errors);
          console.log(form.getValues());
        })}
      >
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Update Pin</CardTitle>
            <CardDescription>Update your pin.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              {hasPin ? (
                <FormField
                  name="oldPin"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="password">Old Pin</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" required />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                ""
              )}
            </div>
            <div className="grid gap-2">
              <FormField
                name="newPin"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password">New Pin</FormLabel>
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
              Change pin
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

export const Route = createFileRoute(
  "/_authenticated/user/security/_forms/_pin-form"
)({
  component: () => <div>Hello /user/security/_forms/_pin-form!</div>,
});
