"use client";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Mở menu</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="p-0 w-72 bg-background border-r">
        <SheetTitle className="hidden">Menu Điều Hướng</SheetTitle>
        <SheetDescription className="hidden">
          Menu điều hướng chính cho thiết bị di động
        </SheetDescription>
        
        <Sidebar className="w-full h-full border-none shadow-none" />
      </SheetContent>
    </Sheet>
  );
}