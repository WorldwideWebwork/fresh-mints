export interface USState {
  code: string;
  name: string;
  fullName: string;
  majorCities: string[];
}

// Canonical US state data, listed alphabetically by fullName so dropdown
// labels read in order. States without curated city data carry an empty
// majorCities list; never pad it with guessed cities.
export const US_STATES: USState[] = [
  { code: 'AL', name: 'Alabama (AL)', fullName: 'Alabama', majorCities: [] },
  { code: 'AK', name: 'Alaska (AK)', fullName: 'Alaska', majorCities: [] },
  { code: 'AZ', name: 'Arizona (AZ)', fullName: 'Arizona', majorCities: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Gilbert', 'Tempe', 'Glendale', 'Peoria', 'Surprise', 'Flagstaff', 'Yuma'] },
  { code: 'AR', name: 'Arkansas (AR)', fullName: 'Arkansas', majorCities: [] },
  { code: 'CA', name: 'California (CA)', fullName: 'California', majorCities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Fresno', 'Irvine', 'Oakland', 'Long Beach'] },
  { code: 'CO', name: 'Colorado (CO)', fullName: 'Colorado', majorCities: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Boulder'] },
  { code: 'CT', name: 'Connecticut (CT)', fullName: 'Connecticut', majorCities: [] },
  { code: 'DE', name: 'Delaware (DE)', fullName: 'Delaware', majorCities: [] },
  { code: 'FL', name: 'Florida (FL)', fullName: 'Florida', majorCities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale', 'St. Petersburg', 'Tallahassee'] },
  { code: 'GA', name: 'Georgia (GA)', fullName: 'Georgia', majorCities: ['Atlanta', 'Augusta', 'Savannah', 'Columbus', 'Macon', 'Athens', 'Sandy Springs'] },
  { code: 'HI', name: 'Hawaii (HI)', fullName: 'Hawaii', majorCities: [] },
  { code: 'ID', name: 'Idaho (ID)', fullName: 'Idaho', majorCities: [] },
  { code: 'IL', name: 'Illinois (IL)', fullName: 'Illinois', majorCities: ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford', 'Springfield', 'Peoria'] },
  { code: 'IN', name: 'Indiana (IN)', fullName: 'Indiana', majorCities: [] },
  { code: 'IA', name: 'Iowa (IA)', fullName: 'Iowa', majorCities: [] },
  { code: 'KS', name: 'Kansas (KS)', fullName: 'Kansas', majorCities: [] },
  { code: 'KY', name: 'Kentucky (KY)', fullName: 'Kentucky', majorCities: [] },
  { code: 'LA', name: 'Louisiana (LA)', fullName: 'Louisiana', majorCities: [] },
  { code: 'ME', name: 'Maine (ME)', fullName: 'Maine', majorCities: [] },
  { code: 'MD', name: 'Maryland (MD)', fullName: 'Maryland', majorCities: [] },
  { code: 'MA', name: 'Massachusetts (MA)', fullName: 'Massachusetts', majorCities: ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton'] },
  { code: 'MI', name: 'Michigan (MI)', fullName: 'Michigan', majorCities: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing'] },
  { code: 'MN', name: 'Minnesota (MN)', fullName: 'Minnesota', majorCities: [] },
  { code: 'MS', name: 'Mississippi (MS)', fullName: 'Mississippi', majorCities: [] },
  { code: 'MO', name: 'Missouri (MO)', fullName: 'Missouri', majorCities: [] },
  { code: 'MT', name: 'Montana (MT)', fullName: 'Montana', majorCities: [] },
  { code: 'NE', name: 'Nebraska (NE)', fullName: 'Nebraska', majorCities: [] },
  { code: 'NV', name: 'Nevada (NV)', fullName: 'Nevada', majorCities: ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City'] },
  { code: 'NH', name: 'New Hampshire (NH)', fullName: 'New Hampshire', majorCities: [] },
  { code: 'NJ', name: 'New Jersey (NJ)', fullName: 'New Jersey', majorCities: ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Trenton', 'Clifton'] },
  { code: 'NM', name: 'New Mexico (NM)', fullName: 'New Mexico', majorCities: [] },
  { code: 'NY', name: 'New York (NY)', fullName: 'New York', majorCities: ['New York', 'Brooklyn', 'Buffalo', 'Albany', 'Rochester', 'Syracuse', 'Yonkers'] },
  { code: 'NC', name: 'North Carolina (NC)', fullName: 'North Carolina', majorCities: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville'] },
  { code: 'ND', name: 'North Dakota (ND)', fullName: 'North Dakota', majorCities: [] },
  { code: 'OH', name: 'Ohio (OH)', fullName: 'Ohio', majorCities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton'] },
  { code: 'OK', name: 'Oklahoma (OK)', fullName: 'Oklahoma', majorCities: [] },
  { code: 'OR', name: 'Oregon (OR)', fullName: 'Oregon', majorCities: ['Portland', 'Eugene', 'Salem', 'Gresham', 'Hillsboro', 'Bend'] },
  { code: 'PA', name: 'Pennsylvania (PA)', fullName: 'Pennsylvania', majorCities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton'] },
  { code: 'RI', name: 'Rhode Island (RI)', fullName: 'Rhode Island', majorCities: [] },
  { code: 'SC', name: 'South Carolina (SC)', fullName: 'South Carolina', majorCities: [] },
  { code: 'SD', name: 'South Dakota (SD)', fullName: 'South Dakota', majorCities: [] },
  { code: 'TN', name: 'Tennessee (TN)', fullName: 'Tennessee', majorCities: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro'] },
  { code: 'TX', name: 'Texas (TX)', fullName: 'Texas', majorCities: ['Austin', 'Houston', 'Dallas', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Plano'] },
  { code: 'UT', name: 'Utah (UT)', fullName: 'Utah', majorCities: ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem', 'Sandy'] },
  { code: 'VT', name: 'Vermont (VT)', fullName: 'Vermont', majorCities: [] },
  { code: 'VA', name: 'Virginia (VA)', fullName: 'Virginia', majorCities: ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News', 'Alexandria'] },
  { code: 'WA', name: 'Washington (WA)', fullName: 'Washington', majorCities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Everett', 'Olympia'] },
  { code: 'WV', name: 'West Virginia (WV)', fullName: 'West Virginia', majorCities: [] },
  { code: 'WI', name: 'Wisconsin (WI)', fullName: 'Wisconsin', majorCities: [] },
  { code: 'WY', name: 'Wyoming (WY)', fullName: 'Wyoming', majorCities: [] },
];

// Filter bars: leads with an all-states entry and labels by fullName.
export const STATE_FILTER_OPTIONS = [
  { value: 'all', label: 'All US States & Territories' },
  ...US_STATES.map((s) => ({ value: s.code, label: s.fullName })),
];

// Modals: no all-states entry, labelled with the composed name including the code.
export const STATE_MODAL_OPTIONS = US_STATES.map((s) => ({ value: s.code, label: s.name }));

// Returns a copy of the curated cities for a state code, or an empty array when
// the code is unknown or the state has no city data, so dropdowns render empty.
export function getMajorCities(code: string): string[] {
  const state = US_STATES.find((s) => s.code === code);
  if (!state) return [];
  return [...state.majorCities];
}
