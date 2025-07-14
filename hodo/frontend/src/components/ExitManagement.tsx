import React, { useState, useEffect, useRef, type ForwardedRef } from 'react';
import '../styles/exit.css';
import ButtonWithGradient from './ButtonWithGradient';
import type { FC } from 'react';
import Pagination from './Pagination';
import Table from './Table';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


interface Body {
  id: string;
  name: string;
  storageUnit: string;
  status: string;
}

interface ExitRecord extends Body {
  receiverName: string;
  receiverId: string;
  relationship: string;
  releaseTime: string;
  remarks: string;
  exitTime: string;
  witnessingStaff?: string;
  receiverType?: string;
  receiverIdProof?: string;
}

const ExitManagement: React.FC = () => {
  const [selectedBody, setSelectedBody] = useState('');
  const [bodies, setBodies] = useState<Body[]>([]);
  const [recentExits, setRecentExits] = useState<ExitRecord[]>([]);
  const [exitForm, setExitForm] = useState({
    receiverName: '',
    receiverId: '',
    relationship: '',
    releaseTime: '',
    remarks: '',
    witnessingStaff: '',
    receiverType: '',
    receiverIdProof: ''
  });
  const printRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [exitsPage, setExitsPage] = useState(1);
  const [exitsRowsPerPage, setExitsRowsPerPage] = useState(5);

  // Move fetch functions outside useEffect for reuse
  const fetchAllBodies = async () => {
    try {
      const response = await fetch('http://192.168.50.132:3001/api/bodies');
      const allBodies: Body[] = await response.json();
      setBodies(allBodies);
    } catch (error) {
      toast.error('Failed to fetch bodies.');
    }
  };
  const fetchRecentExits = async () => {
    try {
      const response = await fetch('http://192.168.50.132:3001/api/exits');
      const data: ExitRecord[] = await response.json();
      setRecentExits(data.sort((a, b) => new Date(b.exitTime).getTime() - new Date(a.exitTime).getTime()));
    } catch (error) {
      toast.error('Failed to fetch recent exits.');
    }
  };

  useEffect(() => {
    fetchAllBodies();
    fetchRecentExits();
  }, []);

  const handleBodySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBody(e.target.value);
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setExitForm(prev => ({
      ...prev,
      releaseTime: now.toISOString().slice(0, 16)
    }));
  };

  const handleExitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBody) {
      toast.error('Please select a body to process exit.');
      return;
    }
    const body = bodies.find(b => b.id === selectedBody);
    if (body && body.status !== 'verified') {
      toast.error('Please verify the body before processing exit.');
      return;
    }
    // Confirmation before releasing
    if (!window.confirm('Are you sure you want to release this body? This action cannot be undone.')) {
      return;
    }
    try {
              const response = await fetch(`http://192.168.50.132:3001/api/exits/${selectedBody}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exitForm),
      });

      if (!response.ok) {
        throw new Error('Failed to release body');
      }
      
      const newExit: ExitRecord = await response.json();
      
      toast.success('Body released successfully!');
      
      // Refetch the list of bodies and recent exits from backend
      await fetchAllBodies();
      await fetchRecentExits();
      setSelectedBody('');
      setExitForm({
        receiverName: '',
        receiverId: '',
        relationship: '',
        releaseTime: '',
        remarks: '',
        witnessingStaff: '',
        receiverType: '',
        receiverIdProof: ''
      });

    } catch (error) {
      toast.error('Failed to release body. Please try again.');
    }
  };

  const handleVerify = async () => {
    if (!selectedBody) return;
    // Confirmation before verifying
    if (!window.confirm('Are you sure you want to verify this body?')) {
      return;
    }
    try {
              const response = await fetch(`http://192.168.50.132:3001/api/bodies/${selectedBody}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifiedBy: 'Staff' }),
      });
      if (!response.ok) throw new Error('Failed to verify body');
      toast.success('Body verified successfully!');
      await fetchAllBodies();
    } catch (error) {
      toast.error('Failed to verify body.');
    }
  };

  const selectedBodyData = bodies.find(body => body.id === selectedBody);

  // Add a ReleaseForm component for printing
  const ReleaseForm = React.forwardRef<HTMLDivElement, { exit: ExitRecord }>(
    ({ exit }, ref: ForwardedRef<HTMLDivElement>) => (
      <div ref={ref} style={{ padding: 24, fontFamily: 'serif', background: '#fff', color: '#000', width: 600 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Body Release Form</h2>
        <table style={{ width: '100%', marginBottom: 16 }}>
          <tbody>
            <tr><td><b>Deceased Name:</b></td><td>{exit.name}</td></tr>
            <tr><td><b>Body ID:</b></td><td>{exit.id}</td></tr>
            <tr><td><b>Storage Unit:</b></td><td>{exit.storageUnit}</td></tr>
            <tr><td><b>Date/Time of Release:</b></td><td>{exit.releaseTime}</td></tr>
            <tr><td><b>Receiver Name:</b></td><td>{exit.receiverName}</td></tr>
            <tr><td><b>Receiver ID:</b></td><td>{exit.receiverId}</td></tr>
            <tr><td><b>Relationship:</b></td><td>{exit.relationship}</td></tr>
            <tr><td><b>Witnessing Staff:</b></td><td>{exit.witnessingStaff || ''}</td></tr>
            <tr><td><b>ID Proof of Receiver:</b></td><td>{exit.receiverIdProof || ''}</td></tr>
            <tr><td><b>Remarks:</b></td><td>{exit.remarks}</td></tr>
          </tbody>
        </table>
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div>__________________________</div>
            <div>Receiver Signature</div>
          </div>
          <div>
            <div>__________________________</div>
            <div>Witnessing Staff Signature</div>
          </div>
        </div>
      </div>
    )
  );

  function handlePrintReleaseForm(exit: ExitRecord) {
    const printContent = `
      <html>
        <head>
          <title>Body Release Form</title>
          <style>
            body { font-family: serif; padding: 24px; }
            h2 { text-align: center; margin-bottom: 24px; }
            table { width: 100%; margin-bottom: 16px; }
            td { padding: 4px 8px; }
            .signatures { margin-top: 32px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <h2>Body Release Form</h2>
          <table>
            <tr><td><b>Deceased Name:</b></td><td>${exit.name}</td></tr>
            <tr><td><b>Body ID:</b></td><td>${exit.id}</td></tr>
            <tr><td><b>Storage Unit:</b></td><td>${exit.storageUnit}</td></tr>
            <tr><td><b>Date/Time of Release:</b></td><td>${exit.releaseTime}</td></tr>
            <tr><td><b>Receiver Name:</b></td><td>${exit.receiverName}</td></tr>
            <tr><td><b>Receiver ID:</b></td><td>${exit.receiverId}</td></tr>
            <tr><td><b>Relationship:</b></td><td>${exit.relationship}</td></tr>
            <tr><td><b>Witnessing Staff:</b></td><td>${exit.witnessingStaff || ''}</td></tr>
            <tr><td><b>ID Proof of Receiver:</b></td><td>${exit.receiverIdProof || ''}</td></tr>
            <tr><td><b>Remarks:</b></td><td>${exit.remarks}</td></tr>
          </table>
          <div class="signatures">
            <div>
              <div>__________________________</div>
              <div>Receiver Signature</div>
            </div>
            <div>
              <div>__________________________</div>
              <div>Witnessing Staff Signature</div>
            </div>
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }

  const totalExitsPages = Math.ceil(recentExits.length / exitsRowsPerPage);
  const paginatedExits = recentExits.slice(
    (exitsPage - 1) * exitsRowsPerPage,
    exitsPage * exitsRowsPerPage
  );

  const exitColumns = [
    { key: 'id', header: 'Body ID' },
    { key: 'name', header: 'Name' },
    { key: 'storageUnit', header: 'Storage Unit' },
    { key: 'exitTime', header: 'Exit Time' },
    { key: 'receiverName', header: 'Receiver' },
    { key: 'relationship', header: 'Relationship' },
    { key: 'remarks', header: 'Remarks' }
  ];

  return (
    <div className="exit-container">
      <ToastContainer position="top-right" autoClose={2000} />
     

      <div className="exit-grid">
        <div className="exit-form-card">
          <div className="card-header">
            <h3 className="card-title">Body Release Form</h3>
          </div>
          <div className="card-content">
            <form onSubmit={handleExitSubmit} className="exit-form">
              <div className="form-group">
                <label htmlFor="bodySelect" className="form-label">Select Body</label>
                <select id="bodySelect" className="form-select" value={selectedBody} onChange={handleBodySelect} required>
                  <option value="">Choose body to release</option>
                  {bodies.map((body) => (
                    <option key={body.id} value={body.id}>
                      {body.name} ({body.id}) - {body.storageUnit} [{body.status}]
                    </option>
                  ))}
                </select>
              </div>

              {selectedBodyData && (
                <div className="selected-body-info">
                  <div className="selected-body-main">
                    <div>
                      <p className="selected-body-name">{selectedBodyData.name}</p>
                      <p className="selected-body-unit">Unit: {selectedBodyData.storageUnit}</p>
                    </div>
                    <span className={`status-badge ${selectedBodyData.status === 'verified' ? 'status-verified' : 'status-pending'}`}>{selectedBodyData.status}</span>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="receiverName" className="form-label">Receiver Name</label>
                <input
                  id="receiverName"
                  className="form-input"
                  value={exitForm.receiverName}
                  onChange={(e) => setExitForm(prev => ({ ...prev, receiverName: e.target.value }))}
                  placeholder="Name of person receiving the body"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="receiverId" className="form-label">Receiver ID</label>
                <input
                  id="receiverId"
                  className="form-input"
                  value={exitForm.receiverId}
                  onChange={(e) => setExitForm(prev => ({ ...prev, receiverId: e.target.value }))}
                  placeholder="Government ID number"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="relationship" className="form-label">Relationship</label>
                <select
                  id="relationship"
                  className="form-select"
                  value={exitForm.relationship}
                  onChange={(e) => setExitForm(prev => ({ ...prev, relationship: e.target.value }))}
                  required
                >
                  <option value="">Relationship to deceased</option>
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="child">Child</option>
                  <option value="sibling">Sibling</option>
                  <option value="relative">Other Relative</option>
                  <option value="authority">Authority</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="releaseTime" className="form-label">Release Time</label>
                <input
                  id="releaseTime"
                  type="datetime-local"
                  className="form-input"
                  value={exitForm.releaseTime}
                  onChange={(e) => setExitForm(prev => ({ ...prev, releaseTime: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="remarks" className="form-label">Remarks</label>
                <textarea
                  id="remarks"
                  className="form-textarea"
                  value={exitForm.remarks}
                  onChange={(e) => setExitForm(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Additional notes or remarks"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="witnessingStaff" className="form-label">Witnessing Staff</label>
                <input
                  id="witnessingStaff"
                  className="form-input"
                  value={exitForm.witnessingStaff}
                  onChange={(e) => setExitForm(prev => ({ ...prev, witnessingStaff: e.target.value }))}
                  placeholder="Name of staff witnessing the handover"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="receiverType" className="form-label">Receiver Type</label>
                <select
                  id="receiverType"
                  className="form-select"
                  value={exitForm.receiverType}
                  onChange={(e) => setExitForm(prev => ({ ...prev, receiverType: e.target.value }))}
                  required
                >
                  <option value="">Select receiver type</option>
                  <option value="Family">Family</option>
                  <option value="Police">Police</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="receiverIdProof" className="form-label">ID Proof of Receiver</label>
                <input
                  id="receiverIdProof"
                  className="form-input"
                  value={exitForm.receiverIdProof}
                  onChange={(e) => setExitForm(prev => ({ ...prev, receiverIdProof: e.target.value }))}
                  placeholder="ID proof details (e.g., Aadhaar, DL, etc.)"
                  required
                />
              </div>

              <ButtonWithGradient
                // className='my-new-class'
                text="Process Exit"
                // onClick={() => alert('Hello!')}
                type="submit"
              >

              </ButtonWithGradient>

              {selectedBodyData && selectedBodyData.status !== 'verified' && (
                <div style={{ marginBottom: '1rem' }}>
                  <ButtonWithGradient
                    text="Verify"
                    type="button"
                    onClick={handleVerify}
                  />
                </div>
              )}

              {/* <button type="submit" className="submit-btn">
                Process Exit
              </button> */}
            </form>
          </div>
        </div>
      </div>
      {/* Move table and pagination here, outside of any card */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Recent Exits</h3>
        <Table
          columns={exitColumns}
          data={paginatedExits.map(exit => ({
            ...exit,
            exitTime: new Date(exit.exitTime).toLocaleString()
          }))}
          disableInternalPagination={true}
        />
        <Pagination
          page={exitsPage}
          totalPages={totalExitsPages}
          rowsPerPage={exitsRowsPerPage}
          setPage={setExitsPage}
          setRowsPerPage={setExitsRowsPerPage}
        />
      </div>
    </div>
  );

  // PDF download handler (to be implemented)
  function handleDownloadPDF(exit: ExitRecord) {
    // TODO: Use jsPDF or html2pdf to generate PDF from ReleaseForm
    toast.info('PDF download coming soon!');
  }
};

export default ExitManagement; 