import { useState } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import API from '../API.js';

function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const credentials = { username, password };
    if (!username) {
      setErrorMessage('Username cannot be empty');
    } else if (!password) {
      setErrorMessage('Password cannot be empty');
    } else {
      props.login(credentials)
        .catch((err) => { setErrorMessage(err.error); });
    }
  };

  return (
    <Row className="justify-content-center mt-5">
      <Col md={6}>
        <div className="card shadow">
          <div className="card-body">
            <h5 className="card-title text-center mb-4"><i className="bi bi-person-circle fs-1"></i><br/>Login</h5>
            {errorMessage ? <Alert dismissible onClose={() => setErrorMessage('')} variant="danger">{errorMessage}</Alert> : null}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={username} onChange={e => setUsername(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} />
              </Form.Group>
              <Button className="w-100" variant="success" type="submit">Login</Button>
            </Form>
          </div>
        </div>
      </Col>
    </Row>
  );
}

function TotpForm(props) {
  const [totpCode, setTotpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const doTotpVerify = () => {
    API.totpVerify(totpCode)
      .then(() => {
        setErrorMessage('');
        props.totpSuccessful();
        navigate('/');
      })
      .catch((err) => {
        if (err && err.error && err.error === 'Not authenticated') {
          setErrorMessage('Your session has expired, you will be redirected to the login page');
          setTimeout(() => props.setLoggedIn(false), 2000);
        } else {
          setErrorMessage('Wrong code, please try again');
        }
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');
    let valid = true;
    if (totpCode === '' || totpCode.length !== 6)
      valid = false;
    if (valid) {
      doTotpVerify();
    } else {
      setErrorMessage('Invalid content in form: either empty or not 6-char long');
    }
  };

  return (
    <Row className="justify-content-center mt-5">
      <Col md={6}>
        <div className="card shadow">
          <div className="card-body">
            <h5 className="card-title text-center mb-4"><i className="bi bi-shield-lock fs-1"></i><br/>Two-Factor Authentication</h5>
            {errorMessage ? <Alert dismissible onClose={() => setErrorMessage('')} variant="danger">{errorMessage}</Alert> : null}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Enter 6-digit TOTP code</Form.Label>
                <Form.Control type="text" maxLength={6} value={totpCode} onChange={e => setTotpCode(e.target.value)} placeholder="000000" />
              </Form.Group>
              <Button className="w-100 mb-2" variant="success" type="submit">Verify</Button>
              <Button className="w-100" variant="outline-secondary" onClick={() => navigate('/')}>Skip (limited access)</Button>
            </Form>
          </div>
        </div>
      </Col>
    </Row>
  );
}

function LogoutButton(props) {
  return <Button variant="outline-light" onClick={props.logout}>Logout</Button>
}

function LoginButton(props) {
  const navigate = useNavigate();
  return <Button variant="outline-light" onClick={() => navigate('/login')}>Login</Button>
}

export { LoginForm, TotpForm, LogoutButton, LoginButton };
