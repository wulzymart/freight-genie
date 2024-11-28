import { createFileRoute, Outlet } from '@tanstack/react-router'
import TitleCard from '@/components/page-components/title.tsx'

export const Route = createFileRoute('/_authenticated/vehicles')({
  component: () => (
    <div>
      <TitleCard title="Vehicle Management" />
      <Outlet />
    </div>
  ),
})
