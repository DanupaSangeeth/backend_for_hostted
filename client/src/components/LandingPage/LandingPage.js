import React from 'react';
import './LandingPage.css';
import background from '../../assets/bg.png';

const LandingPage = () => {
  return (
    <div className="landingpage">
      <nav className="navbar">
        <div className="nav__logo">
          <a href="/">GEN-X</a>
        </div>
        <div className="nav__btns">
          <a href="/signup" className="lbtn">SIGN UP</a>
          <a href="/signin" className="lbtn">SIGN IN</a>
        </div>
      </nav>
      
      <header className="section__container header__container">
        <div className="header__image">
          <img className="car1" src={background} alt="header" />
        </div>
        <div className="header__content">
          <h2>Higher National Diploma in Software Engineering (HNDSE) - 23.3F</h2>
          <h1>GEN-X</h1>
          <p className="lpara">Your ultimate solution to secure and protect your sensitive applications.</p>
          <div className="header__btns">
            <a href="/signup" className="header__btn">Get Started</a>
            <a href="/learnmore" className="header__btn header__btn--outline">Learn More</a>
          </div>
        </div>
      </header>
    </div>
  );
};

export default LandingPage;
