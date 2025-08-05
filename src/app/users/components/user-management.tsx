"use client";

import * as React from "react";
import { MoreHorizontal, UserCheck, UserX, Download, Search, Trash2 } from "lucide-react";
import { listAllUsers, updateUserStatus, deleteUser } from "../actions/user-actions";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type User = {
  uid: string;
  email?: string;
  name?: string;
  lastSignInTime?: string;
  creationTime?: string;
  disabled: boolean;
};

type AlertAction = 'enable' | 'disable' | 'delete';

export default function UserManagement() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [alertInfo, setAlertInfo] = React.useState<{ isOpen: boolean; userId: string | null; action: AlertAction | null }>({ isOpen: false, userId: null, action: null });
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterValue, setFilterValue] = React.useState("all");

  const { toast } = useToast();

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const userList = await listAllUsers();
      setUsers(userList.filter(user => user.email));
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Failed to fetch users",
            description: error instanceof Error ? error.message : "Could not retrieve user data from Firebase Authentication."
        })
    } finally {
        setLoading(false);
    }
  }, [toast]);
  
  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAction = async () => {
    if (!alertInfo.userId || !alertInfo.action) return;

    try {
      if (alertInfo.action === 'delete') {
        await deleteUser(alertInfo.userId);
        toast({
            title: "Success",
            description: "User has been deleted."
        });
      } else {
        const newStatus = alertInfo.action === 'disable';
        await updateUserStatus(alertInfo.userId, newStatus);
        toast({
            title: "Success",
            description: `User has been ${alertInfo.action}d.`
        });
      }
      fetchUsers(); // Refresh the user list
    } catch (error) {
         toast({
            variant: "destructive",
            title: `${alertInfo.action.charAt(0).toUpperCase() + alertInfo.action.slice(1)} failed`,
            description: `Could not ${alertInfo.action} the user.`
        })
    }

    setAlertInfo({ isOpen: false, userId: null, action: null });
  };
  
  const openAlertDialog = (userId: string, action: AlertAction) => {
    setAlertInfo({ isOpen: true, userId, action });
  };
  
  const filteredUsers = users
    .filter((user) => {
        if (!user.email) return false;
        if (filterValue === "all") return true;
        if (filterValue === "active") return !user.disabled;
        if (filterValue === "disabled") return user.disabled;
        if (filterValue === "district") return user.email.endsWith('@distvanu.in');
        if (filterValue === "block") return user.email.endsWith('@blckvanu.in');
        if (filterValue === "panchayat") return user.email.endsWith('@panvanu.in');
        return true;
    })
    .filter((user) =>
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  
  const downloadCSV = () => {
    const headers = ["uid", "name", "email", "status", "lastSignInTime", "creationTime"];
    const csvRows = [
        headers.join(','),
        ...filteredUsers.map(user => [
            user.uid,
            `"${user.name || 'N/A'}"`,
            user.email || 'N/A',
            !user.disabled ? "Active" : "Disabled",
            user.lastSignInTime ? new Date(user.lastSignInTime).toISOString() : 'N/A',
            user.creationTime ? new Date(user.creationTime).toISOString() : 'N/A',
        ].join(','))
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'users.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const getAlertDescription = () => {
    switch(alertInfo.action) {
        case 'enable':
        case 'disable':
            return `You are about to ${alertInfo.action} this user's account. This will affect their ability to sign in.`;
        case 'delete':
            return "This will permanently delete the user account. This action cannot be undone.";
        default:
            return "";
    }
  }

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>User Accounts</CardTitle>
                <CardDescription>Manage, search, and filter user accounts.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                         <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Accounts</CardTitle>
          <CardDescription>Manage, search, and filter user accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="relative w-full sm:w-auto sm:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                />
            </div>
            <div className="flex w-full sm:w-auto items-center gap-4">
                <Select value={filterValue} onValueChange={setFilterValue}>
                    <SelectTrigger className="w-full sm:w-[220px]">
                        <SelectValue placeholder="Filter by role or status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectGroup>
                            <SelectLabel>By Status</SelectLabel>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                            <SelectLabel>By Role</SelectLabel>
                            <SelectItem value="district">District Coordinator</SelectItem>
                            <SelectItem value="block">Block Coordinator</SelectItem>
                            <SelectItem value="panchayat">Panchayat Coordinator</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Button variant="outline" onClick={downloadCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <TableRow key={user.uid}>
                   <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={!user.disabled ? "secondary" : "destructive"}>
                      {!user.disabled ? <UserCheck className="mr-1 h-3 w-3" /> : <UserX className="mr-1 h-3 w-3" />}
                      {!user.disabled ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.lastSignInTime ? new Date(user.lastSignInTime).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{user.creationTime ? new Date(user.creationTime).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {user.disabled ? (
                           <DropdownMenuItem onClick={() => openAlertDialog(user.uid, 'enable')}>
                             <UserCheck className="mr-2 h-4 w-4" />
                             Enable User
                           </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => openAlertDialog(user.uid, 'disable')}>
                            <UserX className="mr-2 h-4 w-4" />
                            Disable User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => openAlertDialog(user.uid, 'delete')}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AlertDialog open={alertInfo.isOpen} onOpenChange={(open) => !open && setAlertInfo({ isOpen: false, userId: null, action: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {getAlertDescription()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAction} 
              className={alertInfo.action === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
