
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
  Award,
  BarChart3,
  BookCopy,
  Building,
  ChevronDown,
  ClipboardList,
  Database,
  FileSignature,
  FileText,
  FileX,
  Handshake,
  History,
  Home,
  List,
  MapPin,
  MoreHorizontal,
  Mountain,
  Notebook,
  Package,
  PackageSearch,
  Settings,
  Sheet,
  Truck,
  User,
  Users,
  Wallet,
  Wrench,
  UserPlus
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSidebar } from '@/components/ui/sidebar';
import { usePathname, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();

  const userRoleQuery = searchParams.get('role');
  
  // Menu states
  const [openUserMenu, setOpenUserMenu] = React.useState(false);
  const [openDashboardMenu, setOpenDashboardMenu] = React.useState(false);
  const [openBranchMenu, setOpenBranchMenu] = React.useState(false);
  const [openConsignmentMenu, setOpenConsignmentMenu] = React.useState(false);
  const [openAccountsMenu, setOpenAccountsMenu] = React.useState(false);
  const [openMasterMenu, setOpenMasterMenu] = React.useState(false);
  const [openReportsMenu, setOpenReportsMenu] = React.useState(false);
  const [openUtilityMenu, setOpenUtilityMenu] = React.useState(false);


  const isAdmin = pathname.startsWith('/admin');
  const isBranch = pathname.startsWith('/company') && userRoleQuery === 'Branch';
  const isCompany = pathname.startsWith('/company') && !isBranch;


  React.useEffect(() => {
    const shouldOpenUserMenu = pathname.startsWith('/admin/users') || pathname.startsWith('/admin/add-company');
    setOpenUserMenu(shouldOpenUserMenu);

    const shouldOpenDashboard = pathname === '/company' || pathname.startsWith('/company/package-tracking') || pathname.startsWith('/company/challan-tracking') || pathname.startsWith('/company/history');
    setOpenDashboardMenu(shouldOpenDashboard);

    const shouldOpenBranchMenu = pathname.startsWith('/company/branch');
    setOpenBranchMenu(shouldOpenBranchMenu);

    const shouldOpenConsignmentMenu = pathname.startsWith('/company/bookings') || pathname.startsWith('/company/stock') || pathname.startsWith('/company/challan') || pathname.startsWith('/company/vehicle-hire') || pathname.startsWith('/company/deliveries');
    setOpenConsignmentMenu(shouldOpenConsignmentMenu);

    const shouldOpenAccountsMenu = pathname.startsWith('/company/accounts');
    setOpenAccountsMenu(shouldOpenAccountsMenu);

    const shouldOpenMasterMenu = pathname.startsWith('/company/master');
    setOpenMasterMenu(shouldOpenMasterMenu);

    const shouldOpenReportsMenu = pathname.startsWith('/company/reports');
    setOpenReportsMenu(shouldOpenReportsMenu);

    const shouldOpenUtilityMenu = pathname.startsWith('/company/vehicle-expenses') || pathname.startsWith('/company/utility/staff');
    setOpenUtilityMenu(shouldOpenUtilityMenu);
    
  }, [pathname]);

  React.useEffect(() => {
    if (state === 'collapsed') {
      setOpenUserMenu(false);
      setOpenDashboardMenu(false);
      setOpenBranchMenu(false);
      setOpenConsignmentMenu(false);
      setOpenAccountsMenu(false);
      setOpenMasterMenu(false);
      setOpenReportsMenu(false);
      setOpenUtilityMenu(false);
    }
  }, [state]);

  let menu, user, email, avatarSeed, avatarFallback;
  const homeHref = isAdmin ? '/admin' : isCompany ? '/company' : (isBranch ? `/company?role=Branch` : '/');


  if (isAdmin) {
    user = 'Sup.Admin';
    email = 'admin@transwise.in';
    avatarSeed = 'admin-avatar';
    avatarFallback = 'SA';
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
        
        <SidebarMenuItem>
          <SidebarMenuButton
            href="/admin/users"
            tooltip="Users"
            isActive={pathname.startsWith('/admin/users') || pathname.startsWith('/admin/add-company')}
          >
            <Users />
            <span>Users</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            href="/admin/licence"
            tooltip="Licence"
            isActive={pathname === '/admin/licence'}
          >
            <Award />
            <span>Licence Management</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

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
  } else if (isCompany || isBranch) {
    user = isCompany ? 'Company User' : 'Priya Singh (Branch)';
    email = isCompany ? 'manager@company.com' : 'staff@branch.com';
    avatarSeed = isCompany ? 'company-avatar' : 'branch-avatar';
    avatarFallback = isCompany ? 'CU' : 'PS';
    
    const consignmentMenu = (
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
                <SidebarMenuButton href={isBranch ? "/company/bookings?role=Branch" : "/company/bookings"} size="sm" isActive={pathname.startsWith('/company/bookings')} tooltip="Bookings"><BookCopy />Bookings</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href={isBranch ? "/company/challan?role=Branch" : "/company/challan"} size="sm" isActive={pathname.startsWith('/company/challan')} tooltip="Challan"><FileText />Challan</SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton href={isBranch ? "/company/vehicle-hire?role=Branch" : "/company/vehicle-hire"} size="sm" isActive={pathname.startsWith('/company/vehicle-hire')} tooltip="Vehicle Hire"><Truck />Vehicle Hire</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href={isBranch ? "/company/deliveries?role=Branch" : "/company/deliveries"} size="sm" isActive={pathname.startsWith('/company/deliveries')} tooltip="Deliveries"><Truck />Deliveries</SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton href={isBranch ? "/company/stock?role=Branch" : "/company/stock"} size="sm" isActive={pathname.startsWith('/company/stock')} tooltip="Stock"><Archive />Stock</SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          </CollapsibleContent>
        </Collapsible>
    );

    const accountsMenu = (
        <Collapsible open={openAccountsMenu} onOpenChange={setOpenAccountsMenu}>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton variant="ghost" className="w-full justify-start" tooltip="Accounts">
              <Wallet />
              <span>Accounts</span>
              <ChevronDown
                className={cn(
                  'size-4 transition-transform ml-auto',
                  openAccountsMenu && 'rotate-180'
                )}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex flex-col gap-1 ml-7 pl-2 border-l border-border">
              <SidebarMenuItem>
                <SidebarMenuButton href={isBranch ? "/company/accounts/ledger?role=Branch" : "/company/accounts/ledger"} size="sm" isActive={pathname.startsWith('/company/accounts/ledger')} tooltip="Ledger">
                  <Notebook /> Ledger
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href={isBranch ? "/company/accounts/cashbook?role=Branch" : "/company/accounts/cashbook"} size="sm" isActive={pathname.startsWith('/company/accounts/cashbook')} tooltip="Cashbook">
                  <Notebook /> Cashbook
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href={isBranch ? "/company/accounts/voucher-entry?role=Branch" : "/company/accounts/voucher-entry"} size="sm" isActive={pathname.startsWith('/company/accounts/voucher-entry')} tooltip="Voucher Entry">
                  <Sheet /> Voucher Entry
                </SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          </CollapsibleContent>
        </Collapsible>
    );

    menu = (
      <>
        <Collapsible open={openDashboardMenu} onOpenChange={setOpenDashboardMenu}>
          <CollapsibleTrigger asChild>
             <SidebarMenuButton href={homeHref} variant="ghost" className="w-full justify-start" isActive={pathname === '/company'} tooltip="Dashboard">
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
                <SidebarMenuButton href={isBranch ? "/company/package-tracking?role=Branch" : "/company/package-tracking"} size="sm" isActive={pathname === '/company/package-tracking'} tooltip="Package Tracking"><PackageSearch />Package Tracking</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href={isBranch ? "/company/challan-tracking?role=Branch" : "/company/challan-tracking"} size="sm" isActive={pathname === '/company/challan-tracking'} tooltip="Challan Tracking"><ClipboardList />Challan Tracking</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href={isBranch ? "/company/history?role=Branch" : "/company/history"} size="sm" isActive={pathname === '/company/history'} tooltip="History"><History />History</SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        {isCompany && (
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
                    <SidebarMenuButton href="/company/branch" size="sm" isActive={pathname.startsWith('/company/branch')} tooltip="Branch Management"><Building />Branch Management</SidebarMenuButton>
                </SidebarMenuItem>
                </div>
            </CollapsibleContent>
            </Collapsible>
        )}

        {consignmentMenu}

        {!isBranch && accountsMenu}

        {isCompany && (
            <>
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
                        <SidebarMenuButton href="/company/master/account" size="sm" isActive={pathname === '/company/master/account'} tooltip="Chart of Accounts"><Wallet />Chart of Accounts</SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton href="/company/master/city" size="sm" isActive={pathname === '/company/master/city'} tooltip="Stations"><MapPin />Stations</SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton href="/company/master/customer" size="sm" isActive={pathname === '/company/master/customer'} tooltip="Customer"><Users />Customer</SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton href="/company/master/item" size="sm" isActive={pathname === '/company/master/item'} tooltip="Items"><Package />Items</SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton href="/company/master/vendor" size="sm" isActive={pathname === '/company/master/vendor'} tooltip="Vendors"><Handshake />Vendors</SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton href="/company/master/driver" size="sm" isActive={pathname === '/company/master/driver'} tooltip="Drivers"><User />Drivers</SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton href="/company/master/vehicle" size="sm" isActive={pathname === '/company/master/vehicle'} tooltip="Vehicles"><Truck />Vehicles</SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton href="/company/master/rate-list" size="sm" isActive={pathname.startsWith('/company/master/rate-list') || pathname.startsWith('/company/master/quotation')} tooltip="Quotation"><FileSignature />Quotation</SidebarMenuButton>
                    </SidebarMenuItem>
                    </div>
                </CollapsibleContent>
                </Collapsible>
                
                <Collapsible open={openUtilityMenu} onOpenChange={setOpenUtilityMenu}>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton variant="ghost" className="w-full justify-start" tooltip="Utility">
                    <Wrench />
                    <span>Utility</span>
                    <ChevronDown
                        className={cn(
                        'size-4 transition-transform ml-auto',
                        openUtilityMenu && 'rotate-180'
                        )}
                    />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="flex flex-col gap-1 ml-7 pl-2 border-l border-border">
                    <SidebarMenuItem>
                        <SidebarMenuButton href="/company/vehicle-expenses" size="sm" isActive={pathname.startsWith('/company/vehicle-expenses')} tooltip="Vehicle Expenses"><Wrench />Vehicle Expenses</SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton href="/company/utility/staff" size="sm" isActive={pathname.startsWith('/company/utility/staff')} tooltip="Staff Management"><Users />Staff Management</SidebarMenuButton>
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
                            <SidebarMenuButton href="/company/reports/daily-booking" size="sm" isActive={pathname === '/company/reports/daily-booking'} tooltip="Daily Booking Report">
                                <BookCopy /> Daily Booking Report
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton href="/company/reports/booking-type" size="sm" isActive={pathname === '/company/reports/booking-type'} tooltip="Booking Type Wise Report">
                                <List /> Booking Type Wise
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton href="/company/reports/cancellation" size="sm" isActive={pathname === '/company/reports/cancellation'} tooltip="Cancellation Report">
                                <FileX /> Cancellation Report
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton href="/company/reports/dispatch-challan" size="sm" isActive={pathname === '/company/reports/dispatch-challan'} tooltip="Dispatch Challan Report">
                                <Truck /> Dispatch Challan
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton href="/company/reports/history" size="sm" isActive={pathname === '/company/reports/history'} tooltip="History">
                            <History /> History
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton href="/company/reports/tax" size="sm" isActive={pathname === '/company/reports/tax'} tooltip="Tax Report">
                            <FileText /> Tax Report
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </div>
                </CollapsibleContent>
                </Collapsible>
            </>
        )}
      </>
    );
  } else {
    // Fallback for any other route
    user = 'Guest';
    email = 'guest@transwise.in';
    avatarSeed = 'guest-avatar';
    avatarFallback = 'G';
    menu = (
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
    );
  }

  const settingsHref = isCompany ? "/company/settings" : isBranch ? "/company/branch/settings" : "/admin/settings";

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <Link href={homeHref}>
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
              href={settingsHref}
              tooltip="Settings"
              isActive={pathname.endsWith('/settings')}
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
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
           <div className={cn("flex-1 overflow-hidden", state === 'collapsed' && 'group-hover/sidebar-wrapper:block hidden', state === 'expanded' && 'block')}>
            <p className="text-sm font-medium truncate">{user}</p>
            <p className="text-sm text-muted-foreground truncate">{email}</p>
          </div>
          <MoreHorizontal className={cn("size-5", state === 'collapsed' && 'group-hover/sidebar-wrapper:block hidden', state === 'expanded' && 'block')} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
