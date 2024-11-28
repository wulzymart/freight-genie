import { ColumnDef } from "@tanstack/react-table";
import { Vehicle } from "@/lib/custom-types.ts";
import { Link, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";
import { EyeIcon, Trash2Icon } from "lucide-react";
import ConfirmPin from "@/components/confirm-pin.tsx";
import { validatePinElementGen } from "@/lib/utils.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios.ts";
import { useToast } from "@/hooks/use-toast.ts";
import { capitalize } from "lodash";

export const columns: ColumnDef<Vehicle>[] = [
  {
    accessorKey: "registrationNumber",
    header: "RegistrationNumber",
  },
  {
    accessorKey: "model",
    header: "Model",
  },
  {
    accessorKey: "type",
    header: "Vehicle Type",
    cell: ({ row }) => capitalize(row.original.type),
  },
  {
    accessorKey: "coverage",
    header: "Vehicle Coverage",
    cell: ({ row }) => capitalize(row.original.coverage),
  },
  {
    accessorKey: "registeredTo",
    header: "Registered To",
    cell: ({ row }) => row.original.registeredTo.name,
  },
  {
    accessorKey: "currentStation",
    header: "Current (Last) Station",
    cell: ({ row }) => row.original.registeredTo.name,
  },

  {
    accessorKey: "id",
    header: () => <p className="w-full text-center">View</p>,
    cell: ({ row }) => {
      const { mutate } = useMutation({
        mutationKey: ["vehicles", "vehicle", row.original.id],
        mutationFn: async (id: string) => {
          const { data } = await axiosInstance.delete(`/vendor/vehicles/${id}`);
          if (!data.success) throw new Error(data.message);
          return data.success;
        },
      });
      const { toast } = useToast();
      const queryClient = useQueryClient();
      const router = useRouter();
      const deleteVehicle = (id: string) => {
        mutate(id, {
          onSuccess: async () => {
            toast({ description: "Vehicle deleted" });
            await router.invalidate();
            await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
            await router.load();
          },
        });
      };
      const id = row.original.id;
      return (
        <div className="flex gap-4 justify-center">
          <Link to={`/vehicles/${id}`}>
            <Button variant="outline" size="icon">
              <EyeIcon />
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={() => validatePinElementGen(`delete-${id}`)}
            size="icon"
          >
            <Trash2Icon />
          </Button>
          <ConfirmPin id={`delete-${id}`} action={() => deleteVehicle(id)} />
        </div>
      );
    },
  },
];
