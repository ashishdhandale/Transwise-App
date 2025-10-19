
export const bookingOptions = {
    loadTypes: [
        { value: 'PTL', label: 'PTL [Part Truck]' },
        { value: 'FTL', label: 'FTL [Full Truck]' },
        { value: 'LTL', label: 'LTL [Less Than Truck]' },
    ],
    stations: [
        "Mumbai", "Delhi", "Bengaluru", "Kolkata", "Chennai", "Hyderabad", 
        "Pune", "Ahmedabad", "Surat", "Jaipur", "Lucknow", "Kanpur", "Nagpur",
        "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara",
        "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut",
        "Rajkot", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad",
        "Amritsar", "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur",
        "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota"
    ],
    bookingTypes: [
        { value: 'FOC', label: 'FOC' },
        { value: 'PAID', label: 'PAID' },
        { value: 'TOPAY', label: 'TOPAY' },
        { value: 'TBB', label: 'TBB' },
    ],
    parties: [
        { name: 'NOVA INDUSTERIES', gst: '27AAFCN0123A1Z5', address: '123, Industrial Area, Ahmedabad', mobile: '9876543210' },
        { name: 'MONIKA SALES', gst: '22AAAAA0000A1Z5', address: '456, Trade Center, Mumbai', mobile: '9876543211' },
        { name: 'PARTY NAME1', gst: '24ABCDE1234F1Z5', address: '789, Business Park, Pune', mobile: '9876543212' },
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
        { value: 'standard', label: 'Standard' },
    ],
};
