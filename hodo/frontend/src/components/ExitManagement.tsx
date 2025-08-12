import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/exit.css';
import ButtonWithGradient from './ButtonWithGradient';
import Pagination from './Pagination';
import Table from './Table';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  exitBodiesAPI,
  exitTypesAPI,
  exitStatusesAPI,
  authorizationLevelsAPI,
  storageAPI,
  bodiesAPI
} from '../services/api';
import type {
  ExitBody,
  ExitType,
  ExitStatus,
  AuthorizationLevel,
  CreateExitBodyData,
  ActiveStorageAllocation
} from '../types/exit';

const ExitManagement: React.FC = () => {
  // State for exit records
  const [exitBodies, setExitBodies] = useState<ExitBody[]>([]);
  const [selectedBody, setSelectedBody] = useState('');

  // State for lookup data
  const [exitTypes, setExitTypes] = useState<ExitType[]>([]);
  const [exitStatuses, setExitStatuses] = useState<ExitStatus[]>([]);
  const [authorizationLevels, setAuthorizationLevels] = useState<AuthorizationLevel[]>([]);
  const [activeAllocations, setActiveAllocations] = useState<ActiveStorageAllocation[]>([]);

  // Form state
  const [exitForm, setExitForm] = useState<CreateExitBodyData>({
    EB_Body_Details_FK: 0,
    EB_Exit_Type_FK: 0,
    EB_Exit_Status_FK: 0,
    EB_Exit_Date: '',
    EB_Exit_Time: '',
    EB_Expected_Exit_Date: '',
    EB_Actual_Exit_Date: '',
    EB_Exit_Reason: '',
    EB_Medical_Clearance_Obtained: false,
    EB_Police_Clearance_Obtained: false,
    EB_Administrative_Clearance_Obtained: false,
    EB_Financial_Clearance_Obtained: false,
    EB_All_Documents_Complete: false,
    EB_Exit_Authorized_By: '',
    EB_Exit_Authorization_Level_FK: 0,
    EB_Exit_Authorization_Date: '',
    EB_Exit_Processed_By: '',
    EB_Exit_Notes: '',
    EB_Added_by: 'System',
    EB_Provider_fk: 1,
    EB_Outlet_fk: 1
  });

  // UI state
  const [exitsPage, setExitsPage] = useState(1);
  const [exitsRowsPerPage, setExitsRowsPerPage] = useState(5);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Fetch all lookup data
  const fetchLookupData = async () => {
    try {
      const [
        exitTypesData,
        exitStatusesData,
        authorizationLevelsData
      ] = await Promise.all([
        exitTypesAPI.getAll(),
        exitStatusesAPI.getAll(),
        authorizationLevelsAPI.getAll()
      ]);

      setExitTypes(exitTypesData);
      setExitStatuses(exitStatusesData);
      setAuthorizationLevels(authorizationLevelsData);
    } catch (error) {
      toast.error('Failed to fetch lookup data.');
      console.error('Error fetching lookup data:', error);
    }
  };

  // Fetch exit bodies
  const fetchExitBodies = async () => {
    try {
      const exitBodiesData = await exitBodiesAPI.getAll();
      setExitBodies(exitBodiesData);
    } catch (error) {
      toast.error('Failed to fetch exit records.');
      console.error('Error fetching exit bodies:', error);
    }
  };

  // Fetch active storage allocations instead of all bodies
  const fetchActiveAllocations = async () => {
    try {
      const data = await storageAPI.getActiveBodies();
      console.log('Fetched active allocations:', data); // Debug log
      setActiveAllocations(data);

      // If we had a selected body, update its data
      if (selectedBody) {
        const updatedBody = data.find(a => a.storageAllocationId.toString() === selectedBody);
        if (updatedBody) {
          setSelectedBodyData(updatedBody);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch active storage allocations.');
      console.error('Error fetching active allocations: ', error);
    }
  };

  // Create a function to refresh active allocations
  const refreshActiveAllocations = async () => {
    console.log('Refreshing active allocations...');
    await fetchActiveAllocations();
  };

  // Set up event listener for body verification updates
  useEffect(() => {
    const handleBodyVerified = (event: Event) => {
      const customEvent = event as CustomEvent<{ bodyId: string }>;
      console.log('Body verified event received:', customEvent.detail);
      // Refresh the active allocations to get the updated verification status
      refreshActiveAllocations();
    };

    // Add event listener
    window.addEventListener('bodyVerified', handleBodyVerified as EventListener);

    // Initial data fetch
    fetchLookupData();
    fetchActiveAllocations();
    fetchExitBodies();

    // Check for any verification updates in localStorage
    const checkForVerificationUpdates = () => {
      const now = new Date();
      let needsRefresh = false;

      // Check if any verifications happened in the last 5 minutes
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('bodyVerified_')) {
          const timestamp = localStorage.getItem(key);
          if (timestamp) {
            const verificationTime = new Date(timestamp);
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

            if (verificationTime > fiveMinutesAgo) {
              needsRefresh = true;
              break;
            }
          }
        }
      }

      if (needsRefresh) {
        console.log('Recent verification detected, refreshing active allocations...');
        refreshActiveAllocations();
      }
    };

    // Check for updates on mount
    checkForVerificationUpdates();

    // Set up interval to check for updates every 30 seconds
    const intervalId = setInterval(checkForVerificationUpdates, 30000);

    // Cleanup function
    return () => {
      window.removeEventListener('bodyVerified', handleBodyVerified as EventListener);
      clearInterval(intervalId);
    };
  }, []);

  // In the dropdown, use activeAllocations instead of bodies
  // Example:
  // <select value={selectedBody} onChange={handleBodySelect}>
  //   <option value="">Select Body</option>
  //   {activeAllocations.map(a => (
  //     <option key={a.storageAllocationId} value={a.storageAllocationId}>
  //       {a.bodyName} (ID: {a.bodyId})
  //     </option>
  //   ))}
  // </select>
  // ... existing code ...
  // When handling selection, update logic to use allocation info
  const handleBodySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const allocationId = e.target.value;
    setSelectedBody(allocationId);
    const allocation = activeAllocations.find(a => String(a.storageAllocationId) === allocationId);
    if (allocation) {
      const now = new Date();
      const exitDate = now.toISOString().split('T')[0];
      const exitTime = now.toTimeString().split(' ')[0];
      setExitForm(prev => ({
        ...prev,
        EB_Body_Details_FK: allocation.bodyId,
        EB_Storage_Allocation_FK: allocation.storageAllocationId,
        EB_Exit_Date: exitDate,
        EB_Exit_Time: exitTime,
        EB_Expected_Exit_Date: exitDate,
        EB_Actual_Exit_Date: exitDate
      }));
    }
  };

  const handleExitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBody) {
      toast.error('Please select a body to process exit.');
      return;
    }

    // Verify that the selected body is verified
    if (selectedBodyData && selectedBodyData.verificationStatus !== 'Verified') {
      toast.error('Only verified bodies can be released. Please verify the body first.');
      return;
    }



    if (!window.confirm('Are you sure you want to create an exit record for this body?')) {
      return;
    }

    setLoading(true);
    try {
      await exitBodiesAPI.create(exitForm);

      toast.success('Exit record created successfully!');

      // Reset form
      setSelectedBody('');
      setExitForm({
        EB_Body_Details_FK: 0,
        EB_Exit_Type_FK: 0,
        EB_Exit_Status_FK: 0,
        EB_Exit_Date: '',
        EB_Exit_Time: '',
        EB_Expected_Exit_Date: '',
        EB_Actual_Exit_Date: '',
        EB_Exit_Reason: '',
        EB_Medical_Clearance_Obtained: false,
        EB_Police_Clearance_Obtained: false,
        EB_Administrative_Clearance_Obtained: false,
        EB_Financial_Clearance_Obtained: false,
        EB_All_Documents_Complete: false,
        EB_Exit_Authorized_By: '',
        EB_Exit_Authorization_Level_FK: 0,
        EB_Exit_Authorization_Date: '',
        EB_Exit_Processed_By: '',
        EB_Exit_Notes: '',
        EB_Added_by: '',
        EB_Provider_fk: 1,
        EB_Outlet_fk: 1
      });

      // Refresh data
      await Promise.all([
        fetchExitBodies(),
        fetchActiveAllocations()  // Refresh active allocations to update the storage list
      ]);

    } catch (error) {
      toast.error('Failed to create exit record. Please try again.');
      console.error('Error creating exit record:', error);
    } finally {
      setLoading(false);
    }
  };



  const selectedBodyData = activeAllocations.find(a => String(a.storageAllocationId) === selectedBody);

  // Filter exit bodies based on date range and status
  const filteredExitBodies = exitBodies.filter(exit => {
    let dateMatch = true;

    if (exit.EB_Exit_Date) {
      const exitDate = new Date(exit.EB_Exit_Date);
      // Reset time to start of day for proper date comparison
      exitDate.setHours(0, 0, 0, 0);

      if (startDate && endDate) {
        // Both dates selected - check if exit date is within range (inclusive)
        const fromDate = new Date(startDate);
        const toDate = new Date(endDate);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999); // End of day for "to date"

        dateMatch = exitDate >= fromDate && exitDate <= toDate;
      } else if (startDate) {
        // Only from date selected - show records from this date onwards
        const fromDate = new Date(startDate);
        fromDate.setHours(0, 0, 0, 0);
        dateMatch = exitDate >= fromDate;
      } else if (endDate) {
        // Only to date selected - show records up to this date
        const toDate = new Date(endDate);
        toDate.setHours(23, 59, 59, 999);
        dateMatch = exitDate <= toDate;
      }
      // If no dates selected, show all records (dateMatch remains true)
    } else if (startDate || endDate) {
      // If date filters are set but record has no exit date, exclude it
      dateMatch = false;
    }

    const statusMatch = statusFilter === 'all' ||
      (exit.ExitStatusName && exit.ExitStatusName.toLowerCase() === statusFilter.toLowerCase());

    return dateMatch && statusMatch;
  });

  const totalExitsPages = Math.ceil(filteredExitBodies.length / exitsRowsPerPage);
  const paginatedExitBodies = filteredExitBodies.slice(
    (exitsPage - 1) * exitsRowsPerPage,
    exitsPage * exitsRowsPerPage
  );

  const exitColumns = [
    { key: 'EB_Id_pk', header: 'Exit ID' },
    { key: 'BodyName', header: 'Body Name' },
    { key: 'ExitTypeName', header: 'Exit Type' },
    { key: 'ExitStatusName', header: 'Status' },
    { key: 'EB_Exit_Date', header: 'Exit Date' },
    { key: 'EB_Exit_Time', header: 'Exit Time' },
    { key: 'EB_Exit_Reason', header: 'Reason' },
    { key: 'EB_Exit_Processed_By', header: 'Processed By' }
  ];

  return (
    <div className="exit-container">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="exit-grid">
        <div className="exit-form-card">
          <div className="card-header">
            <h3 className="card-title">Create Exit Record</h3>
          </div>
          <div className="card-content">
            <form onSubmit={handleExitSubmit} className="exit-form">
              <div className="form-group">
                <label htmlFor="bodySelect" className="form-label">Select Body</label>
                <select
                  id="bodySelect"
                  className="form-select"
                  value={selectedBody}
                  onChange={handleBodySelect}
                  required
                >
                  <option value="">Choose body to create exit record</option>
                  {activeAllocations
                    .filter(a => {
                      // Skip if no body ID
                      if (!a.bodyId) return false;

                      // Debug log
                      console.log('Checking allocation:', {
                        allocationId: a.storageAllocationId,
                        bodyId: a.bodyId,
                        statusFlag: a.statusFlag,
                        verificationStatus: a.verificationStatus,
                        hasExitRecord: exitBodies.some(eb => eb.EB_Body_Details_FK === a.bodyId)
                      });

                      // Check if body already has an exit record
                      const hasExitRecord = exitBodies.some(eb => eb.EB_Body_Details_FK === a.bodyId);
                      if (hasExitRecord) {
                        console.log(`Skipping body ${a.bodyId} - already has exit record`);
                        return false;
                      }

                      // Check status flag (accept '10', 10, or 'Active')
                      const validStatus = (
                        a.statusFlag === '10' ||
                        a.statusFlag === 10 ||
                        String(a.statusFlag).toLowerCase() === 'active'
                      );

                      if (!validStatus) {
                        console.log(`Skipping body ${a.bodyId} - invalid status flag:`, a.statusFlag);
                        return false;
                      }

                      // Check verification status (only accept verified bodies)
                      const normalizedVerification = String(a.verificationStatus || '').toLowerCase().trim();
                      const isVerified = [
                        'verified', '1', 'true', 'yes'
                      ].includes(normalizedVerification);

                      if (!isVerified) {
                        console.log(`Skipping body ${a.bodyId} - not verified. Status:`, a.verificationStatus);
                        return false;
                      }

                      return true;
                    })
                    .map((a) => (
                      <option key={a.storageAllocationId} value={a.storageAllocationId.toString()}>
                        {a.bodyName} (ID: {a.bodyId}) - Unit: {a.storageUnitId} - {a.verificationStatus}
                      </option>
                    ))}
                </select>
              </div>

              {activeAllocations.filter(a => {
                if (!a.bodyId) return false;
                const hasExitRecord = exitBodies.some(eb => eb.EB_Body_Details_FK === a.bodyId);
                if (hasExitRecord) return false;
                const validStatus = (
                  a.statusFlag === '10' ||
                  a.statusFlag === 10 ||
                  String(a.statusFlag).toLowerCase() === 'active'
                );
                if (!validStatus) return false;
                const normalizedVerification = String(a.verificationStatus || '').toLowerCase().trim();
                const isVerified = ['verified', '1', 'true', 'yes'].includes(normalizedVerification);
                return isVerified;
              }).length === 0 && (
                  <div className="info-message">
                    <p className="info-text">
                       No bodies available for exit. Only verified bodies can be released.
                    </p>
                  </div>
                )}

              {selectedBodyData && (
                <div className="selected-body-info">
                  <div className="selected-body-main">
                    <div>
                      <p className="selected-body-name">{selectedBodyData.bodyName}</p>
                      <p className="selected-body-unit">Unit: {selectedBodyData.storageUnitId}</p>
                    </div>
                    <span className={`status-badge ${selectedBodyData.verificationStatus === 'Verified' ? 'status-verified' : 'status-pending'}`}>
                      {selectedBodyData.verificationStatus}
                    </span>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="exitType" className="form-label">Exit Type</label>
                <select
                  id="exitType"
                  className="form-select"
                  value={exitForm.EB_Exit_Type_FK}
                  onChange={(e) => setExitForm(prev => ({ ...prev, EB_Exit_Type_FK: parseInt(e.target.value) }))}
                  required
                >
                  <option value={0}>Select exit type</option>
                  {exitTypes.map(type => (
                    <option key={type.ETL_Id_pk} value={type.ETL_Id_pk}>
                      {type.ETL_Type_Name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="exitStatus" className="form-label">Exit Status</label>
                <select
                  id="exitStatus"
                  className="form-select"
                  value={exitForm.EB_Exit_Status_FK}
                  onChange={(e) => setExitForm(prev => ({ ...prev, EB_Exit_Status_FK: parseInt(e.target.value) }))}
                  required
                >
                  <option value={0}>Select exit status</option>
                  {exitStatuses.map(status => (
                    <option key={status.ESL_Id_pk} value={status.ESL_Id_pk}>
                      {status.ESL_Status_Name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="exitDate" className="form-label">Exit Date</label>
                <input
                  id="exitDate"
                  type="date"
                  className="form-input"
                  value={exitForm.EB_Exit_Date}
                  onChange={(e) => setExitForm(prev => ({ ...prev, EB_Exit_Date: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="exitTime" className="form-label">Exit Time</label>
                <input
                  id="exitTime"
                  type="time"
                  className="form-input"
                  value={exitForm.EB_Exit_Time}
                  onChange={(e) => setExitForm(prev => ({ ...prev, EB_Exit_Time: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="exitReason" className="form-label">Exit Reason</label>
                <textarea
                  id="exitReason"
                  className="form-textarea"
                  value={exitForm.EB_Exit_Reason}
                  onChange={(e) => setExitForm(prev => ({ ...prev, EB_Exit_Reason: e.target.value }))}
                  placeholder="Reason for exit"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="exitNotes" className="form-label">Notes</label>
                <textarea
                  id="exitNotes"
                  className="form-textarea"
                  value={exitForm.EB_Exit_Notes}
                  onChange={(e) => setExitForm(prev => ({ ...prev, EB_Exit_Notes: e.target.value }))}
                  placeholder="Additional notes"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="processedBy" className="form-label">Processed By</label>
                <input
                  id="processedBy"
                  className="form-input"
                  value={exitForm.EB_Exit_Processed_By}
                  onChange={(e) => setExitForm(prev => ({ ...prev, EB_Exit_Processed_By: e.target.value }))}
                  placeholder="Name of staff processing the exit"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="authorizedBy" className="form-label">Authorized By</label>
                <input
                  id="authorizedBy"
                  className="form-input"
                  value={exitForm.EB_Exit_Authorized_By}
                  onChange={(e) => setExitForm(prev => ({ ...prev, EB_Exit_Authorized_By: e.target.value }))}
                  placeholder="Name of person authorizing the exit"
                />
              </div>

              <div className="form-group">
                <label htmlFor="authorizationLevel" className="form-label">Authorization Level</label>
                <select
                  id="authorizationLevel"
                  className="form-select"
                  value={exitForm.EB_Exit_Authorization_Level_FK}
                  onChange={(e) => setExitForm(prev => ({ ...prev, EB_Exit_Authorization_Level_FK: parseInt(e.target.value) }))}
                >
                  <option value={0}>Select authorization level</option>
                  {authorizationLevels.map(level => (
                    <option key={level.EAL_Id_pk} value={level.EAL_Id_pk}>
                      {level.EAL_Level_Name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="authorizationDate" className="form-label">Authorization Date</label>
                <input
                  id="authorizationDate"
                  type="datetime-local"
                  className="form-input"
                  value={exitForm.EB_Exit_Authorization_Date}
                  onChange={(e) => setExitForm(prev => ({ ...prev, EB_Exit_Authorization_Date: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Clearances</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={exitForm.EB_Medical_Clearance_Obtained}
                      onChange={(e) => setExitForm(prev => ({ ...prev, EB_Medical_Clearance_Obtained: e.target.checked }))}
                    />
                    Medical Clearance
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={exitForm.EB_Police_Clearance_Obtained}
                      onChange={(e) => setExitForm(prev => ({ ...prev, EB_Police_Clearance_Obtained: e.target.checked }))}
                    />
                    Police Clearance
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={exitForm.EB_Administrative_Clearance_Obtained}
                      onChange={(e) => setExitForm(prev => ({ ...prev, EB_Administrative_Clearance_Obtained: e.target.checked }))}
                    />
                    Administrative Clearance
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={exitForm.EB_Financial_Clearance_Obtained}
                      onChange={(e) => setExitForm(prev => ({ ...prev, EB_Financial_Clearance_Obtained: e.target.checked }))}
                    />
                    Financial Clearance
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={exitForm.EB_All_Documents_Complete}
                      onChange={(e) => setExitForm(prev => ({ ...prev, EB_All_Documents_Complete: e.target.checked }))}
                    />
                    All Documents Complete
                  </label>
                </div>
              </div>

              <ButtonWithGradient
                text={loading ? "Creating..." : "Create Exit Record"}
                type="submit"
                disabled={loading}
              />


            </form>
          </div>
        </div>
      </div>

      {/* Exit Records Table */}
      <div style={{ marginTop: '2rem' }}>
        <div className="header">Exit Records</div>

        <div className="filter-container">
          <div className="left-filters">
            <div className="filter-group">
              <label className="filter-label">From Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="dd-mm-yyyy"
                className="filter-input"
                dateFormat="dd-MM-yyyy"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">To Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate || undefined}
                placeholderText="dd-mm-yyyy"
                className="filter-input"
                dateFormat="dd-MM-yyyy"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Status</label>
              <select
                className="filter-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                {exitStatuses.map(status => (
                  <option key={status.ESL_Id_pk} value={status.ESL_Status_Name.toLowerCase()}>
                    {status.ESL_Status_Name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <Table
          columns={exitColumns}
          data={paginatedExitBodies.map(exit => ({
            ...exit,
            EB_Exit_Date: exit.EB_Exit_Date ? new Date(exit.EB_Exit_Date).toLocaleDateString() : '',
          }))}
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
};

export default ExitManagement; 