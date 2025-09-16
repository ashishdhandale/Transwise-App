
export const bookingOptions = {
    loadTypes: [
        { value: 'PTL', label: 'PTL [Part Truck]' },
        { value: 'FTL', label: 'FTL [Full Truck]' },
    ],
    stations: [
        'AHMDABAD',
        'MUMBAI',
        'PUNE',
        'DELHI',
        'RAIPUR',
        'NAGPUR',
    ],
    bookingTypes: [
        { value: 'FOC', label: 'FOC' },
        { value: 'PAID', label: 'PAID' },
        { value: 'TOPAY', label: 'TOPAY' },
        { value: 'TBB', label: 'TBB' },
    ],
    parties: [
        { name: 'NOVA INDUSTERIES', gst: '27AAFCN0123A1Z5' },
        { name: 'MONIKA SALES', gst: '22AAAAA0000A1Z5' },
        { name: 'PARTY NAME1', gst: '24ABCDE1234F1Z5' },
    ],
    items: [
        'Frm MAS',
        'Electronics',
        'Textiles',
        'Machine Parts',
    ],
    yesNo: [
        { value: 'Yes', label: 'Yes' },
        { value: 'No', label: 'No' },
    ],
    deliveryAt: [
        { value: 'Godown Deliv', label: 'Godown Delivery' },
        { value: 'Door Deliv', label: 'Door Delivery' },
    ],
    deliveryPoints: [
        'DWARKA COI',
        'Main Warehouse',
        'Downtown Hub',
    ],
    priorities: [
        { value: 'Express', label: 'Express' },
        { value: 'Standard', label: 'Standard' },
    ],
    printFormats: [
        { value: 'Custom Copy', label: 'Custom Copy' },
        { value: 'Original Copy', label: 'Original Copy' },
        { value: 'Duplicate Copy', label: 'Duplicate Copy' },
    ],
};
