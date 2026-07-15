import { useState, useEffect } from 'react';
import { Row, Col, Spinner, Table, ListGroup } from 'react-bootstrap';
import API from '../API.js';

function Home() {
  const [menu, setMenu] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [waiting, setWaiting] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const menuData = await API.getMenu();
        const availData = await API.getAvailability();
        setMenu(menuData);
        setAvailability(availData);
      } catch (err) {
        console.log(err);
      } finally {
        setWaiting(false);
      }
    };
    loadData();
  }, []);

  if (waiting) return <div className="text-center my-5"><Spinner animation="border" variant="success" /></div>;

  return (
    <>
      <h1 className="my-3"><i className="bi bi-shop"></i> Welcome to the Sandwich Shop</h1>
      
      {/* Availability Section */}
      <h3 className="my-3"><i className="bi bi-clock"></i> Today's Availability</h3>
      <Row className="mb-4">
        {menu && menu.sizes.map(s => (
          <Col md={4} key={s.size}>
            <div className="card text-center shadow-sm mb-3 sandwich-card">
              <div className="card-body">
                <h5 className="card-title fs-3">
                  {s.size === 'S' ? '🥪 Small' : s.size === 'M' ? '🥖 Medium' : '🥙 Large'} ({s.size})
                </h5>
                <p className="card-text fs-4 price-tag">{s.basePrice.toFixed(2)}€</p>
                <p className="card-text">
                  {s.includedIngredients} ingredients included | Up to {s.maxDressings} dressing{s.maxDressings > 1 ? 's' : ''}
                </p>
                <span className={`badge bg-${availability && availability[s.size] > 0 ? 'success' : 'danger'} availability-badge fs-5`}>
                  {availability ? availability[s.size] : '...'} available
                </span>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Menu Info */}
      <Row>
        <Col md={6}>
          <div className="card shadow-sm mb-3">
            <div className="card-header bg-success text-white"><i className="bi bi-list-check"></i> Main Ingredients</div>
            <ListGroup variant="flush">
              {menu && menu.mainIngredients.map(m => <ListGroup.Item key={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</ListGroup.Item>)}
            </ListGroup>
          </div>
          <div className="card shadow-sm mb-3">
            <div className="card-header bg-success text-white"><i className="bi bi-bread-slice"></i> Bread Types</div>
            <ListGroup variant="flush">
              {menu && menu.breadTypes.map(b => <ListGroup.Item key={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</ListGroup.Item>)}
            </ListGroup>
          </div>
        </Col>
        <Col md={6}>
          <div className="card shadow-sm mb-3">
            <div className="card-header bg-success text-white"><i className="bi bi-egg-fried"></i> Optional Ingredients</div>
            <ListGroup variant="flush">
              {menu && menu.ingredients.map(i => <ListGroup.Item key={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</ListGroup.Item>)}
            </ListGroup>
          </div>
          <div className="card shadow-sm mb-3">
            <div className="card-header bg-success text-white"><i className="bi bi-droplet-fill"></i> Dressings</div>
            <ListGroup variant="flush">
              {menu && menu.dressings.map(d => <ListGroup.Item key={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</ListGroup.Item>)}
            </ListGroup>
          </div>
        </Col>
      </Row>

      {/* Pricing Info */}
      <div className="card shadow-sm mb-3">
        <div className="card-header bg-success text-white"><i className="bi bi-info-circle"></i> Pricing Info</div>
        <div className="card-body">
          <p>Each extra ingredient beyond the included amount adds <strong>+30%</strong> to the sandwich base price.</p>
          <p>Orders with <strong>4 or more sandwiches</strong> receive a <strong>20% discount</strong>!</p>
        </div>
      </div>
    </>
  );
}

export default Home;
