import React from "react";
import { TabsContent } from "../ui/tabs";
import Bcg1ReactionsView from "./reactions/Bcg1ReactionsView";
import Bcg2ReactionsView from "./reactions/Bcg2ReactionsView";
import RoutineReactionsView from "./reactions/RoutineReactionsView";

/**
 * Reactions & Care Tab Component
 * Handles 3 distinct clinical contexts:
 * 1. BCG1 (neonatal dose within 24h of birth, WHO educational guidance & scar assessment)
 * 2. BCG2 (revaccination dose administered if scar absent, AI risk prediction & clinical care)
 * 3. Subsequent routine milestones (Pentavalent, MMR, JE, etc. with ML predictions and comfort care)
 */
export default function VaccineReactionsTab({
  isFirstVaccine,
  isBcg2,
  vaccine,
  activeChild,
  schedule = [],
  modelPrediction,
  loadingPrediction,
  predictionError,
  fetchModelPrediction,
  onUpdateVaccineStatus,
  onSelectVaccine
}) {
  return (
    <TabsContent value="care" className="space-y-4 pt-1">
      {isFirstVaccine && !isBcg2 ? (
        <Bcg1ReactionsView
          vaccine={vaccine}
          schedule={schedule}
          onUpdateVaccineStatus={onUpdateVaccineStatus}
          onSelectVaccine={onSelectVaccine}
        />
      ) : isBcg2 ? (
        <Bcg2ReactionsView
          vaccine={vaccine}
          modelPrediction={modelPrediction}
          loadingPrediction={loadingPrediction}
          predictionError={predictionError}
          fetchModelPrediction={fetchModelPrediction}
          onUpdateVaccineStatus={onUpdateVaccineStatus}
        />
      ) : (
        <RoutineReactionsView
          vaccine={vaccine}
          modelPrediction={modelPrediction}
          loadingPrediction={loadingPrediction}
          predictionError={predictionError}
          fetchModelPrediction={fetchModelPrediction}
        />
      )}
    </TabsContent>
  );
}
