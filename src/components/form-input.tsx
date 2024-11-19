import { string } from "zod";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Control } from "react-hook-form";
import {capitalizeFirstLetter} from "@/lib/utils.ts";

const FormInput = ({
  control,
  name,
  label,
  type,
  placeholder,
  message,
  inputClass,
  caseTransform,
  disabled,
    capitalize,
  description,
}: {
  control?: Control<any>;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  message?: string;
  inputClass?: string;
  caseTransform?: "upper" | "lower";
  capitalize?: boolean
  disabled?: boolean;
  description?: string;
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel>{label}</FormLabel>
          <FormDescription>{description}</FormDescription>
          <FormControl>
            <div className="relative">
              <Input
                disabled={disabled}
                type={type}
                {...field}
                onChange={(e) => {
                  let value: string | number = e.currentTarget.value
                  if (type === 'number') value = +value
                  else if (caseTransform) {
                    if (caseTransform === 'upper') value = value.toUpperCase()
                    else value = value.toLowerCase()
                  } else if (capitalize) value = capitalizeFirstLetter(value)
                  field.onChange(value)
                }
                }
                placeholder={placeholder}
                className={inputClass}
              />
              <span className="text-sm font-light text-gray-700">
                {message}
              </span>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormInput;
