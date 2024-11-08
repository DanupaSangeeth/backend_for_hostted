import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingPage from './components/LandingPage/LandingPage';
import SignIn from './components/SignIn/SignIn';
import Home from './components/Home/Home';
import SignUp from './components/SignUp/SignUp';
import AdminLogin from './components/AdminLogin/AdminLogin'; // Import AdminLogin component
import AdminHome from './components/AdminHome/AdminHome';

function App() {
  return (
    <div className="App">
        <BrowserRouter>
        <ToastContainer position="top-center" style={{ marginTop: "70px" }} />
            <main>
              <Routes>
                {/* Define the routes */}
                <Route path='/' element={<LandingPage />} />
                <Route path='/home' element={<Home />} />
                <Route path='/signin' element={<SignIn />} />
                <Route path='/signup' element={<SignUp />} />
                <Route path='/admin-login' element={<AdminLogin />} /> {/* Admin Login Route */}
                <Route path='/admin-home' element={<AdminHome />} /> {/* Admin Login Route */}
              </Routes>
            </main>
        </BrowserRouter>
    </div>
  );
}

export default App;
