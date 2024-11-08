import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingPage from './components/LandingPage/LandingPage';
import SignIn from './components/SignIn/SignIn';
import Home from './components/Home/Home';
import SignUp from './components/SignUp/SignUp';



function App() {
  return (
    <div className="App">
        <BrowserRouter>
        <ToastContainer position="top-center" style={{marginTop: "70px"}}/>
            <main>
              <Routes>
                
              <Route path='/' element={<LandingPage/>}/>
              <Route path='/home' element={<Home/>}/>
              <Route path='/signin' element={<SignIn/>}/>
              <Route path='/signup' element={<SignUp/>}/>
              </Routes>
            </main>
        </BrowserRouter>
    </div>
  );
}

export default App;