"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { Link } from "@tanstack/react-router";
import { LucideIcon } from "lucide-react";

import { ReactElement } from "react";
import { IconType } from "react-icons/lib";
import { MdDomainAdd } from "react-icons/md";

export default function MenuItem({
  name,
  href,
  Icon,
}: {
  name: string;
  href: string;
  Icon: ReactElement<IconType | LucideIcon>;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={href}
          activeProps={{ className: "text-accent-foreground" }}
          inactiveProps={{ className: "text-muted-foreground" }}
          className={`flex h-9 w-9 items-center justify-center rounded-lg bg-accent transition-colors hover:text-foreground md:h-8 md:w-8`}
        >
          {Icon}
          <span className="sr-only">{name}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{name}</TooltipContent>
    </Tooltip>
  );
}
