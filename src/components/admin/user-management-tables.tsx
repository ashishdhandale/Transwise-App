
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Search, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { newRequests as sampleNewRequests, existingUsers as sampleExistingUsers } from '@/lib/sample-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { NewRequest, ExistingUser } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import Link from 'next/link';


const thClass = "bg-primary text-primary-foreground";
const tdClass = "whitespace-nowrap";

let nextCompanyCode = 102;

export function UserManagementTables() {
  const [newRequestSearch, setNewRequestSearch] = useState('');
  const [existingUserSearch, setExistingUserSearch] = useState('');
  
  const [newRequestsPage, setNewRequestsPage] = useState(1);
  const [newRequestsRowsPerPage, setNewRequestsRowsPerPage] = useState(5);
  const [existingUsersPage, setExistingUsersPage] = useState(1);
  const [existingUsersRowsPerPage, setExistingUsersRowsPerPage] = useState(5);
  
  const [newRequests, setNewRequests] = useState<NewRequest[]>(sampleNewRequests);
  const [existingUsers, setExistingUsers] = useState<ExistingUser[]>(sampleExistingUsers);
  const { toast } = useToast();

  const handleApprove = (request: NewRequest) => {
    const newUser: ExistingUser = {
      id: existingUsers.length + newRequests.length + 1,
      userId: `CO${nextCompanyCode++}`,
      subIds: 0,
      companyName: request.companyName,
      gstNo: request.gstNo,
      transporterId: request.transporterId,
      address: request.address,
      contactNo: request.contactNo,
      totalIssuedIds: 1,
      licenceType: request.licenceType,
      validTill: '2025-12-31' // Set a default validity
    };
    
    setExistingUsers(prev => [newUser, ...prev]);
    setNewRequests(prev => prev.filter(r => r.id !== request.id));
    
    toast({
      title: 'User Approved',
      description: `${request.companyName} has been added to the existing users list.`,
    });
  };

  const handleReject = (request: NewRequest) => {
    setNewRequests(prev => prev.filter(r => r.id !== request.id));
     toast({
      title: 'User Rejected',
      description: `The request from ${request.companyName} has been rejected.`,
      variant: 'destructive'
    });
  };
  
  const handleDeactivate = (user: ExistingUser) => {
      // In a real app, this would likely set a status to 'inactive'
      // For this prototype, we'll remove the user from the list.
      setExistingUsers(prev => prev.filter(u => u.id !== user.id));
      toast({
        title: 'User Deactivated',
        description: `${user.companyName} has been deactivated.`,
        variant: 'destructive'
      });
  };

  const filteredNewRequests = useMemo(() => {
    const lowercasedQuery = newRequestSearch.toLowerCase();
    if (!lowercasedQuery) return newRequests;
    return newRequests.filter(
      (item) =>
        item.companyName.toLowerCase().includes(lowercasedQuery) ||
        item.gstNo.toLowerCase().includes(lowercasedQuery) ||
        item.transporterId.toLowerCase().includes(lowercasedQuery)
    );
  }, [newRequestSearch, newRequests]);

  const filteredExistingUsers = useMemo(() => {
    const lowercasedQuery = existingUserSearch.toLowerCase();
    if (!lowercasedQuery) return existingUsers;
    return existingUsers.filter(
      (item) =>
        item.companyName.toLowerCase().includes(lowercasedQuery) ||
        item.userId.toLowerCase().includes(lowercasedQuery) ||
        item.gstNo.toLowerCase().includes(lowercasedQuery) ||
        item.transporterId.toLowerCase().includes(lowercasedQuery)
    );
  }, [existingUserSearch, existingUsers]);

  const newRequestsTotalPages = Math.ceil(filteredNewRequests.length / newRequestsRowsPerPage);
  const paginatedNewRequests = useMemo(() => {
    const startIndex = (newRequestsPage - 1) * newRequestsRowsPerPage;
    return filteredNewRequests.slice(startIndex, startIndex + newRequestsRowsPerPage);
  }, [filteredNewRequests, newRequestsPage, newRequestsRowsPerPage]);

  const existingUsersTotalPages = Math.ceil(filteredExistingUsers.length / existingUsersRowsPerPage);
  const paginatedExistingUsers = useMemo(() => {
    const startIndex = (existingUsersPage - 1) * existingUsersRowsPerPage;
    return filteredExistingUsers.slice(startIndex, startIndex + existingUsersRowsPerPage);
  }, [filteredExistingUsers, existingUsersPage, existingUsersRowsPerPage]);

  useEffect(() => {
    setNewRequestsPage(1);
  }, [newRequestSearch, newRequestsRowsPerPage]);
  
  useEffect(() => {
    setExistingUsersPage(1);
  }, [existingUserSearch, existingUsersRowsPerPage]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline">New User Request</CardTitle>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search requests..."
              className="pl-8"
              value={newRequestSearch}
              onChange={(e) => setNewRequestSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={thClass}>#</TableHead>
                  <TableHead className={thClass}>Company Name</TableHead>
                  <TableHead className={thClass}>GST No</TableHead>
                  <TableHead className={thClass}>Transporter ID</TableHead>
                  <TableHead className={thClass}>Licence Type</TableHead>
                  <TableHead className={`${thClass} text-center`}>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedNewRequests.map((req, index) => (
                  <TableRow key={req.id}>
                    <TableCell className={cn(tdClass)}>{(newRequestsPage - 1) * newRequestsRowsPerPage + index + 1}</TableCell>
                    <TableCell className={cn(tdClass)}>{req.companyName}</TableCell>
                    <TableCell className={cn(tdClass)}>{req.gstNo}</TableCell>
                    <TableCell className={cn(tdClass)}>{req.transporterId}</TableCell>
                    <TableCell className={cn(tdClass)}><Badge variant="secondary">{req.licenceType}</Badge></TableCell>
                    <TableCell className={cn(tdClass, "text-center")}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem className="text-green-600" onClick={() => handleApprove(req)}>Approve</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleReject(req)}>Reject</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {paginatedNewRequests.length === 0 && (
                <div className="text-center p-4 text-muted-foreground">No requests found.</div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Rows per page:</span>
                <Select value={`${newRequestsRowsPerPage}`} onValueChange={(value) => setNewRequestsRowsPerPage(Number(value))}>
                    <SelectTrigger className="w-20">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                    Page {newRequestsTotalPages > 0 ? newRequestsPage: 0} of {newRequestsTotalPages}
                </span>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setNewRequestsPage(p => p - 1)} disabled={newRequestsPage === 1}>
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous page</span>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setNewRequestsPage(p => p + 1)} disabled={newRequestsPage === newRequestsTotalPages || newRequestsTotalPages === 0}>
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next page</span>
                    </Button>
                </div>
            </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline">Existing User List</CardTitle>
          <div className="flex items-center gap-4">
             <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={existingUserSearch}
                onChange={(e) => setExistingUserSearch(e.target.value)}
                />
            </div>
             <Button asChild>
                <Link href="/admin/add-company">
                    <UserPlus className="mr-2 h-4 w-4"/>
                    Add New User/Company
                </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={thClass}>#</TableHead>
                  <TableHead className={thClass}>USER ID</TableHead>
                  <TableHead className={thClass}>Sub IDs</TableHead>
                  <TableHead className={thClass}>Company Name</TableHead>
                  <TableHead className={thClass}>Licence Type</TableHead>
                  <TableHead className={thClass}>Valid Till</TableHead>
                  <TableHead className={`${thClass} text-center`}>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedExistingUsers.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className={cn(tdClass)}>{(existingUsersPage - 1) * existingUsersRowsPerPage + index + 1}</TableCell>
                    <TableCell className={cn(tdClass)}>{user.userId}</TableCell>
                    <TableCell className={cn(tdClass)}>{user.subIds}</TableCell>
                    <TableCell className={cn(tdClass)}>{user.companyName}</TableCell>
                    <TableCell className={cn(tdClass)}><Badge variant="default">{user.licenceType}</Badge></TableCell>
                    <TableCell className={cn(tdClass)}>{user.validTill}</TableCell>
                    <TableCell className={cn(tdClass, "text-center")}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit User</DropdownMenuItem>
                          <DropdownMenuItem>Manage Subscription</DropdownMenuItem>
                          <DropdownMenuItem>Backup</DropdownMenuItem>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={e => e.preventDefault()} className="text-red-500">Deactivate</DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>This will deactivate {user.companyName}'s account.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeactivate(user)}>Deactivate</AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {paginatedExistingUsers.length === 0 && (
                <div className="text-center p-4 text-muted-foreground">No users found.</div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Rows per page:</span>
                <Select value={`${existingUsersRowsPerPage}`} onValueChange={(value) => setExistingUsersRowsPerPage(Number(value))}>
                    <SelectTrigger className="w-20">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                    Page {existingUsersTotalPages > 0 ? existingUsersPage: 0} of {existingUsersTotalPages}
                </span>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setExistingUsersPage(p => p - 1)} disabled={existingUsersPage === 1}>
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous page</span>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setExistingUsersPage(p => p + 1)} disabled={existingUsersPage === existingUsersTotalPages || existingUsersTotalPages === 0}>
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next page</span>
                    </Button>
                </div>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
