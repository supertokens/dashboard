import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import './App.css';
import Auth from './ui/pages/auth/Auth';
import { getDashboardAppBasePath, getImageUrl } from './utils';

// This is to make sure that images are packed in the build folder
import "./images";
import AuthWrapper from "./ui/components/authWrapper";

function Home() {
  return (
    <AuthWrapper>
      <div className="App">
        <header className="App-header">
          <img src={getImageUrl("logo.svg")} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    </AuthWrapper>
  );
}

function App() {
  return (
    <Router basename={getDashboardAppBasePath()}>
      <Routes>
        <Route path='/auth' element={<Auth />}/>
        <Route path='/' element={<Home/>} />
      </Routes>
    </Router>
  );
}

export default App;
