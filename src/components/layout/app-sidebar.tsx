'use client';

import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  BarChart3,
  Building,
  Home,
  Mail,
  Mountain,
  MoreHorizontal,
  PlusCircle,
  Settings,
  Star,
  Ticket,
  Truck,
  Users,
  Briefcase,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSidebar } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

export function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();

  const isAdmin = pathname.startsWith('/admin');
  const isCompany = pathname.startsWith('/company');
  const isEmployee = pathname.startsWith('/employee');
  const isBranch = !isAdmin && !isCompany && !isEmployee;

  let menu, title, user, email, avatarSeed;

  if (isAdmin) {
    title = 'Transwise Admin';
    user = 'Sup.Admin';
    email = 'admin@transwise.in';
    avatarSeed = 'admin-avatar';
    menu = (
      <>
        <SidebarMenuItem>
          <SidebarMenuButton href="/admin" tooltip="Dashboard" isActive={pathname === '/admin'}>
            <Home />
            <span>Dashboard</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton href="/admin/add-company" tooltip="Add Company" isActive={pathname === '/admin/add-company'}>
            <PlusCircle />
            <span>Add Company</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
         <SidebarMenuItem>
            <SidebarMenuButton tooltip="Companies">
              <Building />
              <span>Companies</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Email">
            <Mail />
            <span>Email</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Coupons">
            <Ticket />
            <span>Coupons</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="User">
            <Users />
            <span>User</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Membership">
            <Star />
            <span>Membership</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </>
    );
  } else if (isCompany) {
    title = 'Company Hub';
    user = 'Company Manager';
    email = 'manager@company.com';
    avatarSeed = 'company-avatar';
    menu = (
      <>
        <SidebarMenuItem>
           <SidebarMenuButton href="/company" tooltip="Overview" isActive={pathname === '/company'}>
              <BarChart3 />
              <span>Overview</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Branches">
            <Building />
            <span>Branches</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Company Users">
            <Users />
            <span>Users</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </>
    );
  } else if (isEmployee) {
    title = 'Driver Portal';
    user = 'Driver';
    email = 'driver@atlasflow.com';
    avatarSeed = 'employee-avatar';
    menu = (
      <>
        <SidebarMenuItem>
          <SidebarMenuButton href="/employee" tooltip="My Deliveries" isActive={pathname === '/employee'}>
            <Truck />
            <span>My Deliveries</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </>
    );
  } else { // Branch User
    title = 'AtlasFlow';
    user = 'Branch Manager';
    email = 'branch@atlasflow.com';
    avatarSeed = 'branch-avatar';
    menu = (
       <>
        <SidebarMenuItem>
            <SidebarMenuButton href="/" tooltip="Dashboard" isActive={pathname === '/'}>
                <Home />
                <span>Dashboard</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Deliveries">
            <Truck />
            <span>Deliveries</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Reports">
            <BarChart3 />
            <span>Reports</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </>
    );
  }


  return (
    <Sidebar collapsible="icon" defaultOpen={false}>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2">
          <Mountain className="size-6 text-primary" />
          <h1
            className="font-bold text-lg font-headline text-primary group-data-[collapsible=icon]:hidden"
          >
            {title}
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1">
        <SidebarMenu>
          {menu}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div
          className="flex items-center gap-3 p-2 rounded-lg"
        >
          <Avatar className="size-8">
            <AvatarImage src={`https://picsum.photos/seed/${avatarSeed}/40/40`} alt="User" />
            <AvatarFallback>{user.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium truncate">{user}</p>
            <p className="text-xs text-muted-foreground truncate">
              {email}
            </p>
          </div>
           <MoreHorizontal className="size-5 group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

    