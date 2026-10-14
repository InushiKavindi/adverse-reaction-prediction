import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChildProvider } from "./context/ChildContext";
import Sidebar from "./components/layout/Sidebar";
import TopHeader from "./components/layout/TopHeader";
import AuthModal from "./components/auth/AuthModal";

// Dashboard Components
import HeroBanner from "./components/dashboard/HeroBanner";
import StatPills from "./components/dashboard/StatPills";
import ActionCards from "./components/dashboard/ActionCards";
import QuickSchedule from "./components/dashboard/QuickSchedule";

// Other Pages
import VaccineSchedule from "./components/schedule/VaccineSchedule";
import PredictionScreening from "./components/prediction/PredictionScreening";
import PredictionHistory from "./components/history/PredictionHistory";
import ProfileView from "./components/profile/ProfileView";

function DashboardMain({
  currentPage,
  setCurrentPage,
  screeningVaccine,
  setScreeningVaccine
}) {
  const handleStartScreening = (vaccineName = "") => {
    setScreeningVaccine(vaccineName);
    setCurrentPage("screening");
  };

  const handleViewSchedule = () => {
    setCurrentPage("schedule");
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#fcfdff]">
      <TopHeader setCurrentPage={setCurrentPage} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
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
            onPredictVaccine={(vax) => handleStartScreening(vax)}
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

  return (
    <div className="flex min-h-screen bg-[#fcfdff] font-sans antialiased text-slate-800">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <DashboardMain
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        screeningVaccine={screeningVaccine}
        setScreeningVaccine={setScreeningVaccine}
      />

      <AuthModal />
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
