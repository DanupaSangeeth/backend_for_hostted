import React from 'react';
import './LandingPage.css';
import background from '../../assets/bg.png'

const LandingPage = () => {
  return (
    <div className='landingpage'>
      <nav>
        <div className="nav__btns">
          <a href='/signup' className="lbtn">SIGN UP</a>
          <a href='/signin' className="lbtn">SIGN IN</a>
        </div>
      </nav>
      
      <header className="section__container header__container">
        <div className="header__image">
          <img className="car1" src={background} alt="header" />
        </div>
        <div className="header__content">
          <h2> Higher National Diploma in Software Engineering (HNDSE)-23.2F</h2>
          <h1>SECURE WRAPPER APPLICATION </h1>
        </div>
      </header>
    </div>
  );
};

export default LandingPage;
