import React, { useState } from 'react';
import '../styles/bodies.css';

const initialBills = [
  {
    id: 1,
    bodyId: 'B002',
    name: 'Jane Smith',
    service: 'Storage',
    amount: 500,
    date: '2024-07-01',
    notes: 'Paid in full',
  },
];

const BillingPage: React.FC = () => {
  const [bills, setBills] = useState(initialBills);
  const [form, setForm] = useState({
    bodyId: '',
    name: '',
    service: '',
    amount: '',
    date: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBills([
      ...bills,
      {
        id: bills.length + 1,
        ...form,
        amount: Number(form.amount),
      },
    ]);
    setForm({ bodyId: '', name: '', service: '', amount: '', date: '', notes: '' });
  };

  return (
    <div className="bodies-container">
      <div className="bodies-card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="card-header">
          <div className="card-header-content">
            <h3 className="card-title">Billing</h3>
          </div>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label className="form-label">Body ID</label>
              <input
                className="form-input"
                name="bodyId"
                value={form.bodyId}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="form-label">Name</label>
              <input
                className="form-input"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="form-label">Service</label>
              <input
                className="form-input"
                name="service"
                value={form.service}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="form-label">Amount</label>
              <input
                className="form-input"
                name="amount"
                type="number"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="form-label">Date</label>
              <input
                className="form-input"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                name="notes"
                value={form.notes}
                onChange={handleChange}
              />
            </div>
            <button className="register-btn" type="submit">Add Bill</button>
          </form>
        </div>
      </div>

      <div className="bodies-card" style={{ maxWidth: 900, margin: '2rem auto 0' }}>
        <div className="card-header">
          <div className="card-header-content">
            <h3 className="card-title">Past Bills</h3>
          </div>
        </div>
        <div className="card-content">
          <table className="bodies-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Body ID</th>
                <th>Name</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.id}>
                  <td>{bill.id}</td>
                  <td>{bill.bodyId}</td>
                  <td>{bill.name}</td>
                  <td>{bill.service}</td>
                  <td>{bill.amount}</td>
                  <td>{bill.date}</td>
                  <td>{bill.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingPage; 