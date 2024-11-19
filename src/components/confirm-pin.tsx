"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import FormInput from "@/components/form-input";
import { DialogClose } from "@radix-ui/react-dialog";
import { useToast } from "@/hooks/use-toast";
import { startTransition } from "react";
import { validatePin } from "@/lib/actions";
import { ApiResponseType } from "@/lib/custom-types";
// import { verifyPin } from "@/lib/actions";
// import { APIResponseObject } from "@/types";
const formSchema = z.object({
  pin: z
    .string()
    .length(4, { message: "Pin must be 4 digits" })
    .regex(/^\d+$/, { message: "Pin must only be digits" }),
});

const ConfirmPin = ({
  id,
  name,
  action,
}: {
  id: string;
  name?: string;
  action: (...args: any) => any;
}) => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pin: "",
    },
  });
  const onSubmit = async ({ pin }: z.infer<typeof formSchema>) => {
    startTransition(() => {
      validatePin(pin).then((data: ApiResponseType) => {
        if (data.success) {
          form.reset();
          toast({
            description: data.message,
          });
          document.getElementById("closeDialog")?.click();
          action();
        } else {
          toast({ variant: "destructive", description: data.message });
        }
      });
    });
  };
  return (
    <Dialog>
      <DialogTrigger className="hidden" id={id} asChild>
        <Button variant="ghost" type="button" size="sm">
          {name || ""}
        </Button>
      </DialogTrigger>

      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
        className="sm:max-w-[425px] md:max-w-[600px] px-12 py-10"
      >
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(onSubmit)();
            }}
          >
            <DialogHeader>
              <DialogTitle>Pin verification</DialogTitle>
              <DialogDescription>Please input your pin</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mb-6">
              <FormInput
                control={form.control}
                name="pin"
                label="Pin"
                type="password"
                placeholder="e.g 1234"
              />
            </div>
            <DialogFooter>
              <Button type="button" onClick={form.handleSubmit(onSubmit)}>
                Verify
              </Button>
              <DialogClose id="closeDialog" />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmPin;
