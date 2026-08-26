export interface USState {
  code: string;
  name: string;
  majorCities: string[];
}

export const US_STATES: USState[] = [
  { code: 'AZ', name: 'Arizona (AZ)', majorCities: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Gilbert', 'Tempe', 'Glendale', 'Peoria', 'Surprise', 'Flagstaff', 'Yuma'] },
  { code: 'CA', name: 'California (CA)', majorCities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Fresno', 'Irvine', 'Oakland', 'Long Beach'] },
  { code: 'TX', name: 'Texas (TX)', majorCities: ['Austin', 'Houston', 'Dallas', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Plano'] },
  { code: 'FL', name: 'Florida (FL)', majorCities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale', 'St. Petersburg', 'Tallahassee'] },
  { code: 'NY', name: 'New York (NY)', majorCities: ['New York', 'Brooklyn', 'Buffalo', 'Albany', 'Rochester', 'Syracuse', 'Yonkers'] },
  { code: 'GA', name: 'Georgia (GA)', majorCities: ['Atlanta', 'Augusta', 'Savannah', 'Columbus', 'Macon', 'Athens', 'Sandy Springs'] },
  { code: 'IL', name: 'Illinois (IL)', majorCities: ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford', 'Springfield', 'Peoria'] },
  { code: 'WA', name: 'Washington (WA)', majorCities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Everett', 'Olympia'] },
  { code: 'NC', name: 'North Carolina (NC)', majorCities: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville'] },
  { code: 'CO', name: 'Colorado (CO)', majorCities: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Boulder'] },
  { code: 'NV', name: 'Nevada (NV)', majorCities: ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City'] },
  { code: 'OH', name: 'Ohio (OH)', majorCities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton'] },
  { code: 'PA', name: 'Pennsylvania (PA)', majorCities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton'] },
  { code: 'VA', name: 'Virginia (VA)', majorCities: ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News', 'Alexandria'] },
  { code: 'MI', name: 'Michigan (MI)', majorCities: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing'] },
  { code: 'TN', name: 'Tennessee (TN)', majorCities: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro'] },
  { code: 'UT', name: 'Utah (UT)', majorCities: ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem', 'Sandy'] },
  { code: 'NJ', name: 'New Jersey (NJ)', majorCities: ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Trenton', 'Clifton'] },
  { code: 'MA', name: 'Massachusetts (MA)', majorCities: ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton'] },
  { code: 'OR', name: 'Oregon (OR)', majorCities: ['Portland', 'Eugene', 'Salem', 'Gresham', 'Hillsboro', 'Bend'] },
];

export const STATE_DROPDOWN_OPTIONS = [
  { value: 'all', label: 'All States (US)' },
  ...US_STATES.map((s) => ({ value: s.code, label: s.name })),
];

export const STATE_MODAL_OPTIONS = US_STATES.map((s) => ({ value: s.code, label: s.name }));
