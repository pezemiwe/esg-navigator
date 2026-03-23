import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./Providers";
import LandingPage from "../features/landing/LandingPage";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <PublicLayout>
              <LandingPage />
            </PublicLayout>
          }
        >
          <Route path="/" element={<LandingPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
