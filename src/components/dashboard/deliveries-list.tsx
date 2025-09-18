
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { deliveries } from '@/lib/data';
import type { DeliveryStatus } from '@/lib/types';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { ClientOnly } from '../ui/client-only';

const statusColors: Record<DeliveryStatus, string> = {
  Pending: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:text-yellow-400',
  'In Transit': 'bg-primary/20 text-primary border-primary/30',
  Delivered: 'bg-accent/20 text-green-700 border-accent/30 dark:text-green-400',
  Delayed: 'bg-destructive/20 text-destructive border-destructive/30',
  Cancelled: 'bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30',
};

const tdClass = "whitespace-nowrap";

function FormattedDate({ dateString }: { dateString: string }) {
  return <>{format(parseISO(dateString), "MMM d, h:mm a")}</>;
}


export function DeliveriesList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Recent Deliveries</CardTitle>
        <CardDescription>
          A list of recent deliveries and their status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className={cn(tdClass, "font-medium")}>{delivery.id}</TableCell>
                  <TableCell className={cn(tdClass)}>{delivery.customer}</TableCell>
                  <TableCell className={cn(tdClass)}>
                    <Badge
                      variant="outline"
                      className={statusColors[delivery.status]}
                    >
                      {delivery.status}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn(tdClass)}>
                    <ClientOnly>
                      <FormattedDate dateString={delivery.eta} />
                    </ClientOnly>
                  </TableCell>
                  <TableCell className={cn(tdClass)}>
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
                        <DropdownMenuItem>Update Status</DropdownMenuItem>
                        <DropdownMenuItem>Contact Customer</DropdownMenuItem>
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
  );
}
