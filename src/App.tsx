import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { getDashboardAppBasePath } from './utils';
import Auth from './ui/pages/auth/Auth';
import AuthWrapper from "./ui/components/authWrapper";
import Dashboard from "./ui/pages/dashboard/Dashboard";

// This is to make sure that images are packed in the build folder
import "./images";

function App() {
  return (
    <Router basename={getDashboardAppBasePath()}>
      <Routes>
        <Route path='/auth' element={<Auth />}/>
        <Route path='/' element={(
          <AuthWrapper>
            <Dashboard />
          </AuthWrapper>
        )} />
      </Routes>
    </Router>
  );
}

export default App;
