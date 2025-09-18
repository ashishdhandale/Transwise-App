
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
  Archive,
  BarChart3,
  BookCopy,
  Building,
  ChevronDown,
  ClipboardList,
  Database,
  FileSignature,
  FileText,
  History,
  Home,
  List,
  MapPin,
  MoreHorizontal,
  Mountain,
  Package,
  PackageSearch,
  Settings,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSidebar } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import React from 'react';

export function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  
  // Admin states
  const [openUserMenu, setOpenUserMenu] = React.useState(false);

  // Company states
  const [openDashboardMenu, setOpenDashboardMenu] = React.useState(false);
  const [openBranchMenu, setOpenBranchMenu] = React.useState(false);
  const [openConsignmentMenu, setOpenConsignmentMenu] = React.useState(false);
  const [openMasterMenu, setOpenMasterMenu] = React.useState(false);
  const [openReportsMenu, setOpenReportsMenu] = React.useState(false);

  const isAdmin = pathname.startsWith('/admin');
  const isCompany = pathname.startsWith('/company');
  const isEmployee = pathname.startsWith('/employee');
  const isBranch = !isAdmin && !isCompany && !isEmployee;

  React.useEffect(() => {
    if (
      pathname.startsWith('/admin/add-company') ||
      pathname.startsWith('/admin/users')
    ) {
      setOpenUserMenu(true);
    }
     if (pathname.startsWith('/company')) {
      setOpenDashboardMenu(true);
    }
     if (pathname.startsWith('/company/bookings') || pathname.startsWith('/company/stock')) {
      setOpenConsignmentMenu(true);
     }
     if (pathname.startsWith('/company/master')) {
      setOpenMasterMenu(true);
     }
      if (pathname.startsWith('/company/reports')) {
      setOpenReportsMenu(true);
     }
  }, [pathname]);

  React.useEffect(() => {
    if (state === 'collapsed') {
      setOpenUserMenu(false);
      setOpenDashboardMenu(false);
      setOpenBranchMenu(false);
      setOpenConsignmentMenu(false);
      setOpenMasterMenu(false);
      setOpenReportsMenu(false);
    }
  }, [state]);

  let menu, user, email, avatarSeed;

  if (isAdmin) {
    user = 'Sup.Admin';
    email = 'admin@transwise.in';
    avatarSeed = 'admin-avatar';
    menu = (
      <>
        <SidebarMenuItem>
          <SidebarMenuButton
            href="/admin"
            tooltip="Dashboard"
            isActive={pathname === '/admin'}
          >
            <Home />
            <span>Dashboard</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <Collapsible open={openUserMenu} onOpenChange={setOpenUserMenu}>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton variant="ghost" className="w-full justify-start" tooltip="Users">
              <Users />
              <span>Users</span>
              <ChevronDown
                className={cn(
                  'size-4 transition-transform ml-auto',
                  openUserMenu && 'rotate-180'
                )}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="flex flex-col gap-1 ml-7 pl-2 border-l border-border">
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/admin/users"
                  tooltip="User Dashboard"
                  size="sm"
                  isActive={pathname === '/admin/users'}
                >
                  User Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/admin/add-company"
                  tooltip="Add User"
                  size="sm"
                  isActive={pathname === '/admin/add-company'}
                >
                  Add User/Company
                </SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <SidebarMenuItem>
          <SidebarMenuButton
            href="/admin/reports"
            tooltip="Reports"
            isActive={pathname === '/admin/reports'}
          >
            <BarChart3 />
            <span>Reports</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </>
    );
  } else if (isCompany) {
    user = 'Company Manager';
    email = 'manager@company.com';
    avatarSeed = 'company-avatar';
    menu = (
      <>
        <Collapsible open={openDashboardMenu} onOpenChange={setOpenDashboardMenu}>
          <CollapsibleTrigger asChild>
             <SidebarMenuButton href="/company" variant="ghost" className="w-full justify-start" isActive={pathname === '/company' && !pathname.includes('tracking') && !pathname.includes('history')} tooltip="Dashboard">
              <Home />
              <span>Dashboard</span>
              <ChevronDown
                className={cn(
                  'size-4 transition-transform ml-auto',
                  openDashboardMenu && 'rotate-180'
                )}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex flex-col gap-1 ml-7 pl-2 border-l border-border">
              <SidebarMenuItem>
                <SidebarMenuButton href="/company/package-tracking" size="sm" isActive={pathname === '/company/package-tracking'} tooltip="Package Tracking"><PackageSearch />Package Tracking</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/company/challan-tracking" size="sm" isActive={pathname === '/company/challan-tracking'} tooltip="Challan Tracking"><ClipboardList />Challan Tracking</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/company/history" size="sm" isActive={pathname === '/company/history'} tooltip="History"><History />History</SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        <Collapsible open={openBranchMenu} onOpenChange={setOpenBranchMenu}>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton variant="ghost" className="w-full justify-start" tooltip="Branch">
              <Building />
              <span>Branch</span>
              <ChevronDown
                className={cn(
                  'size-4 transition-transform ml-auto',
                  openBranchMenu && 'rotate-180'
                )}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex flex-col gap-1 ml-7 pl-2 border-l border-border">
              <SidebarMenuItem>
                <SidebarMenuButton href="#" size="sm" tooltip="Employees"><Users />Employees</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" size="sm" tooltip="User Management"><Users />User Management</SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible open={openConsignmentMenu} onOpenChange={setOpenConsignmentMenu}>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton variant="ghost" className="w-full justify-start" tooltip="Consignment">
              <BookCopy />
              <span>Consignment</span>
              <ChevronDown
                className={cn(
                  'size-4 transition-transform ml-auto',
                  openConsignmentMenu && 'rotate-180'
                )}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex flex-col gap-1 ml-7 pl-2 border-l border-border">
              <SidebarMenuItem>
                <SidebarMenuButton href="/company/bookings" size="sm" isActive={pathname.startsWith('/company/bookings')} tooltip="Bookings"><BookCopy />Bookings</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" size="sm" tooltip="Challan"><FileText />Challan</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" size="sm" tooltip="Deliveries"><Truck />Deliveries</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" size="sm" tooltip="Bills"><FileText />Bills</SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton href="/company/stock" size="sm" isActive={pathname.startsWith('/company/stock')} tooltip="Stock"><Archive />Stock</SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        <SidebarMenuItem>
          <SidebarMenuButton
            href="/company/accounts"
            tooltip="Accounts"
            isActive={pathname.startsWith('/company/accounts')}
          >
            <Wallet />
            <span>Accounts</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <Collapsible open={openMasterMenu} onOpenChange={setOpenMasterMenu}>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton variant="ghost" className="w-full justify-start" tooltip="Master">
              <Database />
              <span>Master</span>
              <ChevronDown
                className={cn(
                  'size-4 transition-transform ml-auto',
                  openMasterMenu && 'rotate-180'
                )}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex flex-col gap-1 ml-7 pl-2 border-l border-border">
              <SidebarMenuItem>
                <SidebarMenuButton href="/company/master/city" size="sm" isActive={pathname === '/company/master/city'} tooltip="City"><MapPin />City</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/company/master/customer" size="sm" isActive={pathname === '/company/master/customer'} tooltip="Customer"><Users />Customer</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/company/master/item" size="sm" isActive={pathname === '/company/master/item'} tooltip="Items"><Package />Items</SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton href="#" size="sm" tooltip="Quotation"><FileSignature />Quotation</SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton href="#" size="sm" tooltip="Rate list"><List />Rate list</SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        <Collapsible open={openReportsMenu} onOpenChange={setOpenReportsMenu}>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton variant="ghost" className="w-full justify-start" tooltip="Reports">
              <BarChart3 />
              <span>Reports</span>
              <ChevronDown
                className={cn(
                  'size-4 transition-transform ml-auto',
                  openReportsMenu && 'rotate-180'
                )}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex flex-col gap-1 ml-7 pl-2 border-l border-border">
              <SidebarMenuItem>
                <SidebarMenuButton href="/company/reports/history" size="sm" isActive={pathname === '/company/reports/history'} tooltip="History">
                  <History /> History
                </SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          </CollapsibleContent>
        </Collapsible>

         <SidebarMenuItem>
            <SidebarMenuButton
              href="/company/settings"
              tooltip="Settings"
              isActive={pathname.startsWith('/company/settings')}
            >
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
      </>
    );
  } else if (isEmployee) {
    user = 'Driver';
    email = 'driver@transwise.in';
    avatarSeed = 'employee-avatar';
    menu = (
      <>
        <SidebarMenuItem>
          <SidebarMenuButton
            href="/employee"
            tooltip="My Deliveries"
            isActive={pathname === '/employee'}
          >
            <Truck />
            <span>My Deliveries</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </>
    );
  } else {
    // Branch User
    user = 'Branch Manager';
    email = 'branch@transwise.in';
    avatarSeed = 'branch-avatar';
    menu = (
      <>
        <SidebarMenuItem>
          <SidebarMenuButton
            href="/"
            tooltip="Dashboard"
            isActive={pathname === '/'}
          >
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
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <Link href={isAdmin ? '/admin' : isCompany ? '/company' : '/'}>
          <div
            className={cn("flex items-center gap-2", state === 'collapsed' && "group-hover/sidebar-wrapper:flex",  state === 'expanded' && 'flex')}
          >
            <Mountain />
            <span className="font-semibold text-lg">Transwise</span>
          </div>
           <div className={cn("hidden", state === 'collapsed' && "group-hover/sidebar-wrapper:hidden")}>
            <Mountain />
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1">
        <SidebarMenu>{menu}</SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              href={isAdmin ? '/admin/settings' : '#'}
              tooltip="Settings"
              isActive={pathname.startsWith('/admin/settings')}
            >
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center gap-3 p-2 rounded-lg">
          <Avatar className="size-8">
            <AvatarImage
              src={`https://picsum.photos/seed/${avatarSeed}/40/40`}
              alt="User"
            />
            <AvatarFallback>{user.substring(0, 2)}</AvatarFallback>
          </Avatar>
           <div className={cn("flex-1 overflow-hidden", state === 'collapsed' && 'group-hover/sidebar-wrapper:block hidden', state === 'expanded' && 'block')}>
            <p className="text-sm font-medium truncate">{user}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
          <MoreHorizontal className={cn("size-5", state === 'collapsed' && 'group-hover/sidebar-wrapper:block hidden', state === 'expanded' && 'block')} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
