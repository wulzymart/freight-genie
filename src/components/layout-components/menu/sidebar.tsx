import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { Settings } from "lucide-react";

import { menuEntries } from "./menu-data";
import MenuItem from "./menu-item";
import { Link } from "@tanstack/react-router";

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/dashboard"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full relative"
        >
          <img
            className="transition-all group-hover:scale-110"
            src="/freight-genie-logo.png"
            alt="Freight Genie logo"
          />
          <span className="sr-only">Freight Genie</span>
        </Link>
        {menuEntries.map(({ name, Icon, href }) => (
          <MenuItem
            name={name}
            href={href}
            Icon={<Icon className="h-5 w-5" />}
            key={href}
          />
        ))}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
}
