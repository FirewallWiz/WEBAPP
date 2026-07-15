import { useState, useEffect } from 'react';
import { Table, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import API from '../API.js';

function OrderList(props) {
  const [orders, setOrders] = useState([]);
  const [waiting, setWaiting] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [actionVariant, setActionVariant] = useState('danger');
  const navigate = useNavigate();

  const loadOrders = () => {
    setWaiting(true);
    API.getOrders()
      .then(data => { setOrders(data); })
      .catch(err => { props.handleErrors(err); })
      .finally(() => setWaiting(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleDuplicate = async (order) => {
    setActionMessage('');
    try {
      const availability = await API.getAvailability();
      const sizeNeeded = { 'S': 0, 'M': 0, 'L': 0 };
      order.sandwiches.forEach(s => { sizeNeeded[s.size] += s.quantity; });
      
      for (const sz of ['S', 'M', 'L']) {
        if (sizeNeeded[sz] > availability[sz]) {
          setActionMessage('Cannot duplicate: not enough ' + sz + ' sandwiches available. Available: ' + availability[sz] + ', needed: ' + sizeNeeded[sz]);
          setActionVariant('warning');
          return;
        }
      }
      
      const sandwiches = order.sandwiches.map(s => ({
        size: s.size,
        mainIngredient: s.mainIngredient,
        breadType: s.breadType,
        ingredients: [...s.ingredients],
        dressings: [...s.dressings],
        quantity: s.quantity,
        unitPrice: s.unitPrice
      }));
      navigate('/configurator', { state: { sandwiches: sandwiches } });
    } catch (err) {
      setActionMessage('Error checking availability.');
      setActionVariant('danger');
      console.log(err);
    }
  };

  const handleDelete = async (orderId) => {
    setActionMessage('');
    try {
      const result = await API.deleteOrder(orderId);
      props.setUser(prev => ({ ...prev, credit: result.credit }));
      setActionMessage('Order deleted. Refunded: ' + result.refund.toFixed(2) + '€');
      setActionVariant('success');
      loadOrders();
    } catch (err) {
      if (err.error) {
        setActionMessage(err.error);
      } else {
        setActionMessage('Error deleting order.');
      }
      setActionVariant('danger');
      console.log(err);
    }
  };

  if (waiting) return <div className="text-center my-5"><Spinner animation="border" variant="success" /></div>;

  return (
    <>
      <h1 className="my-3"><i className="bi bi-bag-check"></i> My Orders</h1>

      {actionMessage ? <Alert variant={actionVariant} onClose={() => setActionMessage('')} dismissible>{actionMessage}</Alert> : null}

      {orders.length === 0 ? (
        <Alert variant="info">You have no confirmed orders yet.</Alert>
      ) : (
        <div className="order-accordion">
          {orders.map((order, index) => {
            const totalQty = order.sandwiches.reduce((sum, s) => sum + s.quantity, 0);
            const hasDiscount = totalQty >= 4;
            return (
              <div key={order.id} className="border rounded mb-3 overflow-hidden">
                <div className="bg-light p-3 border-bottom d-flex justify-content-between align-items-center"><div>
                  <span className="me-3"><strong>Order #{order.id}</strong></span>
                  <span className="badge bg-success me-2">{totalQty} sandwich{totalQty !== 1 ? 'es' : ''}</span>
                  {hasDiscount && <span className="badge bg-danger me-2">20% off</span>}
                  <span className="price-tag me-3">{order.totalPrice.toFixed(2)}€</span>
                </div></div>
                <div className="p-3">
                  <Table striped bordered size="sm">
                    <thead>
                      <tr>
                        <th>Size</th>
                        <th>Main</th>
                        <th>Bread</th>
                        <th>Ingredients</th>
                        <th>Dressings</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.sandwiches.map((s, sIndex) => (
                        <tr key={sIndex}>
                          <td><span className="badge bg-secondary">{s.size}</span></td>
                          <td>{s.mainIngredient}</td>
                          <td>{s.breadType}</td>
                          <td><small>{s.ingredients.join(', ') || '-'}</small></td>
                          <td><small>{s.dressings.join(', ') || '-'}</small></td>
                          <td>{s.quantity}</td>
                          <td>{s.unitPrice.toFixed(2)}€</td>
                          <td className="price-tag">{(s.unitPrice * s.quantity).toFixed(2)}€</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <div className="d-flex justify-content-end gap-2">
                    <Button variant="outline-primary" onClick={() => handleDuplicate(order)}>
                      <i className="bi bi-copy"></i> Duplicate
                    </Button>
                    {props.loggedInTotp && (
                      <Button variant="outline-danger" onClick={() => handleDelete(order.id)}>
                        <i className="bi bi-trash"></i> Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default OrderList;
