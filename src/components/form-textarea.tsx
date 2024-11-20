import {
    FormControl, FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form";
import { Control } from "react-hook-form";
import { Textarea } from "./ui/textarea";
import {capitalizeFirstLetter} from "@/lib/utils.ts";

const FormTextarea = ({
                          control,
                          name,
                          label,
                          type,
                          placeholder,
                          message,
                          textareaClass,
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
    textareaClass?: string;
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
                  <Textarea className={textareaClass} disabled={disabled} {...field} onChange={(e) => {
                      let value: string | number = e.currentTarget.value
                      if (type === 'number') value = +value
                      else if (caseTransform) {
                          if (caseTransform === 'upper') value = value.toUpperCase()
                          else value = value.toLowerCase()
                      } else if (capitalize) value = capitalizeFirstLetter(value)

                      field.onChange(value)
                  }
                  } placeholder={placeholder}/>
              </FormControl>
              <span className="text-sm font-light text-gray-700">
                {message}
              </span>
              <FormMessage/>
          </FormItem>
      )}
    />
  );
};

export default FormTextarea;
