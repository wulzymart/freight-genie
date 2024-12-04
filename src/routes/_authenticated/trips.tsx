import { createFileRoute, Outlet } from "@tanstack/react-router";
import TitleCard from "@/components/page-components/title.tsx";

export const Route = createFileRoute("/_authenticated/trips")({
  component: () => (
    <div>
      <TitleCard title="Trips Management" />
      <div className="p-8">
        <Outlet />
      </div>
    </div>
  ),
});
