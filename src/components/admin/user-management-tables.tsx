
'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';


const newRequests = [
    {
        id: 1,
        companyName: "Innovate Logistics",
        gstNo: "27AAFCI1234A1Z5",
        transporterId: "TID-001",
        address: "123 Tech Park, Bangalore",
        contactNo: "9876543210",
        licenceType: "Trial"
    },
    {
        id: 2,
        companyName: "Speedy Shippers",
        gstNo: "29ABCDS5678B1Z6",
        transporterId: "TID-002",
        address: "456 Commerce Rd, Mumbai",
        contactNo: "9123456780",
        licenceType: "Bronze"
    }
];

const existingUsers = [
    {
        id: 1,
        userId: "USR-001",
        subIds: 5,
        companyName: "Global Transports",
        gstNo: "22AAAAA0000A1Z5",
        transporterId: "TID-003",
        address: "789 Industrial Estate, Delhi",
        contactNo: "9988776655",
        totalIssuedIds: 10,
        licenceType: "Gold",
        validTill: "2025-12-31"
    },
    {
        id: 2,
        userId: "USR-002",
        subIds: 2,
        companyName: "Quick Haulers",
        gstNo: "36BBBBB1111B1Z4",
        transporterId: "TID-004",
        address: "101 Logistic Hub, Chennai",
        contactNo: "9765432109",
        totalIssuedIds: 5,
        licenceType: "Platinum",
        validTill: "2026-06-30"
    },
];

const thClass = "bg-primary text-primary-foreground";

export function UserManagementTables() {
  const [newRequestSearch, setNewRequestSearch] = useState('');
  const [existingUserSearch, setExistingUserSearch] = useState('');
  const [filteredNewRequests, setFilteredNewRequests] = useState(newRequests);
  const [filteredExistingUsers, setFilteredExistingUsers] = useState(existingUsers);

  useEffect(() => {
    const lowercasedQuery = newRequestSearch.toLowerCase();
    const filtered = newRequests.filter(
      (item) =>
        item.companyName.toLowerCase().includes(lowercasedQuery) ||
        item.gstNo.toLowerCase().includes(lowercasedQuery) ||
        item.transporterId.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredNewRequests(filtered);
  }, [newRequestSearch]);

  useEffect(() => {
    const lowercasedQuery = existingUserSearch.toLowerCase();
    const filtered = existingUsers.filter(
      (item) =>
        item.companyName.toLowerCase().includes(lowercasedQuery) ||
        item.userId.toLowerCase().includes(lowercasedQuery) ||
        item.gstNo.toLowerCase().includes(lowercasedQuery) ||
        item.transporterId.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredExistingUsers(filtered);
  }, [existingUserSearch]);


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
                {filteredNewRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.id}</TableCell>
                    <TableCell>{req.companyName}</TableCell>
                    <TableCell>{req.gstNo}</TableCell>
                    <TableCell>{req.transporterId}</TableCell>
                    <TableCell>{req.address}</TableCell>
                    <TableCell>{req.contactNo}</TableCell>
                    <TableCell><Badge variant="secondary">{req.licenceType}</Badge></TableCell>
                    <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                           <Button variant="outline" size="sm" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white">Approve</Button>
                           <Button variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">Reject</Button>
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
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
                {filteredExistingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
