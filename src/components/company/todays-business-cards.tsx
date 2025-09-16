import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const summaryData = [
  {
    title: 'Bookings',
    value: '250',
    details: '(To Be Billed:<>,ToPay:<>,PAID:<>)',
  },
  { title: 'Deliveries', value: 'Count', details: '(To Be Billed:<>,ToPay:<>,PAID:<>)' },
  { title: 'Cancelled Bookings', value: 'Count', details: '(To Be Billed:<>,ToPay:<>,PAID:<>)' },
  { title: 'Vehicle Dispatch', value: 'Count', details: '' },
  { title: 'Vehicle Inward', value: 'Count', details: '' },
  { title: 'Deliveries', value: 'Count', details: '(ONBILL<>,CASH:<>,Other<>)' },
  { title: 'Revenue', value: 'Rs.<amount>', details: 'Bookings: Rs.<>+Deliveries:Rs<>+Bills: Rs<>' },
];

export function TodaysBusinessCards() {
  return (
    <Card className="bg-white border border-[#b2dfdb]">
      <CardHeader>
        <CardTitle className="text-center text-primary font-bold">
          Today's Business
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {summaryData.map((item, index) => (
          <Card
            key={index}
            className="bg-accent text-accent-foreground border-2 border-[#4db6ac] rounded-lg"
          >
            <CardContent className="p-3 text-center">
              <p className="text-sm">{item.title}</p>
              <p className="text-2xl font-bold">{item.value}</p>
              {item.details && <p className="text-xs text-accent-foreground/80">{item.details}</p>}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
