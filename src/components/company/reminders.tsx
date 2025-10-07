
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, AlertTriangle, CalendarCheck, Package } from 'lucide-react';
import { getVehicles } from '@/lib/vehicle-data';
import type { VehicleMaster } from '@/lib/types';
import { getBookings } from '@/lib/bookings-dashboard-data';
import type { Booking } from '@/lib/bookings-dashboard-data';
import { differenceInDays, format, parseISO, isBefore, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import Link from 'next/link';

interface Reminder {
    type: 'Vehicle' | 'Consignment';
    message: string;
    details: string;
    level: 'warning' | 'info' | 'error';
    link?: string;
}

const DASHBOARD_SETTINGS_KEY = 'transwise_dashboard_settings';

export function Reminders() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const generateReminders = () => {
            const newReminders: Reminder[] = [];
            const today = new Date();
            
            let reminderDays = 30; // Default
            try {
                const savedSettings = localStorage.getItem(DASHBOARD_SETTINGS_KEY);
                if (savedSettings) {
                    reminderDays = JSON.parse(savedSettings).vehicleDocReminderDays || 30;
                }
            } catch (e) {
                console.error("Could not parse dashboard settings.");
            }
            
            const reminderThresholdDate = addDays(today, reminderDays);

            // 1. Check Vehicle Document Expiry
            const vehicles = getVehicles();
            vehicles.forEach(vehicle => {
                const checkDoc = (dateStr: string | undefined, docName: string) => {
                    if (!dateStr) return;
                    const expiryDate = parseISO(dateStr);
                    if (isBefore(expiryDate, today)) {
                        newReminders.push({
                            type: 'Vehicle',
                            message: `${docName} Expired`,
                            details: `${vehicle.vehicleNo} - Expired on ${format(expiryDate, 'dd-MMM-yyyy')}`,
                            level: 'error',
                            link: '/company/master/vehicle',
                        });
                    } else if (isBefore(expiryDate, reminderThresholdDate)) {
                        const daysLeft = differenceInDays(expiryDate, today);
                        newReminders.push({
                            type: 'Vehicle',
                            message: `${docName} Expiring Soon`,
                            details: `${vehicle.vehicleNo} - Expires in ${daysLeft} day(s)`,
                            level: 'warning',
                            link: '/company/master/vehicle',
                        });
                    }
                };
                checkDoc(vehicle.insuranceValidity, 'Insurance');
                checkDoc(vehicle.fitnessCertificateValidity, 'Fitness Cert.');
                checkDoc(vehicle.pucValidity, 'PUC');
            });

            // 2. Check for long-pending consignments
            const bookings = getBookings();
            bookings.forEach(booking => {
                 if (['In Stock', 'In HOLD'].includes(booking.status)) {
                     const bookingDate = parseISO(booking.bookingDate);
                     const daysPending = differenceInDays(today, bookingDate);
                     if (daysPending > 7) {
                          newReminders.push({
                            type: 'Consignment',
                            message: `Pending Since ${daysPending} Days`,
                            details: `LR #${booking.lrNo} from ${booking.fromCity} to ${booking.toCity}`,
                            level: 'warning',
                            link: '/company/stock',
                        });
                     }
                 }
            });

            setReminders(newReminders.sort((a,b) => (a.level === 'error' ? -1 : 1))); // Show errors first
            setIsLoading(false);
        };

        generateReminders();
    }, []);
    
    const getIcon = (type: Reminder['type'], level: Reminder['level']) => {
        if (level === 'error') return <AlertTriangle className="text-red-500" />;
        if (type === 'Vehicle') return <CalendarCheck className="text-yellow-500" />;
        return <Package className="text-blue-500" />;
    }

    return (
        <Card className="border border-yellow-300 bg-yellow-50/50">
            <CardHeader>
                <CardTitle className="text-yellow-800 font-bold flex items-center gap-2">
                    <Bell />
                    Reminders & Alerts
                </CardTitle>
                 <CardDescription className="text-yellow-700/80">
                    Important updates that need your attention.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-40">
                    {isLoading ? (
                        <p>Loading reminders...</p>
                    ) : reminders.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-muted-foreground">No active reminders. You're all set!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                           {reminders.map((reminder, index) => {
                                const reminderContent = (
                                    <div className="flex items-start gap-3 p-2 rounded-md hover:bg-yellow-100/50">
                                        <div className="mt-1">
                                            {getIcon(reminder.type, reminder.level)}
                                        </div>
                                        <div>
                                            <p className={cn("font-semibold text-sm", reminder.level === 'error' && 'text-red-600')}>{reminder.message}</p>
                                            <p className="text-xs text-muted-foreground">{reminder.details}</p>
                                        </div>
                                    </div>
                                );

                                if (reminder.link) {
                                    return <Link key={index} href={reminder.link} legacyBehavior>{reminderContent}</Link>
                                }
                                return React.cloneElement(reminderContent, { key: index });
                           })}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
