import { itemTypeSchema } from "@/lib/zodSchemas";
import { useForm } from "react-hook-form";
import FormInput from "@/components/form-input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import {
  QueryObserverResult,
  RefetchOptions,
  useMutation,
} from "@tanstack/react-query";
import { ApiResponseType, TypePricing } from "@/lib/custom-types";
import { axiosInstance } from "@/lib/axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdCancel, MdDelete, MdEdit, MdSave } from "react-icons/md";
import ConfirmPin from "../confirm-pin";
import { useToast } from "@/hooks/use-toast";

export function ItemType({
  itemType,
  refetch,
}: {
  itemType: z.infer<typeof itemTypeSchema> & { id: string };
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<any, Error>>;
}) {
  const form = useForm<z.infer<typeof itemTypeSchema>>({
    resolver: zodResolver(itemTypeSchema),
    defaultValues: itemType,
  });
  const [isEditing, setIsEditing] = useState(false);
  const validatePin = () => {
    (document.getElementById(`type-edit-${id}`) as HTMLDialogElement)?.click();
  };
  const id = itemType.id;
  const { mutate } = useMutation({
    mutationKey: ["item-types", id],
    mutationFn: async function (values: z.infer<typeof itemTypeSchema>) {
      const { data }: { data: ApiResponseType } = await axiosInstance.patch(
        "/vendor/item-types/" + id,
        values
      );
      if (!data.success) throw Error(data.message);
      return data;
    },
  });
  const { mutate: mutateDelete } = useMutation({
    mutationKey: ["item-types", id],
    mutationFn: async function () {
      const { data }: { data: ApiResponseType } = await axiosInstance.delete(
        "/vendor/item-types/" + id
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
          onError: (data) => {
            toast({ description: data.message, variant: "destructive" });
          },
        });
  };
  const pricing = form.watch("pricing");
  return (
    <Form {...form}>
      <form>
        <div className="grid grid-cols-1 lg:flex gap-6 items-end justify-center pb-4 border-b-2 border-gray-200">
          <FormInput
            inputClass="disabled:opacity-100"
            control={form.control}
            type="text"
            label="Name"
            name="name"
            disabled={!isEditing}
          />
          <FormField
            control={form.control}
            name="pricing"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Pricing Style</FormLabel>
                <FormControl>
                  <Select
                    disabled={!isEditing}
                    onValueChange={(value) => {
                      field.onChange(value);
                      value === TypePricing.PER_KG
                        ? form.resetField("limit")
                        : form.setValue("limit", undefined);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger className="w-full disabled:opacity-100">
                      {field.value ? (
                        field.value
                      ) : (
                        <SelectValue
                          placeholder="Select Type"
                          className="w-full"
                        />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TypePricing).map((type: any) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {pricing === TypePricing.PER_KG && (
           <> <FormInput
               inputClass="disabled:opacity-100"
               control={form.control}
               type="number"
               label="Minimum item weight (Kg)"
               name="min"
               disabled={!isEditing}
           /> <FormInput
               inputClass="disabled:opacity-100"
               control={form.control}
               type="number"
               label="Maximum item weight (Kg)"
               name="limit"
               disabled={!isEditing}
           /></>
          )}
          <FormInput
            inputClass="disabled:opacity-100"
            control={form.control}
            type="number"
            label={`Price (Naira) (${pricing})`}
            name="price"
            disabled={!isEditing}
          />
          <div className="flex justify-center gap-4">
            <Button
              size="sm"
              variant={isEditing ? "destructive" : "outline"}
              onClick={() => {
                isEditing && form.reset();
                setIsEditing(!isEditing);
              }}
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
              id={`type-edit-${id}`}
              name="Edit Item Type"
              action={onSubmit}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
