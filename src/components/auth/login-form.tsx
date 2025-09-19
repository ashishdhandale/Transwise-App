'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Loader2 } from 'lucide-react';
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserRole } from "@/lib/types";

export default function LoginForm() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const router = useRouter();

  const handleSignin = () => {
    // Navigate based on the selected role
    switch (role) {
      case 'Admin':
        router.push('/admin');
        break;
      case 'Company':
        router.push('/company');
        break;
      default:
        // Default navigation if no role is selected, or handle error
        // For now, let's just prevent submission if no role is selected.
        if (!role) {
            alert("Please select a role.");
            return;
        }
        router.push('/');
        break;
    }
  };

  const handleReset = () => {
    setRole('');
    setUserId('');
    setPassword('');
  };


  return (
    <div className="flex flex-col min-h-screen bg-secondary">
       <header className="flex items-center justify-between h-20 px-4 md:px-8 bg-primary text-primary-foreground border-b">
        <div>
            <div className="font-bold text-2xl font-headline flex items-center">
              Transwise<span className="bg-red-600 text-white px-1 rounded-sm">.in</span>
            </div>
            <p className="text-xs text-primary-foreground/80">Simplifying Logistics Businesses</p>
        </div>
        <div className="flex items-center">
            <a href="#" className="bg-white text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                HELP
            </a>
        </div>
      </header>
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 items-center justify-center p-4">
        <div className="hidden md:flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl text-gray-700 mb-4">Welcome to</h2>
            <div className="flex items-center text-5xl font-bold text-primary mb-2">
                 Transwise<span className="bg-red-600 text-white px-2 rounded-md text-5xl">.in</span>
            </div>
            <p className="text-xl text-gray-600 mb-4">Transport Management Software</p>
            <div className="border-t-2 border-gray-300 w-1/2 mb-4"></div>
            <p className="text-sm text-gray-500">Developed By <span className="font-bold text-red-600">TRANSWISE SOLUTIONS</span></p>
            <p className="text-xs text-gray-400">Leading Towards Innovations</p>
        </div>

        <div className="w-full max-w-sm mx-auto">
            <Card className="border-2 border-primary rounded-lg overflow-hidden">
                <header className="bg-primary text-primary-foreground p-4">
                    <div className="flex flex-col items-center text-center">
                        <User className="w-8 h-8 mb-2" />
                        <h2 className="font-bold text-xl"><span className="text-red-600">Sign</span>in</h2>
                    </div>
                </header>
                <CardContent className="p-6 bg-white">
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSignin(); }}>
                    <div className="space-y-1">
                        <Label htmlFor="role">Role</Label>
                        <Select onValueChange={(value) => setRole(value as UserRole)} value={role} required>
                            <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Company">Company</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="userId">User ID</Label>
                        <Input id="userId" placeholder="LOGIN ID" value={userId} onChange={(e) => setUserId(e.target.value)} required 
                               className="border-gray-300 focus:border-primary focus:ring-primary"/>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)} required 
                               className="border-gray-300 focus:border-primary focus:ring-primary"/>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <Button type="button" variant="link" className="p-0 h-auto text-primary" onClick={handleReset}>Reset</Button>
                    </div>

                    <div className="text-sm">
                        <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="link" className="p-0 h-auto text-muted-foreground">Forget Password?</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                            <DialogTitle>Recover Password</DialogTitle>
                            <DialogDescription>
                                Enter your User ID to receive a password reset link.
                            </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="recovery-userId" className="text-right">
                                User ID
                                </Label>
                                <Input id="recovery-userId" className="col-span-3" />
                            </div>
                            </div>
                            <DialogFooter>
                            <Button type="submit">Submit</Button>
                            </DialogFooter>
                        </DialogContent>
                        </Dialog>
                    </div>
                    
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Sign in</Button>
                    
                    <div className="text-sm text-center">
                        <a href="#" className="font-medium text-primary hover:underline">
                        Sign Up
                        </a>
                    </div>
                    </form>
                </CardContent>
              </Card>
          </div>
      </main>
    </div>
  );
}
