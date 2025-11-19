export function fetchDemoLeads() {
  return [
    { id: 'L-1001', name: 'Acme School Banner', channel: 'WhatsApp', status: 'New', owner: 'Reception - Mary' },
    { id: 'L-1002', name: 'Corporate Polo Shirts', channel: 'Instagram', status: 'Contacted', owner: 'Reception - John' },
    { id: 'L-1003', name: 'Church Event Backdrop', channel: 'Walk-in', status: 'Qualified', owner: 'Reception - Mary' }
  ];
}

export function fetchDemoOrders() {
  return [
    { id: 'ORD-23001', customer: 'Acme School', total: 450.0, status: 'In Production', eta: '2025-11-25' },
    { id: 'ORD-23002', customer: 'Hope Church', total: 320.0, status: 'Ready for Pickup', eta: '2025-11-20' },
    { id: 'ORD-23003', customer: 'Top Merch Ltd', total: 1200.0, status: 'Delivered', eta: '2025-11-10' }
  ];
}

export function fetchDemoWorkOrders() {
  return [
    { id: 'WO-501', orderId: 'ORD-23001', jobName: 'School Opening Banners', stage: 'Print', technician: 'Joseph', sla: '4h' },
    { id: 'WO-502', orderId: 'ORD-23002', jobName: 'Backdrop 4x3m', stage: 'Finishing', technician: 'Grace', sla: '2h' },
    { id: 'WO-503', orderId: 'ORD-23003', jobName: 'Polo Shirt Branding', stage: 'Design', technician: 'Peter', sla: '8h' }
  ];
}

export function fetchDemoMaterials() {
  return [
    { sku: 'VINYL-3M-GLOSS', name: '3m Glossy Vinyl', stockQty: 120, uom: 'm', category: 'Vinyl' },
    { sku: 'INK-CMYK-1L', name: 'Solvent Ink CMYK 1L Set', stockQty: 15, uom: 'set', category: 'Ink' },
    { sku: 'TSHIRT-M-BLACK', name: 'T-Shirt Black M', stockQty: 75, uom: 'pcs', category: 'Garments' }
  ];
}

export function fetchDemoInvoices() {
  return [
    { id: 'INV-2025-001', customer: 'Acme School', amount: 450.0, status: 'Partially Paid', dueDate: '2025-11-30' },
    { id: 'INV-2025-002', customer: 'Hope Church', amount: 320.0, status: 'Paid', dueDate: '2025-11-18' },
    { id: 'INV-2025-003', customer: 'Top Merch Ltd', amount: 1200.0, status: 'Unpaid', dueDate: '2025-12-05' }
  ];
}

export function fetchDemoCampaigns() {
  return [
    { id: 'CMP-BACK2SCHOOL', name: 'Back to School Banners', channel: 'Facebook/Instagram', budget: 500.0, status: 'Active' },
    { id: 'CMP-CHRISTMAS', name: 'Christmas Promo', channel: 'WhatsApp Broadcast', budget: 300.0, status: 'Planned' }
  ];
}

export function fetchDemoConversations() {
  return [
    { id: 'CONV-IG-001', customer: 'Jane (IG)', channel: 'Instagram', subject: 'Polo branding', slaStatus: 'On Track' },
    { id: 'CONV-WA-002', customer: 'John (WA)', channel: 'WhatsApp', subject: 'Event backdrop', slaStatus: 'At Risk' }
  ];
}

export function fetchDemoAiInsights() {
  return {
    demandForecast: [
      { category: 'Banners', month: '2025-12', expectedJobs: 42 },
      { category: 'Garments', month: '2025-12', expectedJobs: 28 },
      { category: 'Stickers', month: '2025-12', expectedJobs: 15 }
    ],
    priceRecommendations: [
      { item: '3m Banner Print', currentPrice: 45, suggestedPrice: 49, reason: 'High demand before holidays' },
      { item: 'T-Shirt Vinyl Print', currentPrice: 7, suggestedPrice: 6.5, reason: 'Price-sensitive segment' }
    ]
  };
}

