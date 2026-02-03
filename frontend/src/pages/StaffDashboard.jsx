import DashboardLayout from '@/components/layout/DashboardLayout'
import ProductionDashboard from "./ProductionDashboard"
import InventoryDashboard from "./InventoryDashboard"
import TechnicianDashboard from "./TechnicianDashboard"
import ReceptionDashboard from "./ReceptionDashboard"
import SupportDashboard from "./SupportDashboard"
const StaffDashboard = () => {
  return (
    <DashboardLayout>
      
       <ProductionDashboard/>

       <InventoryDashboard/>
       <TechnicianDashboard/>
       <ReceptionDashboard/>
       <SupportDashboard/>
    </DashboardLayout>
  )
}

export default StaffDashboard