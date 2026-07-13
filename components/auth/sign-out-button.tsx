"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function SignOutButton(): React.JSX.Element {
  const { signOut } = useAuth();

  return (
    <Button className="w-full justify-start" variant="ghost" onClick={() => void signOut()}>
      <LogOut className="mr-2 h-4 w-4" />
      Sair
    </Button>
  );
}
