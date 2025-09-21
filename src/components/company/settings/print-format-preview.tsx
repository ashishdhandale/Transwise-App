
'use client';

import type { PrintFormat } from './print-format-settings';

interface PrintFormatPreviewProps {
    format: PrintFormat;
}

const PreviewSection = ({ isVisible, title, children }: { isVisible: boolean; title?: string; children: React.ReactNode }) => {
    if (!isVisible) return <div className="border border-dashed border-gray-300 bg-gray-100 p-4 text-center text-muted-foreground text-sm">{title} Hidden</div>;
    return <div className="border border-black border-dashed p-2">{children}</div>;
};

const PreviewField = ({ isVisible, label, value }: { isVisible: boolean; label: string; value: React.ReactNode }) => {
    if (!isVisible) return null;
    return (
        <div className="flex">
            <p className="w-28 font-semibold">{label}</p>
            <p className="flex-1">: {value}</p>
        </div>
    );
};

export function PrintFormatPreview({ format }: PrintFormatPreviewProps) {
    const getField = (groupId: string, fieldId: string) => {
        return format.fieldGroups.find(g => g.groupLabel === groupId)?.fields.find(f => f.id === fieldId)?.checked ?? false;
    };
    
    // Header
    const showHeader = format.fieldGroups.some(g => g.groupLabel === 'Header' && g.fields.some(f => f.checked));
    
    // Booking Info
    const showBookingInfo = format.fieldGroups.some(g => g.groupLabel === 'Booking Info' && g.fields.some(f => f.checked));

    // Parties
    const showParties = format.fieldGroups.some(g => g.groupLabel === 'Parties' && g.fields.some(f => f.checked));
    
    // FTL
    const showFtl = format.fieldGroups.some(g => g.groupLabel === 'Vehicle (FTL)' && g.fields.some(f => f.checked));

    // Items
    const showItemTable = getField('Item Table', 'itemTableRows');
    const showItemHeader = getField('Item Table', 'itemTableHeader');
    const showItemTotals = getField('Item Table', 'itemTableTotals');

    // Footer
    const showFooter = format.fieldGroups.some(g => g.groupLabel === 'Charges & Footer' && g.fields.some(f => f.checked));


    return (
        <div className="p-4 font-mono text-xs text-black bg-white shadow-lg">
             <PreviewSection isVisible={showHeader} title="Header">
                 <div className="grid grid-cols-3 gap-4 pb-2">
                    <div className="col-span-2">
                        {getField('Header', 'companyName') && <h1 className="text-lg font-bold">YOUR COMPANY NAME</h1>}
                        {getField('Header', 'companyAddress') && <p>Your Company Address, City, Pincode</p>}
                        {getField('Header', 'companyContact') && <p>Ph: 9999900000 | Email: contact@yourcompany.com</p>}
                        {getField('Header', 'companyGstin') && <p>GSTIN: YOURGSTIN12345</p>}
                    </div>
                    <div className="text-right">
                        {getField('Header', 'grNote') && <p className="font-bold text-sm">GR / CN NOTE</p>}
                        {getField('Header', 'copyType') && <p className="font-bold">PREVIEW COPY</p>}
                    </div>
                </div>
            </PreviewSection>

            <PreviewSection isVisible={showBookingInfo} title="Booking Info">
                <div className="grid grid-cols-2 gap-4 mt-2 pb-2">
                    <div>
                        <PreviewField isVisible={getField('Booking Info', 'grNo')} label="GR No" value="GRN-12345" />
                        <PreviewField isVisible={getField('Booking Info', 'grDate')} label="GR Date" value="01-Jan-2025" />
                    </div>
                    <div>
                        <PreviewField isVisible={getField('Booking Info', 'fromStation')} label="From" value="CITY A" />
                        <PreviewField isVisible={getField('Booking Info', 'toStation')} label="To" value="CITY B" />
                    </div>
                </div>
            </PreviewSection>
            
            <PreviewSection isVisible={showParties} title="Parties">
                 <div className="grid grid-cols-2 gap-4 mt-2 pb-2">
                    <div>
                        {getField('Parties', 'consignorName') && <p className="font-semibold">CONSIGNOR NAME</p>}
                        {getField('Parties', 'consignorAddress') && <p>Consignor Address, City</p>}
                    </div>
                    <div>
                        {getField('Parties', 'consigneeName') && <p className="font-semibold">CONSIGNEE NAME</p>}
                        {getField('Parties', 'consigneeAddress') && <p>Consignee Address, City</p>}
                    </div>
                </div>
            </PreviewSection>
            
             <PreviewSection isVisible={showFtl} title="Vehicle (FTL) Details">
                 <div className="grid grid-cols-3 gap-x-4 mt-2 pb-2">
                    <PreviewField isVisible={getField('Vehicle (FTL)', 'ftlVehicleNo')} label="Vehicle No:" value="MH-01-AB-1234" />
                    <PreviewField isVisible={getField('Vehicle (FTL)', 'ftlDriver')} label="Driver:" value="DRIVER NAME" />
                    <PreviewField isVisible={getField('Vehicle (FTL)', 'ftlSupplier')} label="Supplier:" value="SUPPLIER NAME" />
                    <PreviewField isVisible={getField('Vehicle (FTL)', 'ftlTruckFreight')} label="Truck Freight:" value="25000.00" />
                    <PreviewField isVisible={getField('Vehicle (FTL)', 'ftlAdvance')} label="Advance:" value="5000.00" />
                    <PreviewField isVisible={getField('Vehicle (FTL)', 'ftlBalance')} label="Balance:" value="20000.00" />
                </div>
            </PreviewSection>

            <PreviewSection isVisible={showItemTable} title="Item Table">
                <table className="w-full border-collapse border border-black mt-2 text-[10px]">
                    {showItemHeader && (
                        <thead>
                            <tr className="border border-black">
                                <th className="border border-black p-1">Description of Goods</th>
                                <th className="border border-black p-1">Qty</th>
                                <th className="border border-black p-1">Weight</th>
                                <th className="border border-black p-1">Freight</th>
                            </tr>
                        </thead>
                    )}
                    <tbody>
                        <tr>
                            <td className="border border-black p-1">SAMPLE ITEM 1</td>
                            <td className="border border-black p-1 text-center">5</td>
                            <td className="border border-black p-1 text-right">150.00</td>
                            <td className="border border-black p-1 text-right">750.00</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1">SAMPLE ITEM 2</td>
                            <td className="border border-black p-1 text-center">2</td>
                            <td className="border border-black p-1 text-right">100.00</td>
                            <td className="border border-black p-1 text-right">500.00</td>
                        </tr>
                    </tbody>
                    {showItemTotals && (
                         <tfoot>
                            <tr className="font-bold">
                                <td className="border border-black p-1 text-right">TOTAL</td>
                                <td className="border border-black p-1 text-center">7</td>
                                <td className="border border-black p-1 text-right">250.00</td>
                                <td className="border border-black p-1 text-right">1250.00</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </PreviewSection>

            <PreviewSection isVisible={showFooter} title="Footer">
                 <div className="grid grid-cols-2 gap-4 mt-2">
                    {getField('Charges & Footer', 'termsConditions') && <div className="border border-black p-1 text-[9px]">
                        <p className="font-bold">TERMS & CONDITIONS:</p>
                        <ol className="list-decimal list-inside"><li>All disputes subject to jurisdiction.</li><li>Goods at owner's risk.</li></ol>
                    </div>}
                    <div className="border border-black p-1">
                        {getField('Charges & Footer', 'chargesSummary') && <div className="text-[10px]">
                            <p className="font-semibold flex justify-between">Sub Total: <span>1250.00</span></p>
                            <p className="flex justify-between">Other Charge: <span>50.00</span></p>
                            <p className="flex justify-between">GST: <span>65.00</span></p>
                        </div>}
                        {getField('Charges & Footer', 'grandTotal') && <p className="font-bold text-sm flex justify-between border-t border-black mt-1 pt-1">GRAND TOTAL: <span>1365.00</span></p>}
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4 mt-4 pt-12">
                    {getField('Charges & Footer', 'receiverSignature') && <div className="text-center border-t border-black pt-1">Receiver's Signature</div>}
                    {getField('Charges & Footer', 'authorisedSignature') && <div className="text-center border-t border-black pt-1">Authorised Signatory</div>}
                </div>
            </PreviewSection>
        </div>
    );
}

