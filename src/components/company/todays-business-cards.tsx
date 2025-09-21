
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CompanyProfileFormValues } from './settings/company-profile-settings';

interface SummaryItem {
    title: string;
    value: string;
    details?: string;
    isCurrency?: boolean;
}

interface TodaysBusinessCardsProps {
    data: SummaryItem[];
    profile: CompanyProfileFormValues | null;
}

const defaultData = [
  { title: 'Bookings', value: '0' },
  { title: 'Deliveries', value: '0' },
  { title: 'Cancelled Bookings', value: '0' },
  { title: 'Vehicle Dispatch', value: '0' },
  { title: 'Vehicle Inward', value: '0' },
  { title: 'Revenue', value: '0', isCurrency: true },
];


export function TodaysBusinessCards({ data, profile }: TodaysBusinessCardsProps) {
  const displayData = data && data.length > 0 ? data : defaultData;

  const formatValue = (item: SummaryItem) => {
    if (item.isCurrency && profile) {
        const numericValue = parseFloat(item.value.replace(/[^0-9.-]+/g,""));
        if (!isNaN(numericValue)) {
            return numericValue.toLocaleString(profile.countryCode, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        }
    }
    return item.value;
  };

  return (
    <Card className="bg-white border border-[#b2dfdb]">
      <CardHeader>
        <CardTitle className="text-center text-primary font-bold">
          Today's Business
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayData.map((item, index) => (
          <Card
            key={index}
            className="bg-accent text-accent-foreground border-2 border-[#4db6ac] rounded-lg"
          >
            <CardContent className="p-3 text-center">
              <p className="text-sm">{item.title}</p>
              <p className="text-2xl font-bold">{formatValue(item)}</p>
              {item.details && <p className="text-xs text-accent-foreground/80">{item.details}</p>}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
