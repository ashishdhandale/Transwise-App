

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
import { MoreHorizontal, Search, ChevronLeft, ChevronRight, UserPlus, Pencil, Eye, CheckCircle2, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { sampleExistingUsers, onlineInquiries as sampleInquiries } from '@/lib/sample-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ExistingUser, OnlineInquiry, Staff, Branch } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import Link from 'next/link';
import { getStaff } from '@/lib/staff-data';
import { getBranches } from '@/lib/branch-data';


const thClass = "bg-primary text-primary-foreground";
const tdClass = "whitespace-nowrap";

export function UserManagementTables() {
  const [inquirySearch, setInquirySearch] = useState('');
  const [existingUserSearch, setExistingUserSearch] = useState('');
  
  const [inquiriesPage, setInquiriesPage] = useState(1);
  const [inquiriesRowsPerPage, setInquiriesRowsPerPage] = useState(5);
  const [existingUsersPage, setExistingUsersPage] = useState(1);
  const [existingUsersRowsPerPage, setExistingUsersRowsPerPage] = useState(5);
  
  const [onlineInquiries, setOnlineInquiries] = useState<OnlineInquiry[]>(sampleInquiries);
  const [localExistingUsers, setLocalExistingUsers] = useState<ExistingUser[]>(sampleExistingUsers);
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);

  const { toast } = useToast();
  
  useEffect(() => {
    setAllStaff(getStaff());
    setAllBranches(getBranches());
  }, []);
  

  const handleDeactivate = (user: ExistingUser) => {
      // In a real app, this would likely set a status to 'inactive'
      setLocalExistingUsers(prev => prev.filter(u => u.id !== user.id));
      toast({
        title: 'User Deactivated',
        description: `${user.companyName} has been deactivated.`,
        variant: 'destructive'
      });
  };
  
  const handleInquiryStatusChange = (inquiryId: number, status: OnlineInquiry['status']) => {
    setOnlineInquiries(prev => 
      prev.map(inquiry => 
        inquiry.id === inquiryId ? { ...inquiry, status } : inquiry
      )
    );
    toast({
      title: 'Inquiry Updated',
      description: `Inquiry #${inquiryId} has been marked as ${status}.`
    })
  };

  const filteredInquiries = useMemo(() => {
    const lowercasedQuery = inquirySearch.toLowerCase();
    if (!lowercasedQuery) return onlineInquiries;
    return onlineInquiries.filter(
      (item) =>
        item.name.toLowerCase().includes(lowercasedQuery) ||
        item.contact.toLowerCase().includes(lowercasedQuery) ||
        item.source.toLowerCase().includes(lowercasedQuery)
    );
  }, [inquirySearch, onlineInquiries]);

  const filteredExistingUsers = useMemo(() => {
    const lowercasedQuery = existingUserSearch.toLowerCase();
    if (!lowercasedQuery) return localExistingUsers;
    return localExistingUsers.filter(
      (item) =>
        item.companyName.toLowerCase().includes(lowercasedQuery) ||
        item.userId.toLowerCase().includes(lowercasedQuery) ||
        item.gstNo.toLowerCase().includes(lowercasedQuery) ||
        item.transporterId.toLowerCase().includes(lowercasedQuery)
    );
  }, [existingUserSearch, localExistingUsers]);
  
  const getSubIdCount = (user: ExistingUser): number => {
    const companyBranches = allBranches.filter(b => b.companyId === String(user.id));
    const branchNames = companyBranches.map(b => b.name);
    
    if (user.companyName.toLowerCase().includes('transwise')) { 
        branchNames.push('Main Office');
    }

    const count = allStaff.filter(s => s.branch && branchNames.includes(s.branch)).length;
    return count;
  };

   const getBranchCount = (user: ExistingUser): number => {
      return allBranches.filter(b => b.companyId === String(user.id)).length;
  }

  const inquiriesTotalPages = Math.ceil(filteredInquiries.length / inquiriesRowsPerPage);
  const paginatedInquiries = useMemo(() => {
    const startIndex = (inquiriesPage - 1) * inquiriesRowsPerPage;
    return filteredInquiries.slice(startIndex, startIndex + inquiriesRowsPerPage);
  }, [filteredInquiries, inquiriesPage, inquiriesRowsPerPage]);

  const existingUsersTotalPages = Math.ceil(filteredExistingUsers.length / existingUsersRowsPerPage);
  const paginatedExistingUsers = useMemo(() => {
    const startIndex = (existingUsersPage - 1) * existingUsersRowsPerPage;
    return filteredExistingUsers.slice(startIndex, startIndex + existingUsersRowsPerPage);
  }, [filteredExistingUsers, existingUsersPage, existingUsersRowsPerPage]);

  useEffect(() => {
    setInquiriesPage(1);
  }, [inquirySearch, inquiriesRowsPerPage]);
  
  useEffect(() => {
    setExistingUsersPage(1);
  }, [existingUserSearch, existingUsersRowsPerPage]);

  return (
    <>
      <div className="space-y-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline">Online Inquiries</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search inquiries..."
                className="pl-8"
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={thClass}>#</TableHead>
                    <TableHead className={thClass}>Name</TableHead>
                    <TableHead className={thClass}>Contact</TableHead>
                    <TableHead className={thClass}>Source</TableHead>
                    <TableHead className={thClass}>Message</TableHead>
                    <TableHead className={thClass}>Status</TableHead>
                    <TableHead className={`${thClass} text-center`}>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInquiries.map((req, index) => (
                    <TableRow key={req.id}>
                      <TableCell className={cn(tdClass)}>{(inquiriesPage - 1) * inquiriesRowsPerPage + index + 1}</TableCell>
                      <TableCell className={cn(tdClass)}>{req.name}</TableCell>
                      <TableCell className={cn(tdClass)}>{req.contact}</TableCell>
                      <TableCell className={cn(tdClass)}>{req.source}</TableCell>
                      <TableCell className="max-w-xs truncate">{req.message}</TableCell>
                      <TableCell className={cn(tdClass)}><Badge variant={req.status === 'New' ? 'default' : 'secondary'}>{req.status}</Badge></TableCell>
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
                            <DropdownMenuItem onSelect={() => toast({title: "Viewing Details", description: "This feature is coming soon."})}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleInquiryStatusChange(req.id, 'Contacted')}>
                              Mark as Contacted
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleInquiryStatusChange(req.id, 'Resolved')}>
                              Mark as Resolved
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {paginatedInquiries.length === 0 && (
                  <div className="text-center p-4 text-muted-foreground">No inquiries found.</div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Rows per page:</span>
                  <Select value={`${inquiriesRowsPerPage}`} onValueChange={(value) => setInquiriesRowsPerPage(Number(value))}>
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
                      Page {inquiriesTotalPages > 0 ? inquiriesPage: 0} of {inquiriesTotalPages}
                  </span>
                  <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => setInquiriesPage(p => p - 1)} disabled={inquiriesPage === 1}>
                          <ChevronLeft className="h-4 w-4" />
                          <span className="sr-only">Previous page</span>
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setInquiriesPage(p => p + 1)} disabled={inquiriesPage === inquiriesTotalPages || inquiriesTotalPages === 0}>
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
                    <TableHead className={thClass}>Company Name</TableHead>
                    <TableHead className={thClass}>Logo</TableHead>
                    <TableHead className={thClass}>Transporter ID</TableHead>
                    <TableHead className={thClass}>Contact No</TableHead>
                    <TableHead className={thClass}>Address</TableHead>
                    <TableHead className={thClass}>City</TableHead>
                    <TableHead className={thClass}>State</TableHead>
                    <TableHead className={thClass}>GST No</TableHead>
                    <TableHead className={thClass}>PAN</TableHead>
                    <TableHead className={thClass}>Company Email</TableHead>
                    <TableHead className={thClass}>Auth. Person</TableHead>
                    <TableHead className={thClass}>Auth. Contact</TableHead>
                    <TableHead className={thClass}>Auth. Email</TableHead>
                    <TableHead className={thClass}>User IDs</TableHead>
                    <TableHead className={thClass}>Branches</TableHead>
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
                      <TableCell className={cn(tdClass)}>{user.companyName}</TableCell>
                      <TableCell className={cn(tdClass, "text-center")}>
                        {user.logo ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                      </TableCell>
                      <TableCell className={cn(tdClass)}>{user.transporterId}</TableCell>
                      <TableCell className={cn(tdClass)}>{user.contactNo}</TableCell>
                      <TableCell className={cn(tdClass, 'max-w-xs truncate')}>{user.address}</TableCell>
                      <TableCell className={cn(tdClass)}>{user.city}</TableCell>
                      <TableCell className={cn(tdClass)}>{user.state}</TableCell>
                      <TableCell className={cn(tdClass)}>{user.gstNo}</TableCell>
                      <TableCell className={cn(tdClass)}>{user.pan}</TableCell>
                      <TableCell className={cn(tdClass)}>{user.companyEmail}</TableCell>
                      <TableCell className={cn(tdClass)}>{user.authPersonName}</TableCell>
                      <TableCell className={cn(tdClass)}>{user.authContactNo}</TableCell>
                      <TableCell className={cn(tdClass)}>{user.authEmail}</TableCell>
                      <TableCell className={cn(tdClass, "font-semibold text-center")}>{getSubIdCount(user)} / {user.maxUsers}</TableCell>
                      <TableCell className={cn(tdClass, "font-semibold text-center")}>{getBranchCount(user)} / {user.maxBranches}</TableCell>
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
                            <DropdownMenuItem asChild>
                               <Link href={`/admin/add-company?userId=${user.id}`}><Eye className="mr-2 h-4 w-4" /> View Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/add-company?userId=${user.id}&mode=edit`}><Pencil className="mr-2 h-4 w-4" /> Edit User</Link>
                            </DropdownMenuItem>
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
    </>
  );
}
