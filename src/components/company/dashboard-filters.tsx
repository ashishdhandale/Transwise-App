
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '../ui/card';

interface DashboardFiltersProps {
    // A simple way to simulate role for now. In a real app, this would come from an auth context.
    userRole?: 'Company' | 'Branch';
}

export function DashboardFilters({ userRole = 'Company' }: DashboardFiltersProps) {
  return (
    <Card className="p-2 border border-[#b2dfdb]">
      <div className="flex flex-wrap items-center gap-4">
        {userRole === 'Company' && (
            <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Select Branch</label>
            <Select defaultValue="all">
                <SelectTrigger className="w-[180px] bg-white">
                <SelectValue />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">ALL (Default)</SelectItem>
                <SelectItem value="branch1">Branch 1</SelectItem>
                <SelectItem value="branch2">Branch 2</SelectItem>
                </SelectContent>
            </Select>
            </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium">Monthly Statistics</label>
          <Select defaultValue="bookings">
            <SelectTrigger className="w-[120px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bookings">Bookings</SelectItem>
              <SelectItem value="deliveries">Deliveries</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="january">
            <SelectTrigger className="w-[120px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="january">January</SelectItem>
              <SelectItem value="february">February</SelectItem>
              <SelectItem value="march">March</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="2021">
            <SelectTrigger className="w-[100px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2021">2021</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
