
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, BookCopy, ArrowLeft } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { PreviousBookingDialog } from '../company/bookings/previous-booking-dialog';
import { useEffect, useState } from 'react';
import { loadCompanySettingsFromStorage } from '@/app/company/settings/actions';
import type { AllCompanySettings } from '@/app/company/settings/actions';

const notifications: {id: number, message: string}[] = [
  // Notifications will be populated dynamically
];

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<AllCompanySettings | null>(null);

  useEffect(() => {
    function loadProfile() {
      const profileData = loadCompanySettingsFromStorage();
      setProfile(profileData);
    }
    if(pathname.startsWith('/company')) {
        loadProfile();
    }
  }, [pathname]);

  const userRoleQuery = searchParams.get('role');

  const isAdmin = pathname.startsWith('/admin');
  const isBranch = pathname.startsWith('/company') && userRoleQuery === 'Branch';
  const isCompany = pathname.startsWith('/company') && !isBranch;


  const handleLogout = () => {
    router.push('/');
  };
  
  let user, email, userRole, avatarSeed, avatarFallback;

  if (isAdmin) {
    user = 'Sup.Admin';
    email = 'admin@transwise.in';
    userRole = 'Sup.Admin';
    avatarSeed = 'admin-avatar';
    avatarFallback = 'SA';
  } else if (isCompany) {
    user = profile?.companyName || 'Company Admin';
    email = profile?.companyEmail || 'company@transwise.in';
    userRole = 'My Account';
    avatarSeed = 'company-avatar';
    avatarFallback = user.charAt(0) || 'C';
  } else if (isBranch) {
    user = 'Priya Singh (Branch)';
    email = 'priya.singh@branch.com';
    userRole = 'My Account';
    avatarSeed = 'branch-avatar';
    avatarFallback = 'PS';
  } else {
    user = 'Guest';
    email = 'guest@transwise.in';
    avatarSeed = 'guest-avatar';
    avatarFallback = 'G';
  }


  const isNewBookingPage = pathname === '/company/bookings/new';
  const homeHref = isAdmin ? '/admin' : (isCompany ? '/company' : (isBranch ? `/company?role=Branch` : '/'));


  return (
    <header className="flex h-20 items-center gap-4 border-b bg-primary text-primary-foreground px-4 lg:px-6 sticky top-0 z-30">
      <SidebarTrigger className="md:hidden text-primary-foreground" />
      <div className="flex-1 flex items-center gap-4">
        <Link href={homeHref}>
          <div>
            <div className="font-bold text-2xl font-headline flex items-center">
              Transwise<span className="bg-red-600 text-white px-1 rounded-sm">.in</span>
            </div>
            <p className="text-xs text-primary-foreground/80">
              Simplifying Logistics Businesses
            </p>
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {isNewBookingPage && (
          <PreviousBookingDialog>
            <Button variant="ghost" className="hover:bg-primary-foreground/10">
              <BookCopy className="mr-2 h-4 w-4" />
              View Previous Booking
            </Button>
          </PreviousBookingDialog>
        )}
        <div className="text-right">
            <p className="text-sm font-medium">{user}</p>
            <p className="text-xs text-primary-foreground/80">{email}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:bg-primary-foreground/10">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0 text-xs"
                >
                  {notifications.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="text-wrap">
                  {notification.message}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem>No new notifications</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary-foreground/10">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://picsum.photos/seed/${avatarSeed}/40/40`}
                  alt="User"
                />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{userRole}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            {!isAdmin && <DropdownMenuItem>Billing</DropdownMenuItem>}
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
