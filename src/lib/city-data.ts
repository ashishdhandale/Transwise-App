
import type { City } from './types';

const LOCAL_STORAGE_KEY_CITIES = 'transwise_custom_cities';

// A more comprehensive initial list of cities with pincodes
const initialCitiesData: Omit<City, 'id'>[] = [
    { name: 'Mumbai', aliasCode: 'BOM', pinCode: '400001' },
    { name: 'Delhi', aliasCode: 'DEL', pinCode: '110001' },
    { name: 'Bengaluru', aliasCode: 'BLR', pinCode: '560001' },
    { name: 'Kolkata', aliasCode: 'CCU', pinCode: '700001' },
    { name: 'Chennai', aliasCode: 'MAA', pinCode: '600001' },
    { name: 'Hyderabad', aliasCode: 'HYD', pinCode: '500001' },
    { name: 'Pune', aliasCode: 'PNQ', pinCode: '411001' },
    { name: 'Ahmedabad', aliasCode: 'AMD', pinCode: '380001' },
    { name: 'Surat', aliasCode: 'STV', pinCode: '395001' },
    { name: 'Jaipur', aliasCode: 'JAI', pinCode: '302001' },
    { name: 'Lucknow', aliasCode: 'LKO', pinCode: '226001' },
    { name: 'Kanpur', aliasCode: 'KNU', pinCode: '208001' },
    { name: 'Nagpur', aliasCode: 'NAG', pinCode: '440001' },
    { name: 'Indore', aliasCode: 'IDR', pinCode: '452001' },
    { name: 'Thane', aliasCode: 'TNA', pinCode: '400601' },
    { name: 'Bhopal', aliasCode: 'BHO', pinCode: '462001' },
    { name: 'Visakhapatnam', aliasCode: 'VTZ', pinCode: '530001' },
    { name: 'Patna', aliasCode: 'PAT', pinCode: '800001' },
    { name: 'Vadodara', aliasCode: 'BDQ', pinCode: '390001' },
    { name: 'Ghaziabad', aliasCode: 'GZB', pinCode: '201001' },
    { name: 'Ludhiana', aliasCode: 'LUH', pinCode: '141001' },
    { name: 'Agra', aliasCode: 'AGR', pinCode: '282001' },
    { name: 'Nashik', aliasCode: 'ISK', pinCode: '422001' },
    { name: 'Faridabad', aliasCode: 'FDB', pinCode: '121001' },
    { name: 'Meerut', aliasCode: 'MEH', pinCode: '250001' },
    { name: 'Rajkot', aliasCode: 'RAJ', pinCode: '360001' },
    { name: 'Varanasi', aliasCode: 'VNS', pinCode: '221001' },
    { name: 'Srinagar', aliasCode: 'SXR', pinCode: '190001' },
    { name: 'Aurangabad', aliasCode: 'IXU', pinCode: '431001' },
    { name: 'Dhanbad', aliasCode: 'DBD', pinCode: '826001' },
    { name: 'Amritsar', aliasCode: 'ATQ', pinCode: '143001' },
    { name: 'Allahabad', aliasCode: 'IXD', pinCode: '211001' },
    { name: 'Ranchi', aliasCode: 'IXR', pinCode: '834001' },
    { name: 'Howrah', aliasCode: 'HWH', pinCode: '711101' },
    { name: 'Coimbatore', aliasCode: 'CJB', pinCode: '641001' },
    { name: 'Jabalpur', aliasCode: 'JLR', pinCode: '482001' },
    { name: 'Gwalior', aliasCode: 'GWL', pinCode: '474001' },
    { name: 'Vijayawada', aliasCode: 'VGA', pinCode: '520001' },
    { name: 'Jodhpur', aliasCode: 'JDH', pinCode: '342001' },
    { name: 'Madurai', aliasCode: 'IXM', pinCode: '625001' },
    { name: 'Raipur', aliasCode: 'RPR', pinCode: '492001' },
    { name: 'Kota', aliasCode: 'KTU', pinCode: '324001' },
    { name: 'Guwahati', aliasCode: 'GAU', pinCode: '781001' },
    { name: 'Chandigarh', aliasCode: 'IXC', pinCode: '160001' },
    { name: 'Solapur', aliasCode: 'SSE', pinCode: '413001' },
    { name: 'Hubli', aliasCode: 'HBX', pinCode: '580020' },
    { name: 'Bareilly', aliasCode: 'BEK', pinCode: '243001' },
    { name: 'Mysore', aliasCode: 'MYQ', pinCode: '570001' },
    { name: 'Tiruchirappalli', aliasCode: 'TRZ', pinCode: '620001' },
    { name: 'Tiruppur', aliasCode: 'TXP', pinCode: '641601' },
    { name: 'Aligarh', aliasCode: 'ALH', pinCode: '202001' },
    { name: 'Bhubaneswar', aliasCode: 'BBI', pinCode: '751001' },
    { name: 'Salem', aliasCode: 'SXV', pinCode: '636001' },
    { name: 'Warangal', aliasCode: 'WGC', pinCode: '506001' },
    { name: 'Guntur', aliasCode: 'GNT', pinCode: '522001' },
    { name: 'Bhiwandi', aliasCode: 'BIRD', pinCode: '421302' },
    { name: 'Saharanpur', aliasCode: 'SRN', pinCode: '247001' },
    { name: 'Gorakhpur', aliasCode: 'GOP', pinCode: '273001' },
    { name: 'Bikaner', aliasCode: 'BKN', pinCode: '334001' },
    { name: 'Amravati', aliasCode: 'AMT', pinCode: '444601' },
    { name: 'Noida', aliasCode: 'NDA', pinCode: '201301' },
    { name: 'Jamshedpur', aliasCode: 'IXW', pinCode: '831001' },
    { name: 'Bhilai', aliasCode: 'BIA', pinCode: '490001' },
    { name: 'Cuttack', aliasCode: 'CTC', pinCode: '753001' },
    { name: 'Firozabad', aliasCode: 'FZD', pinCode: '283203' },
    { name: 'Kochi', aliasCode: 'COK', pinCode: '682011' },
    { name: 'Dehradun', aliasCode: 'DED', pinCode: '248001' },
    { name: 'Durgapur', aliasCode: 'RDP', pinCode: '713201' },
    { name: 'Asansol', aliasCode: 'ASL', pinCode: '713301' },
    { name: 'Nanded', aliasCode: 'NDC', pinCode: '431601' },
    { name: 'Kolhapur', aliasCode: 'KLH', pinCode: '416001' },
    { name: 'Ajmer', aliasCode: 'AII', pinCode: '305001' },
    { name: 'Gulbarga', aliasCode: 'GBI', pinCode: '585101' },
    { name: 'Jamnagar', aliasCode: 'JGA', pinCode: '361001' },
    { name: 'Ujjain', aliasCode: 'UJN', pinCode: '456001' },
    { name: 'Loni', aliasCode: 'LONI', pinCode: '201102' },
    { name: 'Siliguri', aliasCode: 'IXB', pinCode: '734001' },
    { name: 'Jhansi', aliasCode: 'JHS', pinCode: '284001' },
    { name: 'Ulhasnagar', aliasCode: 'ULNR', pinCode: '421001' },
    { name: 'Nellore', aliasCode: 'NLR', pinCode: '524001' },
    { name: 'Jammu', aliasCode: 'IXJ', pinCode: '180001' },
    { name: 'Sangli-Miraj', aliasCode: 'SLI', pinCode: '416416' },
    { name: 'Belgaum', aliasCode: 'IXG', pinCode: '590001' },
    { name: 'Mangalore', aliasCode: 'IXE', pinCode: '575001' },
    { name: 'Ambattur', aliasCode: 'ABT', pinCode: '600053' },
    { name: 'Tirunelveli', aliasCode: 'TEN', pinCode: '627001' },
    { name: 'Malegaon', aliasCode: 'MLG', pinCode: '423203' },
    { name: 'Gaya', aliasCode: 'GAY', pinCode: '823001' },
    { name: 'Jalgaon', aliasCode: 'JLG', pinCode: '425001' },
    { name: 'Udaipur', aliasCode: 'UDR', pinCode: '313001' },
    { name: 'Maheshtala', aliasCode: 'MHTL', pinCode: '700141' },
    { name: 'Tirupati', aliasCode: 'TIR', pinCode: '517501' },
    { name: 'Davanagere', aliasCode: 'DVG', pinCode: '577001' },
    { name: 'Kozhikode', aliasCode: 'CCJ', pinCode: '673001' },
    { name: 'Akola', aliasCode: 'AKD', pinCode: '444001' },
    { name: 'Kurnool', aliasCode: 'KNL', pinCode: '518001' },
    { name: 'Bokaro', aliasCode: 'BKR', pinCode: '827001' },
    { name: 'Rajahmundry', aliasCode: 'RJA', pinCode: '533101' },
    { name: 'Ballari', aliasCode: 'BEP', pinCode: '583101' },
    { name: 'Agartala', aliasCode: 'IXA', pinCode: '799001' },
    { name: 'Bhagalpur', aliasCode: 'BGP', pinCode: '812001' },
    { name: 'Latur', aliasCode: 'LTR', pinCode: '413512' },
    { name: 'Dhule', aliasCode: 'DHL', pinCode: '424001' },
    { name: 'Korba', aliasCode: 'KRB', pinCode: '495677' },
    { name: 'Bhilwara', aliasCode: 'BHL', pinCode: '311001' },
    { name: 'Brahmapur', aliasCode: 'BMP', pinCode: '760001' },
    { name: 'Muzaffarpur', aliasCode: 'MZF', pinCode: '842001' },
    { name: 'Ahmednagar', aliasCode: 'ANG', pinCode: '414001' },
    { name: 'Mathura', aliasCode: 'MTH', pinCode: '281001' },
    { name: 'Kollam', aliasCode: 'KLM', pinCode: '691001' },
    { name: 'Avadi', aliasCode: 'AVD', pinCode: '600054' },
    { name: 'Kadapa', aliasCode: 'CDP', pinCode: '516001' },
    { name: 'Kamarhati', aliasCode: 'KMHT', pinCode: '700058' },
    { name: 'Sambalpur', aliasCode: 'SLR', pinCode: '768001' },
    { name: 'Bilaspur', aliasCode: 'BLS', pinCode: '495001' },
    { name: 'Shahjahanpur', aliasCode: 'SHJ', pinCode: '242001' },
    { name: 'Satara', aliasCode: 'STR', pinCode: '415001' },
    { name: 'Bijapur', aliasCode: 'BJP', pinCode: '586101' },
    { name: 'Rampur', aliasCode: 'RMP', pinCode: '244901' },
    { name: 'Shimoga', aliasCode: 'SMG', pinCode: '577201' },
    { name: 'Chandrapur', aliasCode: 'CDP', pinCode: '442401' },
    { name: 'Junagadh', aliasCode: 'JND', pinCode: '362001' },
    { name: 'Thrissur', aliasCode: 'TCR', pinCode: '680001' },
    { name: 'Alwar', aliasCode: 'AWR', pinCode: '301001' },
    { name: 'Bardhaman', aliasCode: 'BDN', pinCode: '713101' },
    { name: 'Kulti', aliasCode: 'KLT', pinCode: '713343' },
    { name: 'Kakinada', aliasCode: 'KKD', pinCode: '533001' },
    { name: 'Nizamabad', aliasCode: 'NZB', pinCode: '503001' },
    { name: 'Parbhani', aliasCode: 'PBN', pinCode: '431401' },
    { name: 'Tumkur', aliasCode: 'TMK', pinCode: '572101' },
    { name: 'Hisar', aliasCode: 'HSR', pinCode: '125001' },
    { name: 'Ozhukarai', aliasCode: 'OZK', pinCode: '605010' },
    { name: 'Bihar Sharif', aliasCode: 'BHR', pinCode: '803101' },
    { name: 'Panipat', aliasCode: 'PNP', pinCode: '132103' },
    { name: 'Darbhanga', aliasCode: 'DBR', pinCode: '846004' },
    { name: 'Bally', aliasCode: 'BLYL', pinCode: '711201' },
    { name: 'Aizawl', aliasCode: 'AZL', pinCode: '796001' },
    { name: 'Dewas', aliasCode: 'DWS', pinCode: '455001' },
    { name: 'Ichalkaranji', aliasCode: 'IKJ', pinCode: '416115' },
    { 'name': 'Karnal', 'aliasCode': 'KNL', 'pinCode': '132001' },
    { 'name': 'Bathinda', 'aliasCode': 'BTI', 'pinCode': '151001' },
    { 'name': 'Jalna', 'aliasCode': 'JNA', 'pinCode': '431203' },
    { 'name': 'Eluru', 'aliasCode': 'ELR', 'pinCode': '534001' },
    { 'name': 'Barasat', 'aliasCode': 'BST', 'pinCode': '700124' },
    { 'name': 'Kirari Suleman Nagar', 'aliasCode': 'KSN', 'pinCode': '110086' },
    { 'name': 'Purnia', 'aliasCode': 'PRN', 'pinCode': '854301' },
    { 'name': 'Satna', 'aliasCode': 'STN', 'pinCode': '485001' },
    { 'name': 'Mau', 'aliasCode': 'MAU', 'pinCode': '275101' },
    { 'name': 'Sonipat', 'aliasCode': 'SNPT', 'pinCode': '131001' },
    { 'name': 'Farrukhabad', 'aliasCode': 'FKB', 'pinCode': '209625' },
    { 'name': 'Sagar', 'aliasCode': 'SGR', 'pinCode': '470001' },
    { 'name': 'Rourkela', 'aliasCode': 'ROU', 'pinCode': '769001' },
    { 'name': 'Durg', 'aliasCode': 'DURG', 'pinCode': '491001' },
    { 'name': 'Imphal', 'aliasCode': 'IMF', 'pinCode': '795001' },
    { 'name': 'Ratlam', 'aliasCode': 'RTM', 'pinCode': '457001' },
    { 'name': 'Hapur', 'aliasCode': 'HPR', 'pinCode': '245101' },
    { 'name': 'Anantapur', 'aliasCode': 'ATP', 'pinCode': '515001' },
    { 'name': 'Arrah', 'aliasCode': 'ARA', 'pinCode': '802301' },
    { 'name': 'Karimnagar', 'aliasCode': 'KMNR', 'pinCode': '505001' },
    { 'name': 'Etawah', 'aliasCode': 'ETW', 'pinCode': '206001' },
    { 'name': 'Ambernath', 'aliasCode': 'ABN', 'pinCode': '421501' },
    { 'name': 'North Dumdum', 'aliasCode': 'NDM', 'pinCode': '700074' },
    { 'name': 'Bharatpur', 'aliasCode': 'BTP', 'pinCode': '321001' },
    { 'name': 'Begusarai', 'aliasCode': 'BGS', 'pinCode': '851101' },
    { 'name': 'New Delhi', 'aliasCode': 'NDLS', 'pinCode': '110001' },
    { 'name': 'Gandhidham', 'aliasCode': 'GDM', 'pinCode': '370201' },
    { 'name': 'Baranagar', 'aliasCode': 'BRN', 'pinCode': '700036' },
    { 'name': 'Tiruvottiyur', 'aliasCode': 'TVT', 'pinCode': '600019' },
    { 'name': 'Puducherry', 'aliasCode': 'PNY', 'pinCode': '605001' },
    { 'name': 'Sikar', 'aliasCode': 'SKR', 'pinCode': '332001' },
    { 'name': 'Thoothukudi', 'aliasCode': 'TUT', 'pinCode': '628001' },
    { 'name': 'Rewa', 'aliasCode': 'RWA', 'pinCode': '486001' },
    { 'name': 'Mirzapur', 'aliasCode': 'MZP', 'pinCode': '231001' },
    { 'name': 'Raichur', 'aliasCode': 'RCR', 'pinCode': '584101' },
    { 'name': 'Pali', 'aliasCode': 'PLI', 'pinCode': '306401' },
    { 'name': 'Ramagundam', 'aliasCode': 'RGM', 'pinCode': '505208' },
    { 'name': 'Haridwar', 'aliasCode': 'HDW', 'pinCode': '249401' },
    { 'name': 'Vijayanagaram', 'aliasCode': 'VZM', 'pinCode': '535002' },
    { 'name': 'Katihar', 'aliasCode': 'KIR', 'pinCode': '854105' },
    { 'name': 'Nagercoil', 'aliasCode': 'NCJ', 'pinCode': '629001' }
];

// Helper function to create the initial list of cities with unique IDs
const createInitialCities = (): City[] => {
    return initialCitiesData.map((city, index) => ({
        id: index + 1,
        ...city,
    }));
};

export const getCities = (): City[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    
    try {
        const savedCitiesJSON = localStorage.getItem(LOCAL_STORAGE_KEY_CITIES);
        if (savedCitiesJSON) {
            const savedCities: City[] = JSON.parse(savedCitiesJSON);
            // Sort by name before returning
            return savedCities.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            // If no data exists in localStorage, create it, save it, and return it.
            const initialCities = createInitialCities();
            localStorage.setItem(LOCAL_STORAGE_KEY_CITIES, JSON.stringify(initialCities));
            return initialCities.sort((a, b) => a.name.localeCompare(b.name));
        }
    } catch (error) {
        console.error("Failed to load or initialize city data from local storage", error);
        // Fallback to in-memory initial list if localStorage fails
        return createInitialCities().sort((a, b) => a.name.localeCompare(b.name));
    }
};

export const saveCities = (cities: City[]) => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY_CITIES, JSON.stringify(cities));
    } catch (error) {
        console.error("Failed to save cities to local storage", error);
    }
};
