<?php

namespace Database\Seeders;

use App\Models\Office;
use App\Models\QueueState;
use App\Models\Scheme;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Roles ───────────────────────────────────────────────────────────
        $roles = ['citizen', 'operator', 'office_admin', 'district_admin', 'auditor'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'sanctum']);
        }

        // ── 2. District Admin ──────────────────────────────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@nimmaseva.in'],
            [
                'full_name' => 'Shivamogga District Admin',
                'password'  => Hash::make('Admin@123'),
                'is_active' => true,
            ]
        );
        if (! $admin->hasRole('district_admin')) {
            $admin->assignRole('district_admin');
        }

        // Default operator account
        $operator = User::firstOrCreate(
            ['email' => 'operator@nimmaseva.in'],
            [
                'full_name' => 'GramOne Counter Operator',
                'password'  => Hash::make('Operator@123'),
                'is_active' => true,
            ]
        );
        if (! $operator->hasRole('operator')) {
            $operator->assignRole('operator');
        }

        // ── 3. Offices ─────────────────────────────────────────────────────────
        $officesData = [
            [
                'name'             => 'GramOne Shivamogga Center',
                'type'             => 'GramOne',
                'address'          => 'B.H. Road, Near Bus Stand, Shivamogga, Karnataka 577201',
                'district'         => 'Shivamogga',
                'taluk'            => 'Shivamogga',
                'village'          => 'Shivamogga City',
                'latitude'         => 13.9299,
                'longitude'        => 75.5681,
                'phone'            => '08182-271234',
                'working_hours'    => '09:00 AM - 05:00 PM',
                'lunch_break'      => '01:00 PM - 02:00 PM',
                'max_daily_tokens' => 100,
                'server_status'    => 'Active',
            ],
            [
                'name'             => 'Seva Sindhu Mini Vidhana Soudha',
                'type'             => 'SevaSindhu',
                'address'          => 'District Administrative Complex, Court Road, Shivamogga 577201',
                'district'         => 'Shivamogga',
                'taluk'            => 'Shivamogga',
                'village'          => 'Shivamogga City',
                'latitude'         => 13.9350,
                'longitude'        => 75.5750,
                'phone'            => '08182-279876',
                'working_hours'    => '09:00 AM - 05:00 PM',
                'lunch_break'      => '01:00 PM - 02:00 PM',
                'max_daily_tokens' => 120,
                'server_status'    => 'Active',
            ],
            [
                'name'             => 'GramOne Bhadravathi Center',
                'type'             => 'GramOne',
                'address'          => 'Main Road, Bhadravathi, Shivamogga 577301',
                'district'         => 'Shivamogga',
                'taluk'            => 'Bhadravathi',
                'village'          => 'Bhadravathi City',
                'latitude'         => 13.8489,
                'longitude'        => 75.7085,
                'phone'            => '08182-250120',
                'working_hours'    => '09:00 AM - 05:00 PM',
                'lunch_break'      => '01:00 PM - 02:00 PM',
                'max_daily_tokens' => 80,
                'server_status'    => 'Active',
            ],
            [
                'name'             => 'GramOne Sagar Taluk Center',
                'type'             => 'GramOne',
                'address'          => 'Taluk Office Road, Sagar, Shivamogga 577401',
                'district'         => 'Shivamogga',
                'taluk'            => 'Sagar',
                'village'          => 'Sagar Town',
                'latitude'         => 14.1665,
                'longitude'        => 75.0283,
                'phone'            => '08183-221450',
                'working_hours'    => '09:00 AM - 05:00 PM',
                'lunch_break'      => '01:00 PM - 02:00 PM',
                'max_daily_tokens' => 80,
                'server_status'    => 'Active',
            ],
            [
                'name'             => 'Bapuji Seva Kendra Shikaripura',
                'type'             => 'BSK',
                'address'          => 'Near KSRTC Bus Stand, Shikaripura, Shivamogga 577427',
                'district'         => 'Shivamogga',
                'taluk'            => 'Shikaripura',
                'village'          => 'Shikaripura',
                'latitude'         => 14.2680,
                'longitude'        => 75.3535,
                'phone'            => '08187-231090',
                'working_hours'    => '09:00 AM - 05:00 PM',
                'lunch_break'      => '01:00 PM - 02:00 PM',
                'max_daily_tokens' => 60,
                'server_status'    => 'Active',
            ],
            [
                'name'             => 'GramOne Thirthahalli Center',
                'type'             => 'GramOne',
                'address'          => 'Nehru Street, Thirthahalli, Shivamogga 577432',
                'district'         => 'Shivamogga',
                'taluk'            => 'Thirthahalli',
                'village'          => 'Thirthahalli',
                'latitude'         => 13.6877,
                'longitude'        => 75.2396,
                'phone'            => '08181-234567',
                'working_hours'    => '09:00 AM - 05:00 PM',
                'lunch_break'      => '01:00 PM - 02:00 PM',
                'max_daily_tokens' => 60,
                'server_status'    => 'Active',
            ],
            [
                'name'             => 'Seva Sindhu Soraba Taluk',
                'type'             => 'SevaSindhu',
                'address'          => 'Taluk Panchayat Complex, Soraba, Shivamogga 577429',
                'district'         => 'Shivamogga',
                'taluk'            => 'Soraba',
                'village'          => 'Soraba',
                'latitude'         => 14.0037,
                'longitude'        => 75.0632,
                'phone'            => '08183-264300',
                'working_hours'    => '09:00 AM - 05:00 PM',
                'lunch_break'      => '01:00 PM - 02:00 PM',
                'max_daily_tokens' => 70,
                'server_status'    => 'Active',
            ],
            [
                'name'             => 'GramOne Hosanagara Center',
                'type'             => 'GramOne',
                'address'          => 'Market Road, Hosanagara, Shivamogga 577418',
                'district'         => 'Shivamogga',
                'taluk'            => 'Hosanagara',
                'village'          => 'Hosanagara',
                'latitude'         => 13.8120,
                'longitude'        => 75.0400,
                'phone'            => '08185-262100',
                'working_hours'    => '09:00 AM - 05:00 PM',
                'lunch_break'      => '01:00 PM - 02:00 PM',
                'max_daily_tokens' => 60,
                'server_status'    => 'Active',
            ],
        ];

        $officeMap = [];
        foreach ($officesData as $od) {
            $o = Office::firstOrCreate(['name' => $od['name']], $od);
            $officeMap[$o->name] = $o;

            QueueState::firstOrCreate(
                ['office_id' => $o->id],
                ['active_counters' => 3, 'is_paused' => false]
            );
        }

        // ── 4. Services ────────────────────────────────────────────────────────
        $servicesData = [
            ['name'=>'Income Certificate','code'=>'INC-001','category'=>'Revenue','fee'=>40,'avg_processing_time_mins'=>15,'daily_capacity'=>60,'server_status'=>'Active','required_documents'=>['Aadhaar Card of Applicant','Ration Card / Voter ID Card','Salary Slip / Form 16 or Self Declaration','Passport Size Photograph','Land Revenue Receipt (if applicable)'],'description'=>'Official government income certificate issued by Nadakacheri/Revenue Department.'],
            ['name'=>'Caste Certificate','code'=>'CST-002','category'=>'Revenue','fee'=>40,'avg_processing_time_mins'=>15,'daily_capacity'=>60,'server_status'=>'Active','required_documents'=>['Aadhaar Card of Applicant','School Transfer Certificate (TC)','Father Caste Certificate / School TC','Self Declaration / Notarized Affidavit','Ration Card / Address Proof'],'description'=>'Caste status verification certificate (SC/ST/OBC) for reservations and welfare.'],
            ['name'=>'Income & Caste Combined Certificate','code'=>'ICC-003','category'=>'Revenue','fee'=>40,'avg_processing_time_mins'=>15,'daily_capacity'=>80,'server_status'=>'Active','required_documents'=>['Aadhaar Card','BPL / APL Ration Card','School Leaving / Transfer Certificate','Income Proof','Family Tree / Genealogic Chart (if requested)'],'description'=>'Combined Income & Caste certificate for college admissions and Karnataka Govt recruitments.'],
            ['name'=>'Residence / Domicile Certificate','code'=>'RES-004','category'=>'Revenue','fee'=>40,'avg_processing_time_mins'=>10,'daily_capacity'=>80,'server_status'=>'Active','required_documents'=>['Aadhaar Card','Electricity Bill / Water Bill','Registered Rent Agreement / Property Tax Receipt','Voter ID Card','Passport Photo'],'description'=>'Proof of continuous residency in Karnataka state.'],
            ['name'=>'Solvency Certificate','code'=>'SLV-005','category'=>'Revenue','fee'=>50,'avg_processing_time_mins'=>20,'daily_capacity'=>40,'server_status'=>'Active','required_documents'=>['Aadhaar Card','Encumbrance Certificate (EC) of Property','Property Tax Paid Receipt & Valuation Report','Bank Balance Certificate / Fixed Deposit Records','Self Declaration Affidavit'],'description'=>'Certificate establishing financial creditworthiness for bank loans and tenders.'],
            ['name'=>'New Ration Card Application','code'=>'RAT-006','category'=>'Food & Civil Supplies','fee'=>50,'avg_processing_time_mins'=>25,'daily_capacity'=>50,'server_status'=>'Active','required_documents'=>['Aadhaar Cards of All Family Members','Passport Photo of Head of Family','Income Certificate','Electricity Bill / House Rent Agreement','De-duplication / NOC Certificate'],'description'=>'Fresh BPL / APL Ration Card issuance for eligible families.'],
            ['name'=>'Ration Card Member Addition / Modification','code'=>'RAT-007','category'=>'Food & Civil Supplies','fee'=>50,'avg_processing_time_mins'=>20,'daily_capacity'=>50,'server_status'=>'Active','required_documents'=>['Existing Original Ration Card','New Member Aadhaar Card','Birth Certificate (for newborns)','Marriage Certificate / Surrender Certificate','Head of Family Consent Letter'],'description'=>'Update family members or correct names on existing Ration Card.'],
            ['name'=>'RTC / Pahani Land Record Copy','code'=>'LND-008','category'=>'Bhoomi Revenue','fee'=>25,'avg_processing_time_mins'=>8,'daily_capacity'=>150,'server_status'=>'Active','required_documents'=>['Survey Number & Hissa Number','District, Taluk, Hobli, and Village Name','Land Owner Aadhaar Card'],'description'=>'Certified copy of Record of Rights, Tenancy and Crops (RTC/Pahani) from Bhoomi portal.'],
            ['name'=>'Land Mutation / Khata Transfer','code'=>'LND-009','category'=>'Bhoomi Revenue','fee'=>100,'avg_processing_time_mins'=>30,'daily_capacity'=>30,'server_status'=>'Active','required_documents'=>['Registered Sale Deed / Gift Deed / Partition Deed','Encumbrance Certificate (EC) for 13+ years','Latest RTC / Pahani Copy','Death Certificate & Family Tree (for inheritance)','Aadhaar Cards of Buyer and Seller'],'description'=>'Official transfer of land title ownership following property purchase or inheritance.'],
            ['name'=>'Sandhya Suraksha Senior Pension','code'=>'PEN-010','category'=>'Social Welfare','fee'=>0,'avg_processing_time_mins'=>20,'daily_capacity'=>40,'server_status'=>'Active','required_documents'=>['Aadhaar Card proving Age 60+','Income Certificate','Aadhaar-seeded Bank Passbook','Karnataka Domicile Proof','Passport Photo & Self Declaration'],'description'=>'Monthly pension assistance of ₹1,200/month for senior citizens above 60 years.'],
            ['name'=>'Disability Pension & UDID Card','code'=>'PEN-011','category'=>'Social Welfare','fee'=>0,'avg_processing_time_mins'=>25,'daily_capacity'=>30,'server_status'=>'Active','required_documents'=>['Disability Certificate from Govt Medical Officer (40%+ disability)','Aadhaar Card','Income Certificate','Aadhaar-linked Bank Account Passbook','Photographs showing disability'],'description'=>'Monthly pension & Unique Disability ID (UDID) card for persons with disabilities.'],
            ['name'=>'Senior Citizen ID Card & Pass','code'=>'WLF-013','category'=>'Social Welfare','fee'=>0,'avg_processing_time_mins'=>10,'daily_capacity'=>60,'server_status'=>'Active','required_documents'=>['Proof of Age 60+ (Aadhaar / Voter ID / Passport)','Karnataka Residence Proof','Blood Group Test Report','2 Recent Passport Photographs'],'description'=>'Official Senior Citizen ID Card providing travel concessions, medical discounts, priority queue pass.'],
            ['name'=>'Gruha Lakshmi Guarantee Scheme','code'=>'GLK-014','category'=>'Karnataka Guarantees','fee'=>0,'avg_processing_time_mins'=>15,'daily_capacity'=>100,'server_status'=>'Active','required_documents'=>['Aadhaar Card of Female Head of Family','Husband\'s Aadhaar Card','BPL / APL / Antyodaya Ration Card','Aadhaar-Seeded Bank Passbook (NPCI mapped)','Mobile Number linked to Aadhaar for OTP'],'description'=>'Karnataka Govt guarantee scheme offering ₹2,000 monthly direct bank transfer to female family heads.'],
            ['name'=>'Yuva Nidhi Graduate Allowance','code'=>'YVN-015','category'=>'Karnataka Guarantees','fee'=>0,'avg_processing_time_mins'=>15,'daily_capacity'=>90,'server_status'=>'Active','required_documents'=>['Degree or Diploma Completion Certificate','Aadhaar Card of Student','Karnataka Domicile / SSLC School Study Certificate','Unemployment Self-Declaration Affidavit','Aadhaar-linked Bank Account Passbook'],'description'=>'Unemployment stipend: ₹3,000/mo for Graduates, ₹1,500/mo for Diploma holders for up to 2 years.'],
            ['name'=>'FRUITS Farmer Registration & ID','code'=>'FRM-016','category'=>'Agriculture','fee'=>0,'avg_processing_time_mins'=>15,'daily_capacity'=>70,'server_status'=>'Active','required_documents'=>['Aadhaar Card of Farmer','RTC / Pahani Copy of Land Holding','Bank Account Passbook Copy','Mobile Number linked with Aadhaar','Caste & Income Certificate (for subsidy)'],'description'=>'Farmer Registration & FRUITS ID for crop loss compensation and fertilizer subsidies.'],
            ['name'=>'Birth Certificate','code'=>'BCR-018','category'=>'Civil Registration','fee'=>25,'avg_processing_time_mins'=>10,'daily_capacity'=>100,'server_status'=>'Active','required_documents'=>['Hospital Discharge Summary / Birth Slip','Parents Aadhaar Cards','Marriage Certificate of Parents','Ration Card','Proof of Residence'],'description'=>'Official birth certificate from local body under Civil Registration System.'],
            ['name'=>'Death Certificate','code'=>'DCR-019','category'=>'Civil Registration','fee'=>25,'avg_processing_time_mins'=>10,'daily_capacity'=>80,'server_status'=>'Active','required_documents'=>['Hospital Death Certificate / Form 4','Aadhaar Card of Deceased','Ration Card','Informant Aadhaar Card','Police Report (for unnatural death)'],'description'=>'Official death certificate from local body under Civil Registration System.'],
            ['name'=>'Voter ID Card Enrolment / Correction','code'=>'VTR-020','category'=>'Electoral','fee'=>0,'avg_processing_time_mins'=>12,'daily_capacity'=>80,'server_status'=>'Active','required_documents'=>['Aadhaar Card','Passport Photograph','Proof of Residence (Electricity Bill / Ration Card)','Date of Birth Proof (SSLC / Birth Certificate)'],'description'=>'New voter registration or correction of existing voter ID card details in Karnataka Electoral Roll.'],
        ];

        foreach ($servicesData as $sd) {
            Service::firstOrCreate(['code' => $sd['code']], $sd);
        }

        // ── 5. Schemes ─────────────────────────────────────────────────────────
        $schemesData = [
            ['title'=>'Gruha Lakshmi','category'=>'Women Empowerment','min_age'=>18,'max_age'=>60,'gender_eligibility'=>'Female','max_income'=>300000,'target_occupation'=>'All','district'=>'Shivamogga','description'=>'₹2,000 per month direct bank transfer to female head of BPL/APL family','required_documents'=>['Aadhaar Card','Ration Card','Bank Passbook','Husband\'s Aadhaar'],'benefits'=>'₹2,000 per month direct bank transfer','apply_link'=>'https://sevasindhu.karnataka.gov.in'],
            ['title'=>'Yuva Nidhi','category'=>'Youth Employment','min_age'=>18,'max_age'=>25,'gender_eligibility'=>'All','max_income'=>0,'target_occupation'=>'Unemployed','district'=>'Shivamogga','description'=>'Unemployment allowance for graduates (₹3,000/mo) and diploma holders (₹1,500/mo)','required_documents'=>['Degree Certificate','Aadhaar Card','Unemployment Affidavit','Bank Passbook'],'benefits'=>'₹3,000/month for graduates, ₹1,500/month for diploma holders','apply_link'=>'https://sevasindhu.karnataka.gov.in'],
            ['title'=>'Gruha Jyothi','category'=>'Energy Welfare','min_age'=>18,'max_age'=>100,'gender_eligibility'=>'All','max_income'=>0,'target_occupation'=>'All','district'=>'Shivamogga','description'=>'Up to 200 units of free domestic electricity per month for all households','required_documents'=>['Electricity Bill','Aadhaar Card','Bank Passbook'],'benefits'=>'200 units free electricity per month','apply_link'=>'https://sevasindhu.karnataka.gov.in'],
            ['title'=>'Shakti Scheme','category'=>'Women Transport','min_age'=>18,'max_age'=>100,'gender_eligibility'=>'Female','max_income'=>0,'target_occupation'=>'All','district'=>'Shivamogga','description'=>'Free bus travel for all women across KSRTC and BMTC networks in Karnataka','required_documents'=>['Any Government ID / Aadhaar Card'],'benefits'=>'Free bus travel on all KSRTC/BMTC routes','apply_link'=>'https://sevasindhu.karnataka.gov.in'],
            ['title'=>'Anna Bhagya','category'=>'Food Security','min_age'=>18,'max_age'=>100,'gender_eligibility'=>'All','max_income'=>100000,'target_occupation'=>'All','district'=>'Shivamogga','description'=>'10 kg free food grains or direct cash benefit for BPL ration card holders','required_documents'=>['BPL Ration Card','Aadhaar Card','Bank Passbook'],'benefits'=>'10 kg rice/month or DBT equivalent','apply_link'=>'https://sevasindhu.karnataka.gov.in'],
            ['title'=>'Sandhya Suraksha Pension','category'=>'Senior Citizens','min_age'=>60,'max_age'=>100,'gender_eligibility'=>'All','max_income'=>20000,'target_occupation'=>'All','district'=>'Shivamogga','description'=>'Monthly pension of ₹1,200 for senior citizens above 60 years in Karnataka','required_documents'=>['Aadhaar Card (Age 60+)','Income Certificate','Bank Passbook','Karnataka Domicile'],'benefits'=>'₹1,200 per month pension','apply_link'=>'https://sevasindhu.karnataka.gov.in'],
            ['title'=>'Raita Vidya Nidhi','category'=>'Education','min_age'=>6,'max_age'=>25,'gender_eligibility'=>'All','max_income'=>150000,'target_occupation'=>'Farmer','district'=>'Shivamogga','description'=>'Scholarship for children of farmers and agricultural laborers for education','required_documents'=>['Student Aadhaar Card','Parent Farmer ID','Marks Card / TC','Bank Passbook'],'benefits'=>'Annual scholarship up to ₹10,000','apply_link'=>'https://sevasindhu.karnataka.gov.in'],
        ];

        foreach ($schemesData as $sd) {
            Scheme::firstOrCreate(['title' => $sd['title'], 'district' => $sd['district']], $sd);
        }

        $this->command->info('✅ Nimma Seva database seeded successfully.');
        $this->command->info('   Admin: admin@nimmaseva.in / Admin@123');
        $this->command->info('   Operator: operator@nimmaseva.in / Operator@123');
    }
}
