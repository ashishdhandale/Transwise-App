'use client';

import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TotalCollectedChart } from './total-collected-chart';
import { ThisMonthCharts } from './this-month-charts';
import { SalesByMembershipChart } from './sales-by-membership-chart';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';

export default function ReportsDashboard() {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    const input = reportRef.current;
    if (!input) return;

    // Temporarily increase resolution for better quality
    const scale = 2;
    const canvas = await html2canvas(input, {
      scale: scale,
      useCORS: true,
      backgroundColor: null,
    });
    
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('transwise-reports.pdf');
  };

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Reports</h1>
            <Button onClick={handleDownloadPdf}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
            </Button>
        </div>
      <div ref={reportRef} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Total Collected All Time (line graph)</CardTitle>
            </CardHeader>
            <CardContent>
                <TotalCollectedChart />
            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                <CardTitle>This Month</CardTitle>
            </CardHeader>
            <CardContent>
                <ThisMonthCharts />
            </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
            <CardTitle>Sales By Membership</CardTitle>
            </CardHeader>
            <CardContent>
            <SalesByMembershipChart />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
