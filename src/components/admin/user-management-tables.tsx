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
import { MoreHorizontal, Search, ChevronLeft, ChevronRight } from 'lucide-react';
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

const thClass = "bg-primary text-primary-foreground";

export function UserManagementTables() {
  const [newRequestSearch, setNewRequestSearch] = useState('');
  const [existingUserSearch, setExistingUserSearch] = useState('');
  
  const [newRequestsPage, setNewRequestsPage] = useState(1);
  const [newRequestsRowsPerPage, setNewRequestsRowsPerPage] = useState(10);
  const [existingUsersPage, setExistingUsersPage] = useState(1);
  const [existingUsersRowsPerPage, setExistingUsersRowsPerPage] = useState(10);

  const filteredNewRequests = useMemo(() => {
    const lowercasedQuery = newRequestSearch.toLowerCase();
    if (!lowercasedQuery) return sampleNewRequests;
    return sampleNewRequests.filter(
      (item) =>
        item.companyName.toLowerCase().includes(lowercasedQuery) ||
        item.gstNo.toLowerCase().includes(lowercasedQuery) ||
        item.transporterId.toLowerCase().includes(lowercasedQuery)
    );
  }, [newRequestSearch]);

  const filteredExistingUsers = useMemo(() => {
    const lowercasedQuery = existingUserSearch.toLowerCase();
    if (!lowercasedQuery) return sampleExistingUsers;
    return sampleExistingUsers.filter(
      (item) =>
        item.companyName.toLowerCase().includes(lowercasedQuery) ||
        item.userId.toLowerCase().includes(lowercasedQuery) ||
        item.gstNo.toLowerCase().includes(lowercasedQuery) ||
        item.transporterId.toLowerCase().includes(lowercasedQuery)
    );
  }, [existingUserSearch]);

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
                  <TableHead className={thClass}>Address</TableHead>
                  <TableHead className={thClass}>Contact No</TableHead>
                  <TableHead className={thClass}>Licence Type</TableHead>
                  <TableHead className={`${thClass} text-center`}>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedNewRequests.map((req, index) => (
                  <TableRow key={req.id}>
                    <TableCell>{(newRequestsPage - 1) * newRequestsRowsPerPage + index + 1}</TableCell>
                    <TableCell>{req.companyName}</TableCell>
                    <TableCell>{req.gstNo}</TableCell>
                    <TableCell>{req.transporterId}</TableCell>
                    <TableCell>{req.address}</TableCell>
                    <TableCell>{req.contactNo}</TableCell>
                    <TableCell><Badge variant="secondary">{req.licenceType}</Badge></TableCell>
                    <TableCell className="text-center">
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
                          <DropdownMenuItem className="text-green-600">Approve</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Reject</DropdownMenuItem>
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
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="30">30</SelectItem>
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
                  <TableHead className={thClass}>GST No</TableHead>
                  <TableHead className={thClass}>Transporter ID</TableHead>
                  <TableHead className={thClass}>Address</TableHead>
                  <TableHead className={thClass}>Contact No</TableHead>
                  <TableHead className={thClass}>Total issued IDS</TableHead>
                  <TableHead className={thClass}>Licence Type</TableHead>
                  <TableHead className={thClass}>Valid Till</TableHead>
                  <TableHead className={`${thClass} text-center`}>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedExistingUsers.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>{(existingUsersPage - 1) * existingUsersRowsPerPage + index + 1}</TableCell>
                    <TableCell>{user.userId}</TableCell>
                    <TableCell>{user.subIds}</TableCell>
                    <TableCell>{user.companyName}</TableCell>
                    <TableCell>{user.gstNo}</TableCell>
                    <TableCell>{user.transporterId}</TableCell>
                    <TableCell>{user.address}</TableCell>
                    <TableCell>{user.contactNo}</TableCell>
                    <TableCell>{user.totalIssuedIds}</TableCell>
                    <TableCell><Badge variant="default">{user.licenceType}</Badge></TableCell>
                    <TableCell>{user.validTill}</TableCell>
                    <TableCell className="text-center">
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
                          <DropdownMenuItem className="text-red-500">Deactivate</DropdownMenuItem>
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
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="30">30</SelectItem>
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
