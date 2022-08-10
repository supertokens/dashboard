import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { getDashboardAppBasePath } from './utils';
import UsersListPage from './ui/pages/usersList/UsersList'

// This is to make sure that images are packed in the build folder
import './images'

function App() {
  return (
    <Router basename={getDashboardAppBasePath()}>
      <Routes>
        <Route path='/' element={<UsersListPage />} />
        <Route path="*" element={<UsersListPage />} />
      </Routes>
    </Router>
  )
}

export default App;
