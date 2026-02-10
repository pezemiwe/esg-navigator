import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./app/AppRoutes";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import AppProviders from "./app/AppProviders";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
