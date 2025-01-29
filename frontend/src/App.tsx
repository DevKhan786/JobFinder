import { Route, Routes } from "react-router-dom";
import ContextProvider from "./providers/ContextProvider";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <ContextProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </ContextProvider>
  );
}

export default App;
