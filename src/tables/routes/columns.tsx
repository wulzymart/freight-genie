import {ColumnDef} from '@tanstack/react-table'
import {Route} from "@/lib/custom-types.ts";
import {Link, useRouter} from "@tanstack/react-router";
import {Button} from "@/components/ui/button.tsx";
import {EyeIcon, Trash2Icon} from "lucide-react";
import ConfirmPin from "@/components/confirm-pin.tsx";
import {validatePinElementGen} from "@/lib/utils.ts";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {axiosInstance} from "@/lib/axios.ts";
import {useToast} from "@/hooks/use-toast.ts";

export const columns: ColumnDef<Route>[] = [
    {
        accessorKey: 'code',
        header: 'Route Code',
    },
    {
        accessorKey: 'type',
        header: 'Route Type',
    },
    {
        accessorKey: 'coverage',
        header: 'Coverage',
    },
    {
        accessorKey: 'id',
        header: () => <p className='w-full text-center'>View</p>,
        cell: ({row}) => {
            const {mutate} = useMutation({
                mutationKey: ['routes'],
                mutationFn: async (id: number) => {
                    const {data} = await axiosInstance.delete(`/vendor/routes/${id}`);
                    if (!data.success)  throw new Error(data.message);
                    return data.success;
                }
            });
            const {toast} = useToast();
            const queryClient = useQueryClient()
            const router = useRouter();
            const deleteRoute = (id:number) => {
                mutate(id, {onSuccess: async () => {
                    toast({description:'Route deleted'});
                    await router.invalidate()
                        await queryClient.invalidateQueries({queryKey: ['routes']})
                        await  router.load()
                }})
            }
            const id = row.original.id
            return <div className='flex gap-4 justify-center'><Link to={`/routes/${id}`}><Button variant='outline'
                                                                                              size='icon'><EyeIcon/></Button></Link><Button
                variant='destructive' onClick={() => validatePinElementGen(`delete-${id}`)}
                size='icon'><Trash2Icon/></Button><ConfirmPin id={`delete-${id}`} action={() => deleteRoute(id)}/></div>
        }
    }
]
