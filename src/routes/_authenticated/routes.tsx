import {createFileRoute, Outlet} from '@tanstack/react-router'
import TitleCard from "@/components/page-components/title.tsx";
export const Route = createFileRoute('/_authenticated/routes')({
    component: () => <div>
        <TitleCard title='Routes Management'/>
        <div className='p-8'><Outlet/></div>
    </div>,
})
