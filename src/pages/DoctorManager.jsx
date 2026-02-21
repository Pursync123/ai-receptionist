import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import { Plus, Trash2, Power, Briefcase, Clock, Calendar, XCircle, ChevronDown, ChevronRight } from 'lucide-react';

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page:        { display: 'flex', gap: 'var(--spacing-lg)', height: 'calc(100vh - 100px)' },
  sidebar:     { width: 300, display: 'flex', flexDirection: 'column', gap: '1rem' },
  main:        { flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' },
  formBox:     { backgroundColor: 'var(--bg-body)', padding: '1rem', borderRadius: 'var(--radius)' },
  formRow:     { display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' },
  inputGroup:  { display: 'flex', flexDirection: 'column', gap: '4px' },
  label:       { fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.7 },
  input:       { padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', fontSize: '0.9rem', backgroundColor: 'white' },
  select:      { padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', fontSize: '0.9rem', backgroundColor: 'white', cursor: 'pointer' },
  sectionHead: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 0', fontWeight: 600, userSelect: 'none' },
  slotGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.75rem' },
  doctorCard:  (active) => ({
    padding: '10px', borderRadius: 'var(--radius)', cursor: 'pointer',
    backgroundColor: active ? 'var(--primary)' : 'transparent',
    color: active ? 'white' : 'inherit',
    border: '1px solid var(--border-color)', transition: 'all .15s',
  }),
  slotCard: (status) => ({
    border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: '0.75rem',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: status === 'available' ? 'white' : status === 'booked' ? '#f0f9ff' : 'var(--bg-body)',
    opacity: status === 'available' ? 1 : 0.6,
  }),
  badge: (status) => ({
    fontSize: '0.7rem', padding: '2px 8px', borderRadius: 12, fontWeight: 600, textTransform: 'uppercase',
    backgroundColor: status === 'available' ? '#dcfce7' : status === 'booked' ? '#dbeafe' : '#fef2f2',
    color: status === 'available' ? '#166534' : status === 'booked' ? '#1e40af' : '#991b1b',
  }),
};

// ── Component ─────────────────────────────────────────────────────────────────
const DoctorManager = () => {
  const [doctors, setDoctors]             = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots]                 = useState([]);
  const [loading, setLoading]             = useState(false);

  // Bulk Create form state
  const [bulkForm, setBulkForm] = useState({ startDate: '', endDate: '', startTime: '09:00', endTime: '17:00' });

  // Cancel form state
  const [cancelForm, setCancelForm] = useState({ date: '', period: 'all' });

  // Collapsed date groups
  const [collapsedDates, setCollapsedDates] = useState({});

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchDoctors = useCallback(async () => {
    try {
      const { data } = await client.get('/doctors');
      const docs = data.doctors || [];
      setDoctors(docs);
      setSelectedDoctor(prev => prev || (docs.length > 0 ? docs[0] : null));
    } catch (err) { console.error('Failed to fetch doctors:', err); }
  }, []);

  const fetchSlots = useCallback(async (doctorId) => {
    try {
      const { data } = await client.get(`doctors/${doctorId}?include_slots=true&slot_limit=500&manage_mode=true`);
      setSlots(data.doctor.available_slots || []);
    } catch (err) { console.error('Failed to fetch slots', err); }
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);
  useEffect(() => { if (selectedDoctor) fetchSlots(selectedDoctor.id); }, [selectedDoctor, fetchSlots]);

  // ── Group slots by date ───────────────────────────────────────────────────
  const groupedSlots = slots.reduce((groups, slot) => {
    const d = slot.date;
    if (!groups[d]) groups[d] = [];
    groups[d].push(slot);
    return groups;
  }, {});
  const sortedDates = Object.keys(groupedSlots).sort();

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleBulkCreate = async (e) => {
    e.preventDefault();
    if (!bulkForm.startDate || !bulkForm.endDate || !bulkForm.startTime || !bulkForm.endTime) return;
    setLoading(true);
    try {
      const { data } = await client.post(`/doctors/${selectedDoctor.id}/slots/bulk`, {
        doctor_id: selectedDoctor.id,
        start_date: bulkForm.startDate,
        end_date:   bulkForm.endDate,
        start_time: bulkForm.startTime,
        end_time:   bulkForm.endTime,
        duration_minutes: 15,
      });
      alert(`✅ Created ${data.created} slots (${data.skipped} duplicates skipped)`);
      fetchSlots(selectedDoctor.id);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      alert(`Failed to create slots: ${msg}`);
    } finally { setLoading(false); }
  };

  const handleBulkCancel = async (e) => {
    e.preventDefault();
    if (!cancelForm.date) return;
    const label = cancelForm.period === 'all' ? 'ALL slots' : `${cancelForm.period} slots`;
    if (!window.confirm(`Cancel ${label} on ${cancelForm.date}?`)) return;
    setLoading(true);
    try {
      const { data } = await client.post(`/doctors/${selectedDoctor.id}/slots/cancel`, {
        doctor_id: selectedDoctor.id,
        date:   cancelForm.date,
        period: cancelForm.period,
      });
      alert(`✅ Cancelled ${data.cancelled} slots`);
      fetchSlots(selectedDoctor.id);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      alert(`Failed to cancel slots: ${msg}`);
    } finally { setLoading(false); }
  };

  const toggleSlotStatus = async (slotId, currentStatus) => {
    const newStatus = currentStatus === 'available' ? 'disabled' : 'available';
    try {
      await client.patch(`/slots/${slotId}`, { status: newStatus });
      fetchSlots(selectedDoctor.id);
    } catch (err) { console.error('Failed to toggle slot', err); }
  };

  const toggleDateGroup = (d) => setCollapsedDates(prev => ({ ...prev, [d]: !prev[d] }));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      {/* ───── Doctor Sidebar ──────────────────────────────────────────────── */}
      <div className="card" style={styles.sidebar}>
        <h3><Briefcase size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} />Doctors</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
          {doctors.map(doc => (
            <div key={doc.id} onClick={() => setSelectedDoctor(doc)} style={styles.doctorCard(selectedDoctor?.id === doc.id)}>
              <div style={{ fontWeight: 600 }}>{doc.name}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{doc.specialization}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ───── Main Panel ──────────────────────────────────────────────────── */}
      <div className="card" style={styles.main}>
        {selectedDoctor ? (<>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h2>{selectedDoctor.name}</h2>
              <span className="text-muted">{selectedDoctor.department} • {selectedDoctor.specialization}</span>
            </div>
            <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>{slots.length} slots total</span>
          </div>

          {/* ── Generate Slots Form ──────────────────────────────────────── */}
          <form onSubmit={handleBulkCreate} style={styles.formBox}>
            <div style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={16} /> Generate Slots
            </div>
            <div style={styles.formRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Start Date</label>
                <input type="date" style={styles.input} value={bulkForm.startDate}
                  onChange={e => setBulkForm({...bulkForm, startDate: e.target.value})} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>End Date</label>
                <input type="date" style={styles.input} value={bulkForm.endDate}
                  onChange={e => setBulkForm({...bulkForm, endDate: e.target.value})} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Start Time</label>
                <input type="time" style={styles.input} value={bulkForm.startTime}
                  onChange={e => setBulkForm({...bulkForm, startTime: e.target.value})} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>End Time</label>
                <input type="time" style={styles.input} value={bulkForm.endTime}
                  onChange={e => setBulkForm({...bulkForm, endTime: e.target.value})} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}
                style={{ whiteSpace: 'nowrap', height: 38 }}>
                <Plus size={16} /> {loading ? 'Creating...' : 'Generate 15-min Slots'}
              </button>
            </div>
          </form>

          {/* ── Cancel Slots Form ────────────────────────────────────────── */}
          <form onSubmit={handleBulkCancel} style={{ ...styles.formBox, borderLeft: '3px solid var(--danger, #e74c3c)' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger, #e74c3c)' }}>
              <XCircle size={16} /> Cancel Slots
            </div>
            <div style={styles.formRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Date</label>
                <input type="date" style={styles.input} value={cancelForm.date}
                  onChange={e => setCancelForm({...cancelForm, date: e.target.value})} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Period</label>
                <select style={styles.select} value={cancelForm.period}
                  onChange={e => setCancelForm({...cancelForm, period: e.target.value})}>
                  <option value="all">All Day</option>
                  <option value="morning">Morning (before 12 PM)</option>
                  <option value="evening">Evening (12 PM onwards)</option>
                </select>
              </div>
              <button type="submit" className="btn btn-outline" disabled={loading}
                style={{ whiteSpace: 'nowrap', height: 38, color: 'var(--danger, #e74c3c)', borderColor: 'var(--danger, #e74c3c)' }}>
                <Trash2 size={16} /> {loading ? 'Cancelling...' : 'Cancel Slots'}
              </button>
            </div>
          </form>

          {/* ── Slot List (grouped by date) ──────────────────────────────── */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {sortedDates.length === 0 && (
              <div className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>
                No slots configured. Use the form above to generate slots.
              </div>
            )}
            {sortedDates.map(date => {
              const dateSlots = groupedSlots[date].sort((a, b) => (a.time > b.time ? 1 : -1));
              const collapsed = collapsedDates[date];
              const availCount = dateSlots.filter(s => s.status === 'available').length;
              return (
                <div key={date} style={{ marginBottom: '1rem' }}>
                  <div style={styles.sectionHead} onClick={() => toggleDateGroup(date)}>
                    {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                    <Calendar size={14} />
                    <span>{date}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.6, marginLeft: 4 }}>
                      ({availCount} available / {dateSlots.length} total)
                    </span>
                  </div>
                  {!collapsed && (
                    <div style={styles.slotGrid}>
                      {dateSlots.map(slot => (
                        <div key={slot.id} style={styles.slotCard(slot.status)}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                              <Clock size={14} /> {slot.time}
                            </div>
                            <span style={styles.badge(slot.status)}>{slot.status}</span>
                          </div>
                          {slot.status !== 'booked' && (
                            <button onClick={() => toggleSlotStatus(slot.id, slot.status)}
                              className="btn btn-outline"
                              style={{ padding: '4px 6px', color: slot.status === 'available' ? 'var(--danger, #e74c3c)' : 'var(--secondary, #27ae60)' }}
                              title={slot.status === 'available' ? 'Disable' : 'Enable'}>
                              <Power size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            Select a doctor to manage slots
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorManager;
