import { ColumnDef } from "@tanstack/react-table";
import { TripPersonnel } from "@/lib/custom-types.ts";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";
import { EyeIcon, Trash2Icon } from "lucide-react";
import ConfirmPin from "@/components/confirm-pin.tsx";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { axiosInstance } from "@/lib/axios.ts";
// import { useToast } from "@/hooks/use-toast.ts";

export const tripPersonnelColumns: ColumnDef<TripPersonnel>[] = [
  {
    header: "Name",
    cell: ({ row }) =>
      `${row.original.staffInfo.firstname} ${row.original.staffInfo.lastname}`,
  },
  {
    header: "Registered In",
    cell: ({ row }) => row.original.registeredIn.name,
  },
  {
    header: "Current/Last Station",
    cell: ({ row }) => row.original.currentStation.name,
  },
  {
    header: "Operation scope",
    cell: ({ row }) => row.original.operation?.toUpperCase(),
  },
  {
    header: "Current Route",
    cell: ({ row }) => row.original.registeredRoute?.code || "N/A",
  },
  {
    accessorKey: "id",
    header: () => <p className="w-full text-center">View</p>,
    cell: ({ row }) => {
      // const { mutate } = useMutation({
      //   mutationKey: ["routes"],
      //   mutationFn: async (id: number) => {
      //     const { data } = await axiosInstance.delete(`/vendor/routes/${id}`);
      //     if (!data.success) throw new Error(data.message);
      //     return data.success;
      //   },
      // });
      // const { toast } = useToast();
      // const queryClient = useQueryClient();
      // const router = useRouter();
      // // const deleteRoute = (id: number) => {
      // //   mutate(id, {
      // //     onSuccess: async () => {
      // //       toast({ description: "Route deleted" });
      // //       await router.invalidate();
      // //       await queryClient.invalidateQueries({ queryKey: ["routes"] });
      // //       await router.load();
      // //     },
      // //   });
      // // };
      const id = row.original.id;
      return (
        <div className="flex gap-4 justify-center">
          <Link to={`/staff/${row.original.staffInfo.id}`}>
            <Button variant="outline" size="icon">
              <EyeIcon />
            </Button>
          </Link>
          <Button variant="destructive" onClick={() => {}} size="icon">
            <Trash2Icon />
          </Button>
          <ConfirmPin id={`delete-${id}`} action={() => {}} />
        </div>
      );
    },
  },
];
