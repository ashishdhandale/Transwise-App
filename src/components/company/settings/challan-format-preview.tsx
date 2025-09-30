
'use client';

import type { ChallanFormat } from './challan-format-settings';

interface ChallanFormatPreviewProps {
    format: ChallanFormat;
}

const PreviewSection = ({ isVisible, title, children }: { isVisible: boolean; title?: string; children: React.ReactNode }) => {
    if (!isVisible) return <div className="border border-dashed border-gray-300 bg-gray-100 p-4 text-center text-muted-foreground text-sm">{title} Hidden</div>;
    return <div className="border border-black border-dashed p-2">{children}</div>;
};

const PreviewField = ({ isVisible, label, value }: { isVisible: boolean; label: string; value: React.ReactNode }) => {
    if (!isVisible) return null;
    return (
        <div className="flex text-xs">
            <p className="w-28 font-semibold">{label}</p>
            <p className="flex-1">: {value}</p>
        </div>
    );
};

export function ChallanFormatPreview({ format }: ChallanFormatPreviewProps) {
    const getField = (groupId: string, fieldId: string) => {
        return format.fieldGroups.find(g => g.groupLabel === groupId)?.fields.find(f => f.id === fieldId)?.checked ?? false;
    };
    
    const showHeader = format.fieldGroups.some(g => g.groupLabel === 'Header' && g.fields.some(f => f.checked));
    const showChallanInfo = format.fieldGroups.some(g => g.groupLabel === 'Challan Info' && g.fields.some(f => f.checked));
    const showLrTable = getField('LR Table', 'lrTableRows');
    const showLrTableHeader = getField('LR Table', 'lrTableHeader');
    const showLrTableTotals = getField('LR Table', 'lrTableTotals');
    const showFooter = format.fieldGroups.some(g => g.groupLabel === 'Footer' && g.fields.some(f => f.checked));

    return (
        <div className="p-4 font-mono text-xs text-black bg-white shadow-lg">
            <PreviewSection isVisible={showHeader} title="Header">
                 <div className="text-center pb-2 space-y-1">
                    {getField('Header', 'companyName') && <h1 className="text-lg font-bold">YOUR COMPANY NAME</h1>}
                    {getField('Header', 'companyAddress') && <p className="text-xs">Your Company Address, City, Pincode</p>}
                    {getField('Header', 'companyContact') && <p className="text-xs">Ph: 9999900000 | Email: contact@yourcompany.com</p>}
                    {getField('Header', 'documentTitle') && <p className="text-sm font-bold underline mt-2">LOADING SLIP</p>}
                </div>
            </PreviewSection>

            <PreviewSection isVisible={showChallanInfo} title="Challan Info">
                <div className="grid grid-cols-2 gap-x-4 border-y border-black py-2 my-2">
                    <div>
                        <PreviewField isVisible={getField('Challan Info', 'challanNo')} label="Challan No" value="CHLN-123" />
                        <PreviewField isVisible={getField('Challan Info', 'fromStation')} label="From" value="CITY A" />
                        <PreviewField isVisible={getField('Challan Info', 'toStation')} label="To" value="CITY B" />
                    </div>
                    <div>
                        <PreviewField isVisible={getField('Challan Info', 'challanDate')} label="Date" value="01-Jan-2025" />
                        <PreviewField isVisible={getField('Challan Info', 'vehicleNo')} label="Vehicle No" value="MH-01-XX-9999" />
                        <PreviewField isVisible={getField('Challan Info', 'driverName')} label="Driver" value="DRIVER NAME" />
                    </div>
                </div>
            </PreviewSection>

            <PreviewSection isVisible={showLrTable} title="LR Table">
                <table className="w-full border-collapse border border-black mt-2 text-[10px]">
                    {showLrTableHeader && (
                        <thead>
                            <tr className="border border-black">
                                <th className="border border-black p-1">#</th>
                                <th className="border border-black p-1">LR No</th>
                                <th className="border border-black p-1">To</th>
                                <th className="border border-black p-1">Consignee</th>
                                <th className="border border-black p-1">Pkgs</th>
                                <th className="border border-black p-1">Act. Wt.</th>
                            </tr>
                        </thead>
                    )}
                    <tbody>
                        <tr>
                            <td className="border border-black p-1">1</td>
                            <td className="border border-black p-1">LRN-001</td>
                            <td className="border border-black p-1">CITY B</td>
                            <td className="border border-black p-1">RECEIVER 1</td>
                            <td className="border border-black p-1 text-center">10</td>
                            <td className="border border-black p-1 text-right">250.00</td>
                        </tr>
                         <tr>
                            <td className="border border-black p-1">2</td>
                            <td className="border border-black p-1">LRN-002</td>
                            <td className="border border-black p-1">CITY B</td>
                            <td className="border border-black p-1">RECEIVER 2</td>
                            <td className="border border-black p-1 text-center">5</td>
                            <td className="border border-black p-1 text-right">100.00</td>
                        </tr>
                    </tbody>
                    {showLrTableTotals && (
                         <tfoot>
                            <tr className="font-bold">
                                <td className="border border-black p-1 text-right" colSpan={3}>TOTAL:</td>
                                <td className="border border-black p-1 text-center">2 Items</td>
                                <td className="border border-black p-1 text-center">15</td>
                                <td className="border border-black p-1 text-right">350.00</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </PreviewSection>

            <PreviewSection isVisible={showFooter} title="Footer">
                {getField('Footer', 'remarks') && (
                     <div className="mt-2 border border-black p-2">
                        <h3 className="font-bold underline text-xs mb-1">Remarks / Dispatch Note</h3>
                        <p className="text-xs min-h-[40px]">Sample remarks for the dispatch.</p>
                    </div>
                )}
                 <div className="grid grid-cols-2 gap-4 mt-8 pt-8">
                    {getField('Footer', 'driverSignature') && <div className="text-center text-xs border-t border-black pt-1">Driver Signature</div>}
                    {getField('Footer', 'loadingInchargeSignature') && <div className="text-center text-xs border-t border-black pt-1">Loading Incharge</div>}
                </div>
            </PreviewSection>
        </div>
    );
}
