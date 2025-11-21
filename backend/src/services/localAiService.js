// Local AI service - no external APIs needed
export const generateLocalRecommendations = (data, type) => {
  switch (type) {
    case 'demand':
      return generateDemandRecommendations(data);
    case 'inventory':
      return generateInventoryRecommendations(data);
    case 'customer':
      return generateCustomerRecommendations(data);
    case 'churn':
      return generateChurnRecommendations(data);
    case 'pricing':
      return generatePricingRecommendations(data);
    default:
      return 'No recommendations available for this data type.';
  }
};

const generateDemandRecommendations = (materials) => {
  if (!materials || materials.length === 0) {
    return "No material data available for analysis.";
  }

  const highDemand = materials.filter(m => m.predicted_demand > 30);
  const lowDemand = materials.filter(m => m.predicted_demand < 10);
  const topMaterials = materials.slice(0, 3);

  return `
📊 DEMAND FORECAST ANALYSIS

🔥 HIGH DEMAND MATERIALS (${highDemand.length} items):
${highDemand.map(m => `• ${m.material_name}: ${m.predicted_demand} units expected`).join('\n')}

📈 TOP 3 MATERIALS TO FOCUS ON:
${topMaterials.map((m, i) => `${i+1}. ${m.material_name} - ${m.predicted_demand} units (${Math.round(m.confidence * 100)}% confidence)`).join('\n')}

💡 RECOMMENDATIONS:
• Increase stock for high-demand materials by 20-30%
• Set up automatic reorder alerts for top materials
• Consider bulk purchasing discounts for high-volume items
• Monitor seasonal trends for better forecasting

⚠️ LOW DEMAND ITEMS (${lowDemand.length} items):
${lowDemand.length > 0 ? lowDemand.map(m => `• ${m.material_name}: Only ${m.predicted_demand} units expected`).join('\n') : '• All materials showing healthy demand'}

🎯 ACTION ITEMS:
1. Review supplier contracts for top 3 materials
2. Negotiate better terms for high-volume purchases
3. Consider alternative suppliers for backup
4. Implement just-in-time ordering for low-demand items
  `.trim();
};

const generateInventoryRecommendations = (inventory) => {
  if (!inventory || inventory.length === 0) {
    return "No inventory data available for analysis.";
  }

  const urgent = inventory.filter(i => i.days_until_reorder <= 7);
  const soon = inventory.filter(i => i.days_until_reorder > 7 && i.days_until_reorder <= 14);
  const critical = inventory.filter(i => i.current_stock <= i.reorder_level);

  return `
📦 INVENTORY OPTIMIZATION ANALYSIS

🚨 URGENT REORDERS (${urgent.length} items - Order within 7 days):
${urgent.map(i => `• ${i.material_name}: ${i.days_until_reorder} days left (${i.current_stock} units)`).join('\n')}

⏰ REORDER SOON (${soon.length} items - Order within 2 weeks):
${soon.map(i => `• ${i.material_name}: ${i.days_until_reorder} days left`).join('\n')}

💡 INVENTORY RECOMMENDATIONS:
• Set up automatic alerts for items with <14 days stock
• Implement Economic Order Quantity (EOQ) for cost optimization
• Consider safety stock levels based on supplier lead times
• Review reorder levels quarterly based on usage patterns

📊 OPTIMIZATION OPPORTUNITIES:
${inventory.slice(0, 3).map(i => `• ${i.material_name}: EOQ = ${i.economic_order_quantity || 'Calculate'} units, Safety Stock = ${i.safety_stock || 'Calculate'} units`).join('\n')}

🎯 IMMEDIATE ACTIONS:
1. Place orders for ${urgent.length} urgent items today
2. Schedule orders for ${soon.length} items within 2 weeks
3. Review supplier lead times and adjust reorder points
4. Implement inventory management software alerts
5. Negotiate better payment terms with reliable suppliers

💰 COST SAVINGS:
• Bulk ordering can reduce costs by 10-15%
• Better supplier terms can improve cash flow
• Reduced stockouts prevent lost sales
  `.trim();
};

const generateCustomerRecommendations = (customers) => {
  if (!customers || customers.length === 0) {
    return "No customer data available for analysis.";
  }

  const champions = customers.filter(c => c.segment === 'Champions');
  const loyal = customers.filter(c => c.segment === 'Loyal Customers');
  const atRisk = customers.filter(c => c.segment === 'At Risk');
  const topSpenders = customers.slice(0, 5);

  return `
👥 CUSTOMER SEGMENTATION ANALYSIS

🏆 CHAMPIONS (${champions.length} customers):
${champions.slice(0, 3).map(c => `• ${c.customer_name}: $${c.monetary} spent, ${c.frequency} orders`).join('\n')}

💎 LOYAL CUSTOMERS (${loyal.length} customers):
${loyal.slice(0, 3).map(c => `• ${c.customer_name}: $${c.monetary} spent, ${c.frequency} orders`).join('\n')}

⚠️ AT RISK CUSTOMERS (${atRisk.length} customers):
${atRisk.slice(0, 3).map(c => `• ${c.customer_name}: ${c.recency} days since last order`).join('\n')}

💡 CUSTOMER STRATEGY RECOMMENDATIONS:

🏆 FOR CHAMPIONS:
• Offer VIP treatment and exclusive services
• Provide volume discounts and priority scheduling
• Ask for referrals and testimonials
• Create loyalty rewards program

💎 FOR LOYAL CUSTOMERS:
• Upsell premium services and add-ons
• Offer early access to new services
• Implement referral incentives
• Regular check-ins and relationship building

⚠️ FOR AT-RISK CUSTOMERS:
• Send personalized re-engagement campaigns
• Offer special discounts or promotions
• Schedule follow-up calls to understand issues
• Provide exceptional service to win them back

🎯 ACTION PLAN:
1. Create VIP program for top ${champions.length} champions
2. Launch re-engagement campaign for ${atRisk.length} at-risk customers
3. Implement customer feedback system
4. Set up automated follow-up sequences
5. Train staff on customer relationship management

💰 REVENUE OPPORTUNITIES:
• Champions can increase spending by 20-30% with proper nurturing
• Loyal customers are prime for upselling services
• Recovering at-risk customers can prevent $${atRisk.reduce((sum, c) => sum + c.monetary, 0)} in lost revenue
  `.trim();
};

const generateChurnRecommendations = (customers) => {
  if (!customers || customers.length === 0) {
    return "No churn data available for analysis.";
  }

  const highRisk = customers.filter(c => c.churn_probability > 0.7);
  const mediumRisk = customers.filter(c => c.churn_probability > 0.4 && c.churn_probability <= 0.7);
  const totalAtRisk = highRisk.length + mediumRisk.length;

  return `
🚨 CUSTOMER CHURN PREVENTION ANALYSIS

⚠️ HIGH CHURN RISK (${highRisk.length} customers - ${Math.round(highRisk.reduce((sum, c) => sum + c.churn_probability, 0) / highRisk.length * 100)}% avg risk):
${highRisk.slice(0, 3).map(c => `• ${c.customer_name}: ${Math.round(c.churn_probability * 100)}% risk, ${c.days_since_last_order} days inactive`).join('\n')}

🔶 MEDIUM CHURN RISK (${mediumRisk.length} customers):
${mediumRisk.slice(0, 3).map(c => `• ${c.customer_name}: ${Math.round(c.churn_probability * 100)}% risk, ${c.total_orders} total orders`).join('\n')}

💡 CHURN PREVENTION STRATEGIES:

🚨 IMMEDIATE INTERVENTIONS (High Risk):
• Personal phone calls from account manager
• Exclusive discount offers (15-25% off next order)
• Free consultation or service upgrade
• Address any service issues immediately
• Flexible payment terms or extended credit

🔶 PROACTIVE RETENTION (Medium Risk):
• Email re-engagement campaigns
• Special promotions and seasonal offers
• Customer satisfaction surveys
• Regular check-in calls
• Loyalty program enrollment

📞 COMMUNICATION STRATEGY:
• Week 1: Personal outreach to high-risk customers
• Week 2: Email campaigns to medium-risk customers
• Week 3: Follow-up on responses and offers
• Week 4: Evaluate results and adjust strategy

🎯 RETENTION TACTICS:
1. Win-back offers: 20% discount on next order
2. Service recovery: Free rush delivery or setup
3. Relationship building: Regular account reviews
4. Value demonstration: Show ROI of your services
5. Competitive analysis: Match or beat competitor offers

💰 FINANCIAL IMPACT:
• Potential revenue at risk: $${customers.reduce((sum, c) => sum + (c.avg_order_value * c.churn_probability), 0).toFixed(0)}
• Cost to acquire new customer: 5x more than retention
• Successful retention can increase customer lifetime value by 300%

📊 SUCCESS METRICS:
• Target: Reduce churn rate by 25% in next quarter
• Track: Response rates, offer acceptance, repeat orders
• Measure: Customer satisfaction scores and feedback
  `.trim();
};

const generatePricingRecommendations = (pricingData) => {
  if (!pricingData || pricingData.length === 0) {
    return "No pricing data available for analysis.";
  }

  const bestPerforming = pricingData.filter(p => p.acceptance_rate > 0.7);
  const poorPerforming = pricingData.filter(p => p.acceptance_rate < 0.4);
  const avgAcceptance = pricingData.reduce((sum, p) => sum + p.acceptance_rate, 0) / pricingData.length;

  return `
💰 PRICING STRATEGY ANALYSIS

📈 HIGH ACCEPTANCE RATES (${bestPerforming.length} price ranges):
${bestPerforming.map(p => `• $${p.price_range}-${p.price_range + 9}: ${Math.round(p.acceptance_rate * 100)}% acceptance, ${p.quote_count} quotes`).join('\n')}

📉 LOW ACCEPTANCE RATES (${poorPerforming.length} price ranges):
${poorPerforming.map(p => `• $${p.price_range}-${p.price_range + 9}: ${Math.round(p.acceptance_rate * 100)}% acceptance, ${p.quote_count} quotes`).join('\n')}

💡 PRICING RECOMMENDATIONS:

🎯 OPTIMAL PRICING STRATEGY:
• Sweet spot appears to be in ranges with >70% acceptance
• Consider reducing prices in low-acceptance ranges by 5-10%
• Test premium pricing for high-demand services
• Implement value-based pricing for complex projects

📊 PRICING TACTICS:
• Bundle services to increase average order value
• Offer tiered pricing (Good, Better, Best)
• Create urgency with limited-time offers
• Provide volume discounts for large orders

🔄 DYNAMIC PRICING OPPORTUNITIES:
• Rush orders: +25-50% premium
• Off-peak times: 10-15% discount
• Bulk orders: 5-20% volume discount
• Loyal customers: 5-10% relationship discount

💰 REVENUE OPTIMIZATION:
• Current average acceptance rate: ${Math.round(avgAcceptance * 100)}%
• Target acceptance rate: 65-75% for optimal revenue
• Price elasticity suggests 10% price reduction could increase volume by 15-25%

🎯 ACTION ITEMS:
1. A/B test pricing in low-acceptance ranges
2. Create service bundles to increase value perception
3. Implement competitor price monitoring
4. Train sales team on value-selling techniques
5. Develop premium service offerings

📈 EXPECTED OUTCOMES:
• 10-15% increase in quote acceptance rates
• 5-20% improvement in average order value
• Better competitive positioning in the market
• Improved customer perception of value
  `.trim();
};