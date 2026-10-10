// Realistic Mock Images (Civic Infrastructure with SVG Data URIs for 100% guarantee)
export const MOCK_IMAGES = {
  pothole_before: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='800' height='450' fill='%231e293b'/><path d='M 0 225 L 800 225' stroke='%23f59e0b' stroke-width='6' stroke-dasharray='24,16'/><ellipse cx='400' cy='270' rx='160' ry='80' fill='%230f172a' stroke='%23334155' stroke-width='8'/><path d='M 280 260 C 330 220 450 310 520 250 C 470 320 340 280 280 260 Z' fill='%230284c7' opacity='0.7'/><text x='400' y='80' text-anchor='middle' fill='%23f8fafc' font-family='sans-serif' font-size='28' font-weight='bold'>CIVICEYE REPORTED POTHOLE</text><text x='400' y='120' text-anchor='middle' fill='%23e2e8f0' font-family='sans-serif' font-size='18'>Location: Main Road, Near Bus Stop</text></svg>",
  pothole_after: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='800' height='450' fill='%231e293b'/><path d='M 0 225 L 800 225' stroke='%2310b981' stroke-width='8'/><ellipse cx='400' cy='270' rx='160' ry='80' fill='%23334155' stroke='%2310b981' stroke-width='4'/><text x='400' y='80' text-anchor='middle' fill='%2310b981' font-family='sans-serif' font-size='28' font-weight='bold'>POTHOLE REPAIRED &amp; ASPHALT PATCHED</text><text x='400' y='120' text-anchor='middle' fill='%23e2e8f0' font-family='sans-serif' font-size='18'>Status: RESOLVED by Road Maintenance</text></svg>",
  
  garbage_before: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='800' height='450' fill='%23334155'/><rect x='300' y='140' width='200' height='240' rx='16' fill='%231e293b' stroke='%23475569' stroke-width='6'/><path d='M 280 140 L 520 140' stroke='%2364748b' stroke-width='12' stroke-linecap='round'/><circle cx='280' cy='280' r='35' fill='%23ef4444' opacity='0.8'/><circle cx='350' cy='310' r='45' fill='%23f59e0b' opacity='0.8'/><circle cx='480' cy='300' r='40' fill='%2310b981' opacity='0.8'/><text x='400' y='70' text-anchor='middle' fill='%23f8fafc' font-family='sans-serif' font-size='28' font-weight='bold'>OVERFLOWING GARBAGE DUMP</text><text x='400' y='105' text-anchor='middle' fill='%23e2e8f0' font-family='sans-serif' font-size='18'>Location: Market Area, Sector 4</text></svg>",
  garbage_after: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='800' height='450' fill='%231e293b'/><rect x='330' y='140' width='140' height='240' rx='16' fill='%230284c7' stroke='%2338bdf8' stroke-width='4'/><text x='400' y='80' text-anchor='middle' fill='%2310b981' font-family='sans-serif' font-size='28' font-weight='bold'>GARBAGE CLEARED &amp; DISINFECTED</text><text x='400' y='120' text-anchor='middle' fill='%23e2e8f0' font-family='sans-serif' font-size='18'>Status: RESOLVED by Sanitation Dept</text></svg>",
  
  streetlight_before: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='800' height='450' fill='%23090d16'/><line x1='400' y1='450' x2='400' y2='120' stroke='%23475569' stroke-width='14'/><path d='M 400 120 C 400 70 480 70 480 120' fill='none' stroke='%23475569' stroke-width='12'/><polygon points='460,120 500,120 490,145 470,145' fill='%23334155' stroke='%23f59e0b' stroke-width='3'/><circle cx='480' cy='155' r='16' fill='%23ef4444' opacity='0.9'/><text x='480' y='160' text-anchor='middle' fill='%23ffffff' font-family='sans-serif' font-size='14' font-weight='bold'>!</text><text x='400' y='70' text-anchor='middle' fill='%23f8fafc' font-family='sans-serif' font-size='28' font-weight='bold'>DARK STREETLAMP (BROKEN LIGHT)</text><text x='400' y='105' text-anchor='middle' fill='%2394a3b8' font-family='sans-serif' font-size='18'>Location: College Road Crossroad</text></svg>",
  streetlight_after: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='800' height='450' fill='%230f172a'/><circle cx='480' cy='120' r='200' fill='%23fef08a' opacity='0.25'/><line x1='400' y1='450' x2='400' y2='120' stroke='%2394a3b8' stroke-width='14'/><path d='M 400 120 C 400 70 480 70 480 120' fill='none' stroke='%2394a3b8' stroke-width='12'/><circle cx='480' cy='135' r='16' fill='%23facc15'/><text x='400' y='70' text-anchor='middle' fill='%2310b981' font-family='sans-serif' font-size='28' font-weight='bold'>LED STREETLIGHT REPAIRED &amp; BRIGHT</text><text x='400' y='105' text-anchor='middle' fill='%23e2e8f0' font-family='sans-serif' font-size='18'>Status: RESOLVED by Electrical Dept</text></svg>",
  
  drainage_before: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='800' height='450' fill='%231e293b'/><rect x='100' y='200' width='600' height='180' rx='12' fill='%230f172a' stroke='%23475569' stroke-width='8'/><line x1='200' y1='200' x2='200' y2='380' stroke='%23334155' stroke-width='10'/><line x1='300' y1='200' x2='300' y2='380' stroke='%23334155' stroke-width='10'/><line x1='400' y1='200' x2='400' y2='380' stroke='%23334155' stroke-width='10'/><line x1='500' y1='200' x2='500' y2='380' stroke='%23334155' stroke-width='10'/><line x1='600' y1='200' x2='600' y2='380' stroke='%23334155' stroke-width='10'/><ellipse cx='400' cy='290' rx='260' ry='70' fill='%231e3a5f' opacity='0.8'/><circle cx='320' cy='280' r='30' fill='%2310b981' opacity='0.7'/><circle cx='440' cy='300' r='40' fill='%23f59e0b' opacity='0.7'/><text x='400' y='80' text-anchor='middle' fill='%23f8fafc' font-family='sans-serif' font-size='28' font-weight='bold'>BLOCKED DRAINAGE GUTTER</text><text x='400' y='120' text-anchor='middle' fill='%2394a3b8' font-family='sans-serif' font-size='18'>Location: Market Area North Alley</text></svg>",
  drainage_after: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='800' height='450' fill='%231e293b'/><rect x='100' y='200' width='600' height='180' rx='12' fill='%23334155' stroke='%2310b981' stroke-width='6'/><line x1='200' y1='200' x2='200' y2='380' stroke='%2364748b' stroke-width='8'/><line x1='400' y1='200' x2='400' y2='380' stroke='%2364748b' stroke-width='8'/><line x1='600' y1='200' x2='600' y2='380' stroke='%2364748b' stroke-width='8'/><text x='400' y='80' text-anchor='middle' fill='%2310b981' font-family='sans-serif' font-size='28' font-weight='bold'>DRAINAGE UNBLOCKED &amp; CLEANED</text><text x='400' y='120' text-anchor='middle' fill='%23e2e8f0' font-family='sans-serif' font-size='18'>Status: RESOLVED by Drainage Dept</text></svg>",
  
  water_before: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='800' height='450' fill='%230f172a'/><path d='M 0 300 Q 400 250 800 320 L 800 450 L 0 450 Z' fill='%230284c7' opacity='0.8'/><circle cx='400' cy='280' r='50' fill='%2338bdf8' opacity='0.6'/><path d='M 400 280 C 380 150 420 100 400 50' stroke='%237dd3fc' stroke-width='16' fill='none' stroke-linecap='round'/><text x='400' y='80' text-anchor='middle' fill='%23f8fafc' font-family='sans-serif' font-size='28' font-weight='bold'>MUNICIPAL MAIN PIPE WATER LEAK</text><text x='400' y='120' text-anchor='middle' fill='%2394a3b8' font-family='sans-serif' font-size='18'>Location: Bus Stand Platform 2</text></svg>",
  water_after: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='800' height='450' fill='%230f172a'/><rect x='100' y='220' width='600' height='60' rx='10' fill='%23334155' stroke='%2310b981' stroke-width='6'/><rect x='360' y='200' width='80' height='100' rx='8' fill='%230284c7' stroke='%2338bdf8' stroke-width='4'/><text x='400' y='80' text-anchor='middle' fill='%2310b981' font-family='sans-serif' font-size='28' font-weight='bold'>PIPE BURST SEALED &amp; RESTORED</text><text x='400' y='120' text-anchor='middle' fill='%23e2e8f0' font-family='sans-serif' font-size='18'>Status: RESOLVED by Water Dept</text></svg>",
};

export const INITIAL_COMPLAINTS = [
  {
    id: "CE-2026-00124",
    citizenName: "Rahul Verma",
    category: "Pothole",
    imageUrl: MOCK_IMAGES.pothole_before,
    resolutionImageUrl: MOCK_IMAGES.pothole_after,
    location: "Main Road, Near Bus Stop",
    coordinates: { lat: 12.9716, lng: 77.5946 },
    description: "Large deep pothole causing severe traffic congestion and danger for two-wheelers and cars during peak evening hours.",
    severity: "High",
    confidence: 94,
    duplicateCount: 3,
    priorityScore: 87,
    status: "In Progress", // Submitted, Verified, Assigned, In Progress, Resolved
    department: "Road Maintenance",
    worker: "Alex Miller",
    createdDate: "2026-09-20 09:30 AM",
    expectedResolution: "2026-09-22",
    resolvedDate: null,
    publicImpact: "High",
    isHighTraffic: true,
    breakdown: {
      severityPoints: 35,
      reportPoints: 20,
      impactPoints: 18,
      locationPoints: 14
    },
    timeline: [
      { step: "Report Submitted", status: "completed", timestamp: "2026-09-20 09:30 AM", note: "Report logged by citizen" },
      { step: "AI Verified", status: "completed", timestamp: "2026-09-20 09:31 AM", note: "AI classified: Pothole (94% confidence)" },
      { step: "Priority Generated", status: "completed", timestamp: "2026-09-20 09:31 AM", note: "Calculated Priority Score: 87/100 (HIGH)" },
      { step: "Assigned to Road Maintenance", status: "completed", timestamp: "2026-09-20 11:15 AM", note: "Assigned to Field Worker: Alex Miller" },
      { step: "In Progress", status: "current", timestamp: "2026-09-21 08:00 AM", note: "Work crew dispatched with asphalt patcher" },
      { step: "Resolution Pending", status: "upcoming", timestamp: "-", note: "Final verification pending" },
      { step: "Resolved", status: "upcoming", timestamp: "-", note: "Awaiting after-repair photo upload" }
    ]
  },
  {
    id: "CE-2026-00118",
    citizenName: "Priya Sharma",
    category: "Garbage",
    imageUrl: MOCK_IMAGES.garbage_before,
    resolutionImageUrl: MOCK_IMAGES.garbage_after,
    location: "Market Area, Sector 4",
    coordinates: { lat: 12.9780, lng: 77.5980 },
    description: "Overflowing commercial garbage dump spilling onto sidewalk near vegetable market causing foul odor.",
    severity: "Medium",
    confidence: 91,
    duplicateCount: 5,
    priorityScore: 64,
    status: "Resolved",
    department: "Sanitation",
    worker: "Karan Singh",
    createdDate: "2026-09-18 08:15 AM",
    expectedResolution: "2026-09-19",
    resolvedDate: "2026-09-19 02:45 PM",
    publicImpact: "Medium",
    isHighTraffic: true,
    breakdown: {
      severityPoints: 25,
      reportPoints: 25,
      impactPoints: 12,
      locationPoints: 8
    },
    timeline: [
      { step: "Report Submitted", status: "completed", timestamp: "2026-09-18 08:15 AM", note: "Report logged by citizen" },
      { step: "AI Verified", status: "completed", timestamp: "2026-09-18 08:16 AM", note: "AI classified: Garbage Overflow (91% confidence)" },
      { step: "Priority Generated", status: "completed", timestamp: "2026-09-18 08:16 AM", note: "Score: 64/100 (MEDIUM)" },
      { step: "Assigned to Sanitation", status: "completed", timestamp: "2026-09-18 10:00 AM", note: "Assigned to Sanitation Crew #4" },
      { step: "In Progress", status: "completed", timestamp: "2026-09-19 11:00 AM", note: "Waste compactors deployed" },
      { step: "Resolved", status: "completed", timestamp: "2026-09-19 02:45 PM", note: "Site cleared & disinfected" }
    ]
  },
  {
    id: "CE-2026-00119",
    citizenName: "Amitabh Das",
    category: "Broken Streetlight",
    imageUrl: MOCK_IMAGES.streetlight_before,
    resolutionImageUrl: MOCK_IMAGES.streetlight_after,
    location: "College Road, Near Crossroad",
    coordinates: { lat: 12.9650, lng: 77.6010 },
    description: "Entire street stretch dark due to 3 consecutive non-functioning LED light poles.",
    severity: "High",
    confidence: 88,
    duplicateCount: 2,
    priorityScore: 82,
    status: "Pending",
    department: "Electrical",
    worker: "Unassigned",
    createdDate: "2026-09-21 07:10 AM",
    expectedResolution: "2026-09-23",
    resolvedDate: null,
    publicImpact: "High",
    isHighTraffic: false,
    breakdown: {
      severityPoints: 35,
      reportPoints: 15,
      impactPoints: 18,
      locationPoints: 14
    },
    timeline: [
      { step: "Report Submitted", status: "completed", timestamp: "2026-09-21 07:10 AM", note: "Report logged" },
      { step: "AI Verified", status: "completed", timestamp: "2026-09-21 07:11 AM", note: "AI classified: Broken Streetlight (88% confidence)" },
      { step: "Priority Generated", status: "completed", timestamp: "2026-09-21 07:11 AM", note: "Score: 82/100 (HIGH)" },
      { step: "Assigned to Electrical", status: "upcoming", timestamp: "-", note: "Awaiting supervisor dispatch" },
      { step: "In Progress", status: "upcoming", timestamp: "-", note: "-" },
      { step: "Resolved", status: "upcoming", timestamp: "-", note: "-" }
    ]
  },
  {
    id: "CE-2026-00120",
    citizenName: "Sneha Patel",
    category: "Drainage",
    imageUrl: MOCK_IMAGES.drainage_before,
    resolutionImageUrl: MOCK_IMAGES.drainage_after,
    location: "Market Area, North Alley",
    coordinates: { lat: 12.9792, lng: 77.5921 },
    description: "Stormwater drainage clogged with plastic waste causing backflow onto shop entrances.",
    severity: "High",
    confidence: 96,
    duplicateCount: 4,
    priorityScore: 89,
    status: "Pending",
    department: "Drainage Department",
    worker: "Unassigned",
    createdDate: "2026-09-21 06:45 AM",
    expectedResolution: "2026-09-22",
    resolvedDate: null,
    publicImpact: "High",
    isHighTraffic: true,
    breakdown: {
      severityPoints: 35,
      reportPoints: 22,
      impactPoints: 18,
      locationPoints: 14
    },
    timeline: [
      { step: "Report Submitted", status: "completed", timestamp: "2026-09-21 06:45 AM", note: "Report logged" },
      { step: "AI Verified", status: "completed", timestamp: "2026-09-21 06:46 AM", note: "AI classified: Drainage blockage (96%)" },
      { step: "Priority Generated", status: "completed", timestamp: "2026-09-21 06:46 AM", note: "Score: 89/100 (HIGH)" },
      { step: "Assigned", status: "upcoming", timestamp: "-", note: "Pending desk supervisor" },
      { step: "In Progress", status: "upcoming", timestamp: "-", note: "-" },
      { step: "Resolved", status: "upcoming", timestamp: "-", note: "-" }
    ]
  },
  {
    id: "CE-2026-00121",
    citizenName: "Vikram Reddy",
    category: "Water Leakage",
    imageUrl: MOCK_IMAGES.water_before,
    resolutionImageUrl: MOCK_IMAGES.water_after,
    location: "Bus Stand, Platform 2",
    coordinates: { lat: 12.9730, lng: 77.6100 },
    description: "High pressure municipal main pipe water burst leaking thousands of gallons on street.",
    severity: "High",
    confidence: 97,
    duplicateCount: 6,
    priorityScore: 94,
    status: "In Progress",
    department: "Water Department",
    worker: "David Chen",
    createdDate: "2026-09-20 02:20 PM",
    expectedResolution: "2026-09-21",
    resolvedDate: null,
    publicImpact: "High",
    isHighTraffic: true,
    breakdown: {
      severityPoints: 35,
      reportPoints: 25,
      impactPoints: 18,
      locationPoints: 16
    },
    timeline: [
      { step: "Report Submitted", status: "completed", timestamp: "2026-09-20 02:20 PM", note: "Report logged" },
      { step: "AI Verified", status: "completed", timestamp: "2026-09-20 02:21 PM", note: "AI classified: Pipe burst (97%)" },
      { step: "Priority Generated", status: "completed", timestamp: "2026-09-20 02:21 PM", note: "Score: 94/100 (HIGH CRITICAL)" },
      { step: "Assigned to Water Dept", status: "completed", timestamp: "2026-09-20 02:30 PM", note: "Assigned to Water Tech: David Chen" },
      { step: "In Progress", status: "current", timestamp: "2026-09-20 03:00 PM", note: "Main valve isolated; welding in progress" },
      { step: "Resolved", status: "upcoming", timestamp: "-", note: "-" }
    ]
  },
  {
    id: "CE-2026-00122",
    citizenName: "Ananya Roy",
    category: "Damaged Road",
    imageUrl: MOCK_IMAGES.pothole_before,
    resolutionImageUrl: MOCK_IMAGES.pothole_after,
    location: "Residential Sector 9",
    coordinates: { lat: 12.9680, lng: 77.5890 },
    description: "Crumbling bitumen layer with sharp loose gravel near playground entrance.",
    severity: "Low",
    confidence: 85,
    duplicateCount: 0,
    priorityScore: 38,
    status: "Pending",
    department: "Road Maintenance",
    worker: "Unassigned",
    createdDate: "2026-09-19 04:00 PM",
    expectedResolution: "2026-09-25",
    resolvedDate: null,
    publicImpact: "Low",
    isHighTraffic: false,
    breakdown: {
      severityPoints: 15,
      reportPoints: 5,
      impactPoints: 10,
      locationPoints: 8
    },
    timeline: [
      { step: "Report Submitted", status: "completed", timestamp: "2026-09-19 04:00 PM", note: "Report logged" },
      { step: "AI Verified", status: "completed", timestamp: "2026-09-19 04:01 PM", note: "AI classified: Damaged Road (85%)" },
      { step: "Priority Generated", status: "completed", timestamp: "2026-09-19 04:01 PM", note: "Score: 38/100 (LOW)" },
      { step: "Assigned", status: "upcoming", timestamp: "-", note: "-" },
      { step: "In Progress", status: "upcoming", timestamp: "-", note: "-" },
      { step: "Resolved", status: "upcoming", timestamp: "-", note: "-" }
    ]
  },
  {
    id: "CE-2026-00123",
    citizenName: "Suresh Kumar",
    category: "Garbage",
    imageUrl: MOCK_IMAGES.garbage_before,
    resolutionImageUrl: MOCK_IMAGES.garbage_after,
    location: "Central Park West Gate",
    coordinates: { lat: 12.9755, lng: 77.6055 },
    description: "Plastic bottles and litter accumulated around park bench and flower beds.",
    severity: "Low",
    confidence: 89,
    duplicateCount: 1,
    priorityScore: 42,
    status: "Resolved",
    department: "Sanitation",
    worker: "Sunil Gowda",
    createdDate: "2026-09-17 11:30 AM",
    expectedResolution: "2026-09-18",
    resolvedDate: "2026-09-18 10:15 AM",
    publicImpact: "Low",
    isHighTraffic: false,
    breakdown: {
      severityPoints: 15,
      reportPoints: 10,
      impactPoints: 9,
      locationPoints: 8
    },
    timeline: [
      { step: "Report Submitted", status: "completed", timestamp: "2026-09-17 11:30 AM", note: "Logged" },
      { step: "AI Verified", status: "completed", timestamp: "2026-09-17 11:31 AM", note: "AI verified" },
      { step: "Priority Generated", status: "completed", timestamp: "2026-09-17 11:31 AM", note: "Score 42/100" },
      { step: "Assigned", status: "completed", timestamp: "2026-09-17 01:00 PM", note: "Sunil Gowda" },
      { step: "In Progress", status: "completed", timestamp: "2026-09-18 09:00 AM", note: "Sweeping underway" },
      { step: "Resolved", status: "completed", timestamp: "2026-09-18 10:15 AM", note: "Park area cleaned" }
    ]
  },
  {
    id: "CE-2026-00125",
    citizenName: "Deepak Mehta",
    category: "Broken Streetlight",
    imageUrl: MOCK_IMAGES.streetlight_before,
    resolutionImageUrl: MOCK_IMAGES.streetlight_after,
    location: "Main Road, Near Flyover",
    coordinates: { lat: 12.9705, lng: 77.5960 },
    description: "Flickering high-mast lamp causing strobe effect for oncoming traffic.",
    severity: "Medium",
    confidence: 93,
    duplicateCount: 3,
    priorityScore: 68,
    status: "In Progress",
    department: "Electrical",
    worker: "Rajesh Rao",
    createdDate: "2026-09-20 06:15 PM",
    expectedResolution: "2026-09-22",
    resolvedDate: null,
    publicImpact: "Medium",
    isHighTraffic: true,
    breakdown: {
      severityPoints: 25,
      reportPoints: 20,
      impactPoints: 12,
      locationPoints: 11
    },
    timeline: [
      { step: "Report Submitted", status: "completed", timestamp: "2026-09-20 06:15 PM", note: "Logged" },
      { step: "AI Verified", status: "completed", timestamp: "2026-09-20 06:16 PM", note: "AI verified" },
      { step: "Priority Generated", status: "completed", timestamp: "2026-09-20 06:16 PM", note: "Score 68/100" },
      { step: "Assigned", status: "completed", timestamp: "2026-09-21 09:00 AM", note: "Rajesh Rao assigned" },
      { step: "In Progress", status: "current", timestamp: "2026-09-21 02:00 PM", note: "Replacement driver installed" },
      { step: "Resolved", status: "upcoming", timestamp: "-", note: "-" }
    ]
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: "n-1",
    title: "Complaint Assigned",
    message: "Your complaint CE-2026-00124 has been assigned to Road Maintenance.",
    time: "2 hours ago",
    read: false,
    complaintId: "CE-2026-00124"
  },
  {
    id: "n-2",
    title: "Status Update",
    message: "Complaint CE-2026-00124 status changed to IN PROGRESS.",
    time: "1 hour ago",
    read: false,
    complaintId: "CE-2026-00124"
  },
  {
    id: "n-3",
    title: "Duplicate Grouping Alert",
    message: "3 similar reports were grouped with your pothole report on Main Road.",
    time: "Yesterday",
    read: true,
    complaintId: "CE-2026-00124"
  },
  {
    id: "n-4",
    title: "Complaint Resolved",
    message: "Garbage overflow complaint CE-2026-00118 has been marked as RESOLVED by Sanitation Dept.",
    time: "2 days ago",
    read: true,
    complaintId: "CE-2026-00118"
  }
];

export const MOCK_PRESET_SAMPLES = [
  {
    category: "Pothole",
    name: "Sample Pothole",
    imageUrl: MOCK_IMAGES.pothole_before,
    resolutionImageUrl: MOCK_IMAGES.pothole_after,
    defaultLocation: "Main Road, Near Bus Stop",
    defaultDesc: "Dangerous deep pothole on main transit lane affecting vehicles and bikes.",
    severity: "High",
    confidence: 94,
    publicImpact: "High",
    duplicates: 3
  },
  {
    category: "Garbage",
    name: "Overflowing Garbage",
    imageUrl: MOCK_IMAGES.garbage_before,
    resolutionImageUrl: MOCK_IMAGES.garbage_after,
    defaultLocation: "Market Area, Sector 4",
    defaultDesc: "Unattended municipal garbage bin overflowing across public walkway.",
    severity: "Medium",
    confidence: 92,
    publicImpact: "Medium",
    duplicates: 2
  },
  {
    category: "Broken Streetlight",
    name: "Dark Streetlamp",
    imageUrl: MOCK_IMAGES.streetlight_before,
    resolutionImageUrl: MOCK_IMAGES.streetlight_after,
    defaultLocation: "College Road, Near Crossroad",
    defaultDesc: "Broken light fixture causing complete darkness on pedestrian sidewalk.",
    severity: "High",
    confidence: 89,
    publicImpact: "High",
    duplicates: 1
  },
  {
    category: "Water Leakage",
    name: "Main Water Leak",
    imageUrl: MOCK_IMAGES.water_before,
    resolutionImageUrl: MOCK_IMAGES.water_after,
    defaultLocation: "Bus Stand, Platform 2",
    defaultDesc: "Leaking water pipe flooding street pavement near public transit stop.",
    severity: "High",
    confidence: 96,
    publicImpact: "High",
    duplicates: 4
  },
  {
    category: "Drainage",
    name: "Blocked Drain",
    imageUrl: MOCK_IMAGES.drainage_before,
    resolutionImageUrl: MOCK_IMAGES.drainage_after,
    defaultLocation: "Market Area, North Alley",
    defaultDesc: "Drainage gutter clogged with debris causing stagnant water pooling.",
    severity: "Medium",
    confidence: 95,
    publicImpact: "Medium",
    duplicates: 2
  }
];
