import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/exit.css';
import ButtonWithGradient from './ButtonWithGradient';
import Pagination from './Pagination';
import Table from './Table';
import ValidatedInput from './ValidatedInput';
import ValidatedSelect from './ValidatedSelect';
import ValidatedTextArea from './ValidatedTextArea';
import ErrorBoundary from './ErrorBoundary';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  exitBodiesAPI, 
  exitTypesAPI, 
  exitStatusesAPI, 
  authorizationLevelsAPI,
  storageAPI
} from '../services/api';
import type { 
  ExitBody, 
  ExitType, 
  ExitStatus, 
  AuthorizationLevel,
  CreateExitBodyData,
  ActiveStorageAllocation
} from '../types/exit';
import { useFormValidation } from '../hooks/useFormValidation';
import { 
  validateName, 
  validateDate, 
  validateTime, 
  validateSelection, 
  validateTextArea,
  validateDateRange,
  preventDuplicateSubmission
} from '../utils/validation';
import { safeAsync, displayError, handleValidationErrors } from '../utils/errorHandling';

const ExitManagementValidated: React.FC = () => {
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
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Form validation configuration
  const validationConfig = {
    EB_Exit_Type_FK: (value: number) => validateSelection(value, 'Exit Type'),
    EB_Exit_Status_FK: (value: number) => validateSelection(value, 'Exit Status'),
    EB_Exit_Date: (value: string) => validateDate(value, 'Exit Date'),
    EB_Exit_Time: (value: string) => validateTime(value, 'Exit Time'),
    EB_Exit_Processed_By: (value: string) => validateName(value),
    EB_Exit_Authorized_By: (value: string) => {
      if (value && value.trim().length > 0) {
        return validateName(value);
      }
      return { isValid: true, errorMessage: '' };
    },
    EB_Exit_Reason: (value: string) => validateTextArea(value, 'Exit Reason', 500),
    EB_Exit_Notes: (value: string) => validateTextArea(value, 'Notes', 1000),
  };

  // Initialize form validation
  const {
    errors,
    isValid,
    isSubmitting,
    validateField,
    validateAllFields,
    clearErrors,
    setSubmitting
  } = useFormValidation(validationConfig, {
    validateOnChange: true,
    validateOnBlur: true,
    showErrorsImmediately: false
  });

  // Fetch all lookup data
  const fetchLookupData = async () => {
    const result = await safeAsync(async () => {
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
    }, 'fetchLookupData');

    if (!result) {
      toast.error('Failed to fetch lookup data.');
    }
  };

  // Fetch exit bodies
  const fetchExitBodies = async () => {
    const result = await safeAsync(async () => {
      const exitBodiesData = await exitBodiesAPI.getAll();
      setExitBodies(exitBodiesData);
    }, 'fetchExitBodies');

    if (!result) {
      toast.error('Failed to fetch exit records.');
    }
  };

  // Fetch active storage allocations
  const fetchActiveAllocations = async () => {
    const result = await safeAsync(async () => {
      const data = await storageAPI.getActiveBodies();
      console.log('Fetched active allocations:', data);
      setActiveAllocations(data);
      
      if (selectedBody) {
        const updatedBody = data.find(a => a.storageAllocationId.toString() === selectedBody);
        if (updatedBody) {
          setSelectedBodyData(updatedBody);
        }
      }
    }, 'fetchActiveAllocations');

    if (!result) {
      toast.error('Failed to fetch active storage allocations.');
    }
  };

  // Set up event listener for body verification updates
  useEffect(() => {
    const handleBodyVerified = (event: Event) => {
      const customEvent = event as CustomEvent<{ bodyId: string }>;
      console.log('Body verified event received:', customEvent.detail);
      refreshActiveAllocations();
    };

    window.addEventListener('bodyVerified', handleBodyVerified as EventListener);

    // Initial data fetch
    fetchLookupData();
    fetchActiveAllocations();
    fetchExitBodies();

    return () => {
      window.removeEventListener('bodyVerified', handleBodyVerified as EventListener);
    };
  }, []);

  // Create a function to refresh active allocations
  const refreshActiveAllocations = async () => {
    console.log('Refreshing active allocations...');
    await fetchActiveAllocations();
  };

  const handleBodySelect = (value: string | number) => {
    const allocationId = String(value);
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
      
      // Clear any previous validation errors
      clearErrors();
    }
  };

  const handleFormChange = (field: keyof CreateExitBodyData, value: any) => {
    setExitForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Validate field if it has a validator
    if (validationConfig[field]) {
      validateField(field, value);
    }
  };

  const handleExitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    const submissionKey = `exit_${selectedBody}_${Date.now()}`;
    if (!preventDuplicateSubmission(submissionKey)) {
      toast.warning('Please wait, your previous submission is still being processed.');
      return;
    }

    if (!selectedBody) {
      toast.error('Please select a body to process exit.');
      return;
    }

    // Verify that the selected body is verified
    if (selectedBodyData && selectedBodyData.verificationStatus !== 'Verified') {
      toast.error('Only verified bodies can be released. Please verify the body first.');
      return;
    }

    // Validate date range
    const dateRangeValidation = validateDateRange(
      exitForm.EB_Exit_Date ? new Date(exitForm.EB_Exit_Date) : null,
      exitForm.EB_Actual_Exit_Date ? new Date(exitForm.EB_Actual_Exit_Date) : null
    );
    
    if (!dateRangeValidation.isValid) {
      toast.error(dateRangeValidation.errorMessage);
      return;
    }

    // Validate all fields
    if (!validateAllFields(exitForm)) {
      handleValidationErrors(errors);
      return;
    }



    if (!window.confirm('Are you sure you want to create an exit record for this body?')) {
      return;
    }

    setSubmitting(true);
    setLoading(true);

    const result = await safeAsync(async () => {
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

      clearErrors();

      // Refresh data
      await Promise.all([
        fetchExitBodies(),
        fetchActiveAllocations()
      ]);
    }, 'handleExitSubmit');

    if (!result) {
      toast.error('Failed to create exit record. Please try again.');
    }

    setSubmitting(false);
    setLoading(false);
  };



  const selectedBodyData = activeAllocations.find(a => String(a.storageAllocationId) === selectedBody);

  // Filter exit bodies based on date range and status
  const filteredExitBodies = exitBodies.filter(exit => {
    let dateMatch = true;
    
    if (exit.EB_Exit_Date) {
      const exitDate = new Date(exit.EB_Exit_Date);
      exitDate.setHours(0, 0, 0, 0);
      
      if (startDate && endDate) {
        const fromDate = new Date(startDate);
        const toDate = new Date(endDate);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        
        dateMatch = exitDate >= fromDate && exitDate <= toDate;
      } else if (startDate) {
        const fromDate = new Date(startDate);
        fromDate.setHours(0, 0, 0, 0);
        dateMatch = exitDate >= fromDate;
      } else if (endDate) {
        const toDate = new Date(endDate);
        toDate.setHours(23, 59, 59, 999);
        dateMatch = exitDate <= toDate;
      }
    } else if (startDate || endDate) {
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

  // Convert exit types to select options
  const exitTypeOptions = exitTypes.map(type => ({
    value: type.ETL_Id_pk,
    label: type.ETL_Type_Name
  }));

  // Convert exit statuses to select options
  const exitStatusOptions = exitStatuses.map(status => ({
    value: status.ESL_Id_pk,
    label: status.ESL_Status_Name
  }));

  // Convert authorization levels to select options
  const authorizationLevelOptions = authorizationLevels.map(level => ({
    value: level.EAL_Id_pk,
    label: level.EAL_Level_Name
  }));

  // Convert active allocations to select options
  const bodyOptions = activeAllocations
    .filter(a => {
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
      const isVerified = [
        'verified', '1', 'true', 'yes'
      ].includes(normalizedVerification);
      
      // Only allow verified bodies to be released
      return isVerified;
    })
    .map(a => ({
      value: a.storageAllocationId,
      label: `${a.bodyName} (ID: ${a.bodyId}) - Unit: ${a.storageUnitId} - ${a.verificationStatus}`
    }));

  return (
    <ErrorBoundary context="ExitManagement">
      <div className="exit-container">
        <ToastContainer position="top-right" autoClose={2000} />

        <div className="exit-grid">
          <div className="exit-form-card">
            <div className="card-header">
              <h3 className="card-title">Create Exit Record</h3>
            </div>
            <div className="card-content">
              <form onSubmit={handleExitSubmit} className="exit-form">
                <ValidatedSelect
                  label="Select Body"
                  value={selectedBody}
                  onChange={handleBodySelect}
                  options={bodyOptions}
                  placeholder="Choose body to create exit record"
                  required
                  error={errors.selectedBody}
                />

                {bodyOptions.length === 0 && (
                  <div className="info-message">
                    <p className="info-text">
                      ℹ️ No bodies available for exit. Only verified bodies can be released.
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

                <ValidatedSelect
                  label="Exit Type"
                  value={exitForm.EB_Exit_Type_FK}
                  onChange={(value) => handleFormChange('EB_Exit_Type_FK', value)}
                  options={exitTypeOptions}
                  placeholder="Select exit type"
                  required
                  error={errors.EB_Exit_Type_FK}
                />

                <ValidatedSelect
                  label="Exit Status"
                  value={exitForm.EB_Exit_Status_FK}
                  onChange={(value) => handleFormChange('EB_Exit_Status_FK', value)}
                  options={exitStatusOptions}
                  placeholder="Select exit status"
                  required
                  error={errors.EB_Exit_Status_FK}
                />

                <ValidatedInput
                  label="Exit Date"
                  type="date"
                  value={exitForm.EB_Exit_Date}
                  onChange={(value) => handleFormChange('EB_Exit_Date', value)}
                  required
                  error={errors.EB_Exit_Date}
                />

                <ValidatedInput
                  label="Exit Time"
                  type="time"
                  value={exitForm.EB_Exit_Time}
                  onChange={(value) => handleFormChange('EB_Exit_Time', value)}
                  required
                  error={errors.EB_Exit_Time}
                />

                <ValidatedTextArea
                  label="Exit Reason"
                  value={exitForm.EB_Exit_Reason}
                  onChange={(value) => handleFormChange('EB_Exit_Reason', value)}
                  placeholder="Reason for exit"
                  rows={3}
                  maxLength={500}
                  showCharacterCount
                  error={errors.EB_Exit_Reason}
                />

                <ValidatedTextArea
                  label="Notes"
                  value={exitForm.EB_Exit_Notes}
                  onChange={(value) => handleFormChange('EB_Exit_Notes', value)}
                  placeholder="Additional notes"
                  rows={3}
                  maxLength={1000}
                  showCharacterCount
                  error={errors.EB_Exit_Notes}
                />

                <ValidatedInput
                  label="Processed By"
                  value={exitForm.EB_Exit_Processed_By}
                  onChange={(value) => handleFormChange('EB_Exit_Processed_By', value)}
                  placeholder="Name of staff processing the exit"
                  required
                  error={errors.EB_Exit_Processed_By}
                />

                <ValidatedInput
                  label="Authorized By"
                  value={exitForm.EB_Exit_Authorized_By}
                  onChange={(value) => handleFormChange('EB_Exit_Authorized_By', value)}
                  placeholder="Name of person authorizing the exit"
                  error={errors.EB_Exit_Authorized_By}
                />

                <ValidatedSelect
                  label="Authorization Level"
                  value={exitForm.EB_Exit_Authorization_Level_FK}
                  onChange={(value) => handleFormChange('EB_Exit_Authorization_Level_FK', value)}
                  options={authorizationLevelOptions}
                  placeholder="Select authorization level"
                  error={errors.EB_Exit_Authorization_Level_FK}
                />

                <ValidatedInput
                  label="Authorization Date"
                  type="datetime-local"
                  value={exitForm.EB_Exit_Authorization_Date}
                  onChange={(value) => handleFormChange('EB_Exit_Authorization_Date', value)}
                  error={errors.EB_Exit_Authorization_Date}
                />

                <div className="form-group">
                  <label className="form-label">Clearances</label>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={exitForm.EB_Medical_Clearance_Obtained}
                        onChange={(e) => handleFormChange('EB_Medical_Clearance_Obtained', e.target.checked)}
                      />
                      Medical Clearance
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={exitForm.EB_Police_Clearance_Obtained}
                        onChange={(e) => handleFormChange('EB_Police_Clearance_Obtained', e.target.checked)}
                      />
                      Police Clearance
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={exitForm.EB_Administrative_Clearance_Obtained}
                        onChange={(e) => handleFormChange('EB_Administrative_Clearance_Obtained', e.target.checked)}
                      />
                      Administrative Clearance
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={exitForm.EB_Financial_Clearance_Obtained}
                        onChange={(e) => handleFormChange('EB_Financial_Clearance_Obtained', e.target.checked)}
                      />
                      Financial Clearance
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={exitForm.EB_All_Documents_Complete}
                        onChange={(e) => handleFormChange('EB_All_Documents_Complete', e.target.checked)}
                      />
                      All Documents Complete
                    </label>
                  </div>
                </div>

                <ButtonWithGradient
                  text={loading ? "Creating..." : "Create Exit Record"}
                  type="submit"
                  disabled={loading || isSubmitting || !isValid}
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
    </ErrorBoundary>
  );
};

export default ExitManagementValidated;