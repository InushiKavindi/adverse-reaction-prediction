import React, { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
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
import PredictionScreening from "./components/prediction/PredictionScreening";
import PredictionHistory from "./components/history/PredictionHistory";
import ProfileView from "./components/profile/ProfileView";

function DashboardMain({
  currentPage,
  setCurrentPage,
  screeningVaccine,
  setScreeningVaccine,
  selectedVaccine,
  setSelectedVaccine,
  setMobileOpen
}) {
  const handleStartScreening = (vaccineName = "") => {
    setScreeningVaccine(vaccineName);
    setCurrentPage("screening");
  };

  const handleViewSchedule = () => {
    setCurrentPage("schedule");
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
              onStartScreening={() => handleStartScreening("")}
              onViewSchedule={handleViewSchedule}
            />

            <StatPills />

            <ActionCards
              onStartScreening={() => handleStartScreening("")}
              onViewSchedule={handleViewSchedule}
            />

            <QuickSchedule
              onSelectVaccineForScreening={(vax) => handleStartScreening(vax)}
              onViewFullSchedule={handleViewSchedule}
            />
          </div>
        )}

        {currentPage === "schedule" && (
          <VaccineSchedule
            onSelectVaccine={handleSelectVaccineDetail}
            onPredictVaccine={(vax) => handleStartScreening(vax)}
          />
        )}

        {currentPage === "vaccine-detail" && (
          <VaccineDetailView
            vaccine={selectedVaccine}
            onBack={() => setCurrentPage("schedule")}
            onPredictVaccine={(vax) => handleStartScreening(vax)}
            onSelectVaccine={handleSelectVaccineDetail}
          />
        )}


        {currentPage === "screening" && (
          <PredictionScreening
            initialVaccine={screeningVaccine}
            onPredictionSaved={() => {}}
          />
        )}

        {currentPage === "history" && (
          <PredictionHistory
            onNewScreening={() => handleStartScreening("")}
          />
        )}

        {currentPage === "profile" && <ProfileView />}
      </main>
    </div>
  );
}

function MainLayout() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [screeningVaccine, setScreeningVaccine] = useState("");
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
        screeningVaccine={screeningVaccine}
        setScreeningVaccine={setScreeningVaccine}
        selectedVaccine={selectedVaccine}
        setSelectedVaccine={setSelectedVaccine}
        setMobileOpen={setMobileOpen}
      />

      <AuthModal />
      <AddChildModal
        isOpen={isAddChildModalOpen}
        onClose={() => setIsAddChildModalOpen(false)}
      />
    </div>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <ChildProvider>
        <MainLayout />
      </ChildProvider>
    </AuthProvider>
  );
}
