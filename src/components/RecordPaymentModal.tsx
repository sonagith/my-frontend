// src/components/RecordPaymentModal.tsx
import React, { useState } from 'react';
import { recordPaymentAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  caseId: number;
  onSuccess: () => void;
}

export const RecordPaymentModal: React.FC<Props> = ({ isOpen, onClose, caseId, onSuccess }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔴 Form ke saare fields ke liye state maintain karna taaki data cancel karne par bhi na mite
  const [formDataState, setFormDataState] = useState({
    payment_date: new Date().toISOString().slice(0, 10),
    amount: '',
    cheque_no: '',
    cheque_date: '',
    bank_name: '',
    drawn_on: '',
    received_date: new Date().toISOString().slice(0, 10),
    booked_by: 'Anil Kumar Nair',
    remark: '',
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  if (!isOpen) return null;

  // Input change handle karne ke liye
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormDataState(prev => ({ ...prev, [name]: value }));
  };

  // File change handle karne ke liye
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  // Jab user "Save Payment" dabaye
  const handleInitialSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formDataState.amount) {
      toast.error("Please enter amount");
      return;
    }
    setShowConfirm(true); // Sirf confirmation screen open hogi, form data safe rahega
  };

  // Jab user popup mein "Yes, Save Payment" dabaye
  const handleFinalSubmit = async () => {
    setLoading(true);
    const fd = new FormData();
    fd.append('plot_id', String(caseId));
    fd.append('payment_date', formDataState.payment_date);
    fd.append('amount', formDataState.amount);
    fd.append('cheque_no', formDataState.cheque_no);
    if (formDataState.cheque_date) fd.append('cheque_date', formDataState.cheque_date);
    fd.append('bank_name', formDataState.bank_name);
    fd.append('drawn_on', formDataState.drawn_on);
    fd.append('received_date', formDataState.received_date);
    fd.append('booked_by', formDataState.booked_by);
    fd.append('remark', formDataState.remark);
    
    if (receiptFile) {
      fd.append('receipt_image', receiptFile);
    }
    
    const tid = toast.loading("Saving payment...");
    try {
        await recordPaymentAPI(fd);
        toast.success('Payment & Receipt saved successfully!', { id: tid });
        setShowConfirm(false);
        onClose();
        onSuccess(); // Database reload karega
    } catch(err: any) { 
        toast.error(err.message || 'Error uploading payment', { id: tid });
        setShowConfirm(false);
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        
        {showConfirm ? (
          /* Confirmation Screen */
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚠️</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Confirm Payment</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
              Are you sure you want to make a payment of <b style={{ color: '#0f766e' }}>₹{formDataState.amount}</b>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              {/* 🔴 Cancel & Edit dabane par data waisa hi rahega, sirf confirmation hatega */}
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setShowConfirm(false)}
                style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel & Edit
              </button>
              <button 
                type="button" 
                className="btn btn-navy" 
                disabled={loading}
                onClick={handleFinalSubmit}
                style={{ padding: '8px 16px', background: '#0f766e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                {loading ? 'Saving...' : 'Yes, Save Payment'}
              </button>
            </div>
          </div>
        ) : (
          /* Normal Payment Form with controlled values */
          <>
            <h2>Record Payment</h2>
            <div className="m-sub">Case ID: {caseId}</div>
            
            <form onSubmit={handleInitialSubmit}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
                
                <div className="field">
                  <label>Payment Date *</label>
                  <input name="payment_date" required type="date" value={formDataState.payment_date} onChange={handleChange} />
                </div>
                
                <div className="field">
                  <label>Amount (₹) *</label>
                  <input name="amount" required type="number" placeholder="Enter amount" value={formDataState.amount} onChange={handleChange} />
                </div>
                
                <div className="field">
                  <label>Cheque / Ref No</label>
                  <input name="cheque_no" placeholder="e.g. 552022 or UPI ref" value={formDataState.cheque_no} onChange={handleChange} />
                </div>
                
                <div className="field">
                  <label>Cheque Date</label>
                  <input name="cheque_date" type="date" value={formDataState.cheque_date} onChange={handleChange} />
                </div>
                
                <div className="field">
                  <label>Bank Name</label>
                  <input name="bank_name" placeholder="e.g. HDFC Bank" value={formDataState.bank_name} onChange={handleChange} />
                </div>
                
                <div className="field">
                  <label>Drawn On (Branch)</label>
                  <input name="drawn_on" placeholder="e.g. HDFC Bank, MG Road" value={formDataState.drawn_on} onChange={handleChange} />
                </div>
                
                <div className="field">
                  <label>Received Date *</label>
                  <input name="received_date" required type="date" value={formDataState.received_date} onChange={handleChange} />
                </div>
                
                <div className="field">
                  <label>Booked By</label>
                  <select name="booked_by" value={formDataState.booked_by} onChange={handleChange}>
                    <option>Anil Kumar Nair</option>
                    <option>Priya Subramaniam</option>
                    <option>Deepak Menon</option>
                  </select>
                </div>
                
                <div className="field full" style={{ gridColumn: '1 / -1' }}>
                  <label>Upload Receipt / Cheque Image</label>
                  <input type="file" name="receipt_image" accept="image/*" onChange={handleFileChange} style={{ padding: '8px' }} />
                </div>
                
                <div className="field full" style={{ gridColumn: '1 / -1' }}>
                  <label>Remark</label>
                  <input name="remark" placeholder="e.g. Installment 3" value={formDataState.remark} onChange={handleChange} />
                </div>

              </div>
              
              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-navy">Save Payment</button>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
};