import { additionalChargeSchema } from "@/lib/zodSchemas";
import { useForm } from "react-hook-form";
import FormInput from "@/components/form-input";
import { Button } from "@/components/ui/button";

import { z } from "zod";
import {
  QueryObserverResult,
  RefetchOptions,
  useMutation,
} from "@tanstack/react-query";
import { ApiResponseType } from "@/lib/custom-types";
import { axiosInstance } from "@/lib/axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdCancel, MdDelete, MdEdit, MdSave } from "react-icons/md";
import ConfirmPin from "../confirm-pin";
import { useToast } from "@/hooks/use-toast";
import { Form } from "../ui/form";

export function AdditionalCharge({
  additionalCharge,
  refetch,
}: {
  additionalCharge: z.infer<typeof additionalChargeSchema> & { id: string };
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<any, Error>>;
}) {
  const form = useForm<z.infer<typeof additionalChargeSchema>>({
    resolver: zodResolver(additionalChargeSchema),
    defaultValues: additionalCharge,
  });
  const [isEditing, setIsEditing] = useState(false);
  const validatePin = () => {
    (
      document.getElementById(`charge-edit-${id}`) as HTMLDialogElement
    )?.click();
  };
  const id = additionalCharge.id;
  const { mutate } = useMutation({
    mutationKey: ["additional-charges", id],
    mutationFn: async function (
      values: z.infer<typeof additionalChargeSchema>
    ) {
      const { data }: { data: ApiResponseType } = await axiosInstance.patch(
        "/vendor/additional-charges/" + id,
        values
      );
      if (!data.success) throw Error(data.message);
      return data;
    },
  });
  const { mutate: mutateDelete } = useMutation({
    mutationKey: ["additional-charges", id],
    mutationFn: async function () {
      const { data }: { data: ApiResponseType } = await axiosInstance.delete(
        "/vendor/additional-charges/" + id
      );
      if (!data.success) throw Error(data.message);
      return data;
    },
  });
  const { toast } = useToast();

  const onSubmit = () => {
    isEditing
      ? mutate(form.getValues(), {
          onSuccess: (data) => {
            toast({ description: data.message });
            setIsEditing(false);
          },
          onError: (data) => {
            toast({ description: data.message, variant: "destructive" });
          },
        })
      : mutateDelete(undefined, {
          onSuccess: (data) => {
            toast({ description: data.message });
            refetch();
          },
          onError: (data) =>
            toast({ description: data.message, variant: "destructive" }),
        });
  };
  return (
    <Form {...form}>
      <form>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <FormInput
            control={form.control}
            inputClass="disabled:opacity-100"
            type="text"
            label="Charge"
            name="charge"
            disabled={!isEditing}
          />
          <div className="flex justify-center gap-4">
            <Button
              size="sm"
              variant={isEditing ? "destructive" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
              type="button"
            >
              {isEditing ? <MdCancel /> : <MdEdit />}
            </Button>
            {isEditing && (
              <Button size="sm" type="button" onClick={validatePin}>
                <MdSave />
              </Button>
            )}
            {!isEditing && (
              <Button
                size="sm"
                type="button"
                variant="destructive"
                onClick={validatePin}
              >
                <MdDelete />
              </Button>
            )}
            <ConfirmPin
              id={`charge-edit-${id}`}
              name="Edit Additional CHarge"
              action={onSubmit}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
