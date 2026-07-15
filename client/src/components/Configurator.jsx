import { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router';
import API from '../API.js';

function Configurator(props) {
  const navigate = useNavigate();
  const location = useLocation();

  const [menu, setMenu] = useState(null);
  const [waiting, setWaiting] = useState(true);

  const [size, setSize] = useState('S');
  const [mainIngredient, setMainIngredient] = useState('roast beef');
  const [breadType, setBreadType] = useState('wheat');
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedDressings, setSelectedDressings] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const [orderSandwiches, setOrderSandwiches] = useState([]);
  const [formMessage, setFormMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.getMenu()
      .then(data => {
        setMenu(data);
        if (location.state && location.state.sandwiches) {
          setOrderSandwiches(location.state.sandwiches);
        }
      })
      .catch(err => { console.log(err); })
      .finally(() => setWaiting(false));
  }, [location.state]);

  const getSizeConfig = (s) => {
    if (!menu) return null;
    return menu.sizes.find(sz => sz.size === s);
  };

  const computeUnitPrice = () => {
    const config = getSizeConfig(size);
    if (!config) return 0;
    const extraIngredients = Math.max(0, selectedIngredients.length - config.includedIngredients);
    return Math.round(config.basePrice * (1 + 0.3 * extraIngredients) * 100) / 100;
  };

  const unitPrice = computeUnitPrice();

  const computeOrderTotal = (sandwiches) => {
    let total = 0;
    let totalQty = 0;
    sandwiches.forEach(s => {
      total += s.unitPrice * s.quantity;
      totalQty += s.quantity;
    });
    if (totalQty >= 4) {
      total = total * 0.8;
    }
    return { total: Math.round(total * 100) / 100, totalQty: totalQty };
  };

  const { total: orderTotal, totalQty: totalSandwiches } = computeOrderTotal(orderSandwiches);

  const handleIngredientChange = (ingredient) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredient)
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleDressingChange = (dressing) => {
    const config = getSizeConfig(size);
    if (!config) return;
    setSelectedDressings(prev => {
      if (prev.includes(dressing)) {
        return prev.filter(d => d !== dressing);
      } else {
        if (prev.length >= config.maxDressings) {
          return prev;
        }
        return [...prev, dressing];
      }
    });
  };

  const handleSizeChange = (newSize) => {
    setSize(newSize);
    const config = getSizeConfig(newSize);
    if (config && selectedDressings.length > config.maxDressings) {
      setSelectedDressings(prev => prev.slice(0, config.maxDressings));
    }
  };

  const resetForm = () => {
    setSize('S');
    setMainIngredient('roast beef');
    setBreadType('wheat');
    setSelectedIngredients([]);
    setSelectedDressings([]);
    setQuantity(1);
  };

  const handleAddSandwich = async () => {
    setFormMessage('');
    try {
      const availability = await API.getAvailability();
      const draftCount = { 'S': 0, 'M': 0, 'L': 0 };
      orderSandwiches.forEach(s => { draftCount[s.size] += s.quantity; });
      draftCount[size] += quantity;

      if (draftCount[size] > availability[size]) {
        setFormMessage('Not enough ' + size + ' sandwiches available. Available: ' + availability[size] + ', in your order: ' + (draftCount[size] - quantity) + ', requested: ' + quantity);
        return;
      }

      const newSandwich = {
        size: size,
        mainIngredient: mainIngredient,
        breadType: breadType,
        ingredients: [...selectedIngredients],
        dressings: [...selectedDressings],
        quantity: quantity,
        unitPrice: unitPrice
      };

      setOrderSandwiches(prev => [...prev, newSandwich]);
      resetForm();
    } catch (err) {
      setFormMessage('Error checking availability. Please try again.');
      console.log(err);
    }
  };

  const handleRemoveSandwich = (index) => {
    setOrderSandwiches(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitOrder = async () => {
    if (orderSandwiches.length === 0) {
      setFormMessage('Please add at least one sandwich to your order.');
      return;
    }
    setSubmitting(true);
    setFormMessage('');
    try {
      const result = await API.createOrder(orderSandwiches);
      props.setUser(prev => ({ ...prev, credit: result.credit }));
      navigate('/orders');
    } catch (err) {
      if (err.error) {
        setFormMessage(err.error);
      } else {
        setFormMessage('Error submitting order. Please try again.');
      }
      console.log(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (waiting) return <div className="text-center my-5"><Spinner animation="border" variant="success" /></div>;
  if (!menu) return <Alert variant="danger">Failed to load menu data.</Alert>;

  const currentSizeConfig = getSizeConfig(size);

  return (
    <>
      <h1 className="my-3"><i className="bi bi-cart-plus"></i> Create Your Order</h1>

      {formMessage ? <Alert variant='warning' onClose={() => setFormMessage('')} dismissible>{formMessage}</Alert> : null}

      <Row>
        <Col md={6}>
          <div className="card shadow-sm mb-3">
            <div className="card-header bg-success text-white"><i className="bi bi-plus-circle"></i> Configure Sandwich</div>
            <div className="card-body">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label><strong>Size</strong></Form.Label>
                  <Form.Select value={size} onChange={e => handleSizeChange(e.target.value)}>
                    {menu.sizes.map(s => (
                      <option key={s.size} value={s.size}>
                        {s.size === 'S' ? 'Small' : s.size === 'M' ? 'Medium' : 'Large'} ({s.size}) - {s.basePrice.toFixed(2)}€
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label><strong>Main Ingredient</strong></Form.Label>
                  <Form.Select value={mainIngredient} onChange={e => setMainIngredient(e.target.value)}>
                    {menu.mainIngredients.map(m => (
                      <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label><strong>Bread</strong></Form.Label>
                  <Form.Select value={breadType} onChange={e => setBreadType(e.target.value)}>
                    {menu.breadTypes.map(b => (
                      <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Ingredients</strong>
                    <small className="text-muted ms-2">
                      ({selectedIngredients.length} selected, {currentSizeConfig ? currentSizeConfig.includedIngredients : 0} included in base price)
                    </small>
                  </Form.Label>
                  {menu.ingredients.map(ing => (
                    <Form.Check key={ing} type="checkbox" label={ing.charAt(0).toUpperCase() + ing.slice(1)}
                      checked={selectedIngredients.includes(ing)}
                      onChange={() => handleIngredientChange(ing)} />
                  ))}
                  {selectedIngredients.length > (currentSizeConfig ? currentSizeConfig.includedIngredients : 0) &&
                    <small className="text-danger">
                      +{selectedIngredients.length - currentSizeConfig.includedIngredients} extra ingredient(s): +{((selectedIngredients.length - currentSizeConfig.includedIngredients) * 30)}% surcharge
                    </small>
                  }
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Dressings</strong>
                    <small className="text-muted ms-2">
                      ({selectedDressings.length} / {currentSizeConfig ? currentSizeConfig.maxDressings : 0} max)
                    </small>
                  </Form.Label>
                  {menu.dressings.map(dress => (
                    <Form.Check key={dress} type="checkbox" label={dress.charAt(0).toUpperCase() + dress.slice(1)}
                      checked={selectedDressings.includes(dress)}
                      onChange={() => handleDressingChange(dress)}
                      disabled={!selectedDressings.includes(dress) && selectedDressings.length >= (currentSizeConfig ? currentSizeConfig.maxDressings : 0)} />
                  ))}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label><strong>Quantity</strong></Form.Label>
                  <Form.Control type="number" min={1} step={1} value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value) || 1)} />
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fs-5">Unit Price: <span className="price-tag">{unitPrice.toFixed(2)}€</span></span>
                  <span className="fs-5">Subtotal: <span className="price-tag">{(unitPrice * quantity).toFixed(2)}€</span></span>
                </div>

                <Button variant="success" className="w-100" onClick={handleAddSandwich}>
                  <i className="bi bi-plus-lg"></i> Add to Order
                </Button>
              </Form>
            </div>
          </div>
        </Col>

        <Col md={6}>
          <div className="card shadow-sm mb-3">
            <div className="card-header bg-success text-white"><i className="bi bi-receipt"></i> Order Summary ({totalSandwiches} sandwich{totalSandwiches !== 1 ? 'es' : ''})</div>
            <div className="card-body">
              {orderSandwiches.length === 0 ? (
                <p className="text-muted text-center">No sandwiches added yet. Configure one and click "Add to Order".</p>
              ) : (
                <>
                  <Table striped bordered size="sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Size</th>
                        <th>Main</th>
                        <th>Bread</th>
                        <th>Ingredients</th>
                        <th>Dressings</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderSandwiches.map((s, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td><span className="badge bg-secondary">{s.size}</span></td>
                          <td>{s.mainIngredient}</td>
                          <td>{s.breadType}</td>
                          <td><small>{s.ingredients.join(', ') || '-'}</small></td>
                          <td><small>{s.dressings.join(', ') || '-'}</small></td>
                          <td>{s.quantity}</td>
                          <td className="price-tag">{(s.unitPrice * s.quantity).toFixed(2)}€</td>
                          <td>
                            <Button variant="outline-danger" size="sm" onClick={() => handleRemoveSandwich(index)}>
                              <i className="bi bi-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {totalSandwiches >= 4 && <p className="discount-tag"><i className="bi bi-tag"></i> 20% discount applied!</p>}

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fs-4">Total: <span className="price-tag">{orderTotal.toFixed(2)}€</span></span>
                    {props.user && <span className="text-muted">Your credit: {props.user.credit.toFixed(2)}€</span>}
                  </div>

                  <Button variant="success" className="w-100" onClick={handleSubmitOrder} disabled={submitting}>
                    {submitting ? <><Spinner animation="border" size="sm" /> Submitting...</> : <><i className="bi bi-check-circle"></i> Confirm Order</>}
                  </Button>
                </>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
}

export default Configurator;
