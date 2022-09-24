import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import InputForm from './components/InputForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<InputForm />}/>
      </Routes>
    </Router>
  );
}

export default App;
