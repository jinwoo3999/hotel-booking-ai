"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function DebugAuthPage() {
  const { data: session, status } = useSession();
  const [clearing, setClearing] = useState(false);

  const clearSession = async () => {
    setClearing(true);
    try {
      // Clear session via API
      await fetch("/api/auth/clear-session", { method: "POST" });
      // Also sign out via NextAuth
      await signOut({ redirect: false });
      window.location.reload();
    } catch (error) {
      console.error("Error clearing session:", error);
    } finally {
      setClearing(false);
    }
  };

  const loginAsAdmin = async () => {
    await signIn("credentials", {
      email: "admin@gmail.com",
      password: "password",
      redirect: false
    });
    window.location.reload();
  };

  const loginAsPartner = async () => {
    await signIn("credentials", {
      email: "partner@gmail.com", 
      password: "password",
      redirect: false
    });
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Debug Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Session Status: {status}</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={clearSession} 
              variant="destructive" 
              disabled={clearing}
              className="w-full"
            >
              {clearing ? "Clearing..." : "Clear Session & Cookies"}
            </Button>
            
            <Button 
              onClick={loginAsAdmin} 
              variant="default"
              className="w-full"
            >
              Login as Admin (admin@gmail.com)
            </Button>
            
            <Button 
              onClick={loginAsPartner} 
              variant="default"
              className="w-full"
            >
              Login as Partner (partner@gmail.com)
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>Available accounts:</strong></p>
            <ul className="list-disc list-inside">
              <li>admin@gmail.com / password (SUPER_ADMIN)</li>
              <li>partner@gmail.com / password (PARTNER)</li>
              <li>user@gmail.com / password (USER)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}