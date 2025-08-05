"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

const REQUIRED_PASSWORD = "#ProjectVanu";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === REQUIRED_PASSWORD) {
            login();
            router.push("/");
            toast({
                title: "Access Granted",
                description: "Welcome to the dashboard.",
            });
        } else {
            setError("Incorrect password. Please try again.");
            toast({
                variant: "destructive",
                title: "Access Denied",
                description: "The password you entered is incorrect.",
            });
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Lock className="h-6 w-6" />
                    </div>
                    <CardTitle>Site Locked</CardTitle>
                    <CardDescription>
                        Please enter the password to access the dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                setError("")
                            }}
                            placeholder="Enter password..."
                            className="text-center"
                        />
                         {error && <p className="text-sm text-center text-destructive">{error}</p>}
                        <Button type="submit" className="w-full">
                            Unlock
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
