import { ColumnDef } from "@tanstack/react-table";
import { Trip, TripStatus } from "@/lib/custom-types.ts";
import { Link, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";
import { EyeIcon, Trash2Icon } from "lucide-react";
import ConfirmPin from "@/components/confirm-pin.tsx";
import { validatePinElementGen } from "@/lib/utils.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios.ts";
import { useToast } from "@/hooks/use-toast.ts";

export const columns: ColumnDef<Trip>[] = [
  {
    accessorKey: "code",
    header: "Trip Code",
  },
  { accessorKey: "route.code", header: "Route" },
  {
    accessorKey: "type",
    header: "Trip Type",
  },
  {
    accessorKey: "coverage",
    header: "Coverage",
  },
  {
    accessorKey: "origin.name",
    header: "Origin",
  },
  {
    accessorKey: "destination.name",
    header: "Destination",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <p
        className={`w-fit px-2 py-1 rounded-lg text-white text-center ${row.original.status === TripStatus.PLANNED ? "bg-teal-500" : row.original.status === TripStatus.ONGOING ? "bg-green-500" : row.original.status === TripStatus.COMPLETED ? "bg-amber-500" : "bg-purple-500"}`}
      >
        {row.original.status}
      </p>
    ),
  },
  {
    header: "Vehicle",
    cell: ({ row }) => (
      <div className="space-y-2">
        <p>{row.original.vehicle?.model}</p>
        <p className="text-xs">{row.original.vehicle?.registrationNumber}</p>
      </div>
    ),
  },
  {
    accessorKey: "id",
    header: () => <p className="w-full text-center">View</p>,
    cell: ({ row }) => {
      const { mutate } = useMutation({
        mutationKey: ["routes"],
        mutationFn: async (id: string) => {
          const { data } = await axiosInstance.delete(`/vendor/trips/${id}`);
          if (!data.success) throw new Error(data.message);
          return data.success;
        },
      });
      const { toast } = useToast();
      const queryClient = useQueryClient();
      const router = useRouter();
      const deleteTrip = (id: string) => {
        mutate(id, {
          onSuccess: async () => {
            toast({ description: "Trip deleted" });
            await router.invalidate();
            await queryClient.invalidateQueries({ queryKey: ["trips"] });
            await router.load();
          },
        });
      };
      const id = row.original.id;
      return (
        <div className="flex gap-4 justify-center">
          <Link to={`/trips/${id}`}>
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
          <ConfirmPin id={`delete-${id}`} action={() => deleteTrip(id)} />
        </div>
      );
    },
  },
];
