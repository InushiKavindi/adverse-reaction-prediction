import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChildProvider, useChild } from "./context/ChildContext";
import Sidebar from "./components/layout/Sidebar";
import TopHeader from "./components/layout/TopHeader";
import AuthModal from "./components/auth/AuthModal";
import AddChildModal from "./components/profile/AddChildModal";


// Dashboard Components
import HeroBanner from "./components/dashboard/HeroBanner";
import StatPills from "./components/dashboard/StatPills";
import ActionCards from "./components/dashboard/ActionCards";
import QuickSchedule from "./components/dashboard/QuickSchedule";

// Other Pages
import VaccineSchedule from "./components/schedule/VaccineSchedule";
import VaccineDetailView from "./components/schedule/VaccineDetailView";
import PredictionHistory from "./components/history/PredictionHistory";
import ProfileView from "./components/profile/ProfileView";

function DashboardMain({
  currentPage,
  setCurrentPage,
  selectedVaccine,
  setSelectedVaccine,
  setMobileOpen
}) {
  const handleViewSchedule = () => {
    setCurrentPage("schedule");
  };

  const handleViewHistory = () => {
    setCurrentPage("history");
  };

  const handleSelectVaccineDetail = (vax) => {
    setSelectedVaccine(vax);
    setCurrentPage("vaccine-detail");
  };

  return (
    <div className="flex-1 flex flex-col h-screen h-[100dvh] min-w-0 w-full overflow-hidden bg-[#fcfdff]">
      <TopHeader setCurrentPage={setCurrentPage} setMobileOpen={setMobileOpen} />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 min-w-0">
        {currentPage === "dashboard" && (
          <div className="space-y-6">
            <HeroBanner
              onViewSchedule={handleViewSchedule}
              onViewHistory={handleViewHistory}
            />

            <StatPills />

            <ActionCards
              onViewHistory={handleViewHistory}
              onViewSchedule={handleViewSchedule}
            />

            <QuickSchedule
              onViewFullSchedule={handleViewSchedule}
            />
          </div>
        )}

        {currentPage === "schedule" && (
          <VaccineSchedule
            onSelectVaccine={handleSelectVaccineDetail}
          />
        )}

        {currentPage === "vaccine-detail" && (
          <VaccineDetailView
            vaccine={selectedVaccine}
            onBack={() => setCurrentPage("schedule")}
            onSelectVaccine={handleSelectVaccineDetail}
          />
        )}

        {currentPage === "history" && (
          <PredictionHistory onNewScreening={() => setCurrentPage("schedule")} />
        )}

        {currentPage === "profile" && <ProfileView />}
      </main>
    </div>
  );
}

function MainLayout() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);

  const { isAddChildModalOpen, setIsAddChildModalOpen } = useChild();

  // Normalize navigation active state for sidebar
  const sidebarCurrentPage = currentPage === "vaccine-detail" ? "schedule" : currentPage;

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-[#fcfdff] font-sans antialiased text-slate-800 w-full">
      <Sidebar
        currentPage={sidebarCurrentPage}
        setCurrentPage={setCurrentPage}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <DashboardMain
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        selectedVaccine={selectedVaccine}
        setSelectedVaccine={setSelectedVaccine}
        setMobileOpen={setMobileOpen}
      />

      <AddChildModal
        isOpen={isAddChildModalOpen}
        onClose={() => setIsAddChildModalOpen(false)}
      />
    </div>
  );
}

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <AuthModal />;
  }

  return <MainLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <ChildProvider>
        <AppContent />
      </ChildProvider>
    </AuthProvider>
  );
}
