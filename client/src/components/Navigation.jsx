import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, NavLink } from 'react-router';
import { LoginButton, LogoutButton } from './Auth';

const Navigation = (props) => {
  return (
    <Navbar bg="success" variant="dark" expand="md" className="px-3">
      <Navbar.Brand as={Link} to="/">
        <i className="bi bi-basket2-fill mx-2" />
        Sandwich Shop
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Nav className="me-auto">
          <Nav.Link as={NavLink} to="/">Home</Nav.Link>
          {props.loggedIn && <Nav.Link as={NavLink} to="/configurator">New Order</Nav.Link>}
          {props.loggedIn && <Nav.Link as={NavLink} to="/orders">My Orders</Nav.Link>}
        </Nav>
        <Nav>
          <Navbar.Text className="mx-2">
            {props.user && props.user.name && `Logged in ${props.loggedInTotp ? '(2FA)' : ''} as: ${props.user.name}`}
            {props.user && props.user.credit !== undefined && ` | Credit: ${props.user.credit.toFixed(2)}€`}
          </Navbar.Text>
          {props.loggedIn ? <LogoutButton logout={props.logout} /> : <LoginButton />}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Navigation;
