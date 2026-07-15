import { Row, Col, Alert } from 'react-bootstrap';
import { Outlet, Link } from 'react-router';
import Navigation from './Navigation';
import { LoginForm, TotpForm } from './Auth';
import Home from './Home';
import Configurator from './Configurator';
import OrderList from './OrderList';

function GenericLayout(props) {
  return (
    <>
      <Row><Col>
        <Navigation loggedIn={props.loggedIn} user={props.user} logout={props.logout} loggedInTotp={props.loggedInTotp} />
      </Col></Row>

      <Row><Col className="mx-3">
        {props.message ? <Alert className='my-2' onClose={() => props.setMessage('')} variant='danger' dismissible>
          {props.message}</Alert> : null}
      </Col></Row>

      <Row><Col className="mx-3">
        <Outlet />
      </Col></Row>
    </>
  );
}

function HomeLayout(props) {
  return <Home />;
}

function ConfiguratorLayout(props) {
  return <Configurator user={props.user} setUser={props.setUser} handleErrors={props.handleErrors} loggedInTotp={props.loggedInTotp} />;
}

function OrdersLayout(props) {
  return <OrderList user={props.user} setUser={props.setUser} handleErrors={props.handleErrors} loggedInTotp={props.loggedInTotp} />;
}

function LoginLayout(props) {
  return <LoginForm login={props.login} />;
}

function TotpLayout(props) {
  return <TotpForm totpSuccessful={props.totpSuccessful} setLoggedIn={props.setLoggedIn} />;
}

function NotFoundLayout() {
  return (
    <>
      <h2 className="my-3">Page not found</h2>
      <p>The requested page does not exist. Go back to <Link to="/">Home</Link>.</p>
    </>
  );
}

export { GenericLayout, HomeLayout, ConfiguratorLayout, OrdersLayout, LoginLayout, TotpLayout, NotFoundLayout };
