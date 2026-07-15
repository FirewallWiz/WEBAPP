import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import { React, useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Routes, Route, Navigate } from 'react-router';
import { GenericLayout, HomeLayout, ConfiguratorLayout, OrdersLayout, LoginLayout, TotpLayout, NotFoundLayout } from './components/Layout';
import API from './API.js';

function LoginWithTotp(props) {
  if (props.loggedIn) {
    if (props.user.canDoTotp) {
      if (props.loggedInTotp) {
        return <Navigate replace to='/' />;
      } else {
        return <TotpLayout totpSuccessful={() => props.setLoggedInTotp(true)} setLoggedIn={props.setLoggedIn} />;
      }
    } else {
      return <Navigate replace to='/' />;
    }
  } else {
    return <LoginLayout login={props.login} />;
  }
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loggedInTotp, setLoggedInTotp] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkAuth = async() => {
      try {
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
        if (user.isTotp) setLoggedInTotp(true);
      } catch(err) {
        // not authenticated
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
    } catch (err) {
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await API.logOut();
    } catch (err) {
      console.log(err);
    } finally {
      setLoggedIn(false);
      setLoggedInTotp(false);
      setUser(null);
      setMessage('');
    }
  };

  const handleErrors = (err) => {
    let msg = '';
    if (err.error) msg = err.error;
    else if (err.errors) {
      if (err.errors[0].msg) msg = err.errors[0].msg + ' : ' + err.errors[0].path;
    } else if (Array.isArray(err)) msg = err[0].msg + ' : ' + err[0].path;
    else if (typeof err === "string") msg = String(err);
    else msg = "Unknown Error";
    setMessage(msg);
    console.log(err);
  };

  return (
    <Container fluid>
      <Routes>
        <Route path="/" element={<GenericLayout loggedIn={loggedIn} user={user} logout={handleLogout} message={message} setMessage={setMessage} loggedInTotp={loggedInTotp} />}>
          <Route index element={<HomeLayout />} />
          <Route path="configurator" element={loggedIn ? <ConfiguratorLayout user={user} setUser={setUser} handleErrors={handleErrors} loggedInTotp={loggedInTotp} /> : <Navigate replace to='/login' />} />
          <Route path="orders" element={loggedIn ? <OrdersLayout user={user} setUser={setUser} handleErrors={handleErrors} loggedInTotp={loggedInTotp} /> : <Navigate replace to='/login' />} />
          <Route path="*" element={<NotFoundLayout />} />
        </Route>
        <Route path="/login" element={<LoginWithTotp loggedIn={loggedIn} user={user} login={handleLogin} loggedInTotp={loggedInTotp} setLoggedInTotp={setLoggedInTotp} setLoggedIn={setLoggedIn} />} />
      </Routes>
    </Container>
  );
}

export default App;
