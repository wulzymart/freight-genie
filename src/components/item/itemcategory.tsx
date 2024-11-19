import { itemCategorySchema } from "@/lib/zodSchemas";
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

export function ItemCategory({
  itemCategory,
  refetch,
}: {
  itemCategory: z.infer<typeof itemCategorySchema> & { id: string };
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<any, Error>>;
}) {
  const form = useForm<z.infer<typeof itemCategorySchema>>({
    resolver: zodResolver(itemCategorySchema),
    defaultValues: itemCategory,
  });
  const [isEditing, setIsEditing] = useState(false);
  const validatePin = () => {
    (
      document.getElementById(`category-edit-${id}`) as HTMLDialogElement
    )?.click();
  };
  const id = itemCategory.id;
  const { mutate } = useMutation({
    mutationKey: ["item-categories", id],
    mutationFn: async function (values: z.infer<typeof itemCategorySchema>) {
      const { data }: { data: ApiResponseType } = await axiosInstance.patch(
        "/vendor/item-categories/" + id,
        values
      );
      if (!data.success) throw Error(data.message);
      return data;
    },
  });
  const { mutate: mutateDelete } = useMutation({
    mutationKey: ["item-categories", id],
    mutationFn: async function () {
      const { data }: { data: ApiResponseType } = await axiosInstance.delete(
        "/vendor/item-categories/" + id
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInput
            control={form.control}
            inputClass="disabled:opacity-100"
            type="text"
            label="Name"
            name="name"
            disabled={!isEditing}
          />
          <FormInput
            control={form.control}
            inputClass="disabled:opacity-100"
            type="number"
            label="Price Factor"
            name="priceFactor"
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
              <Button size="sm" variant="destructive">
                <MdDelete />
              </Button>
            )}
            <ConfirmPin
              id={`category-edit-${id}`}
              name="Edit Item Category"
              action={onSubmit}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
