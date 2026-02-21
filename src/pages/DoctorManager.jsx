import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import { Plus, Trash2, Power, Clock, Calendar, XCircle, ChevronDown, ChevronRight } from 'lucide-react';

const statusBadge = {
  available: 'bg-emerald-50 text-emerald-700',
  booked:    'bg-blue-50 text-blue-700',
  disabled:  'bg-red-50 text-red-600',
  cancelled: 'bg-gray-100 text-gray-500',
};

const DoctorManager = () => {
  const [doctors, setDoctors]               = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots]                   = useState([]);
  const [loading, setLoading]               = useState(false);
  const [bulkForm, setBulkForm]             = useState({ startDate: '', endDate: '', startTime: '09:00', endTime: '17:00' });
  const [cancelForm, setCancelForm]         = useState({ date: '', period: 'all' });
  const [collapsedDates, setCollapsedDates] = useState({});

  // ── Fetch doctors (with slot counts) ────────────────────────────────────
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

  // ── Group slots ─────────────────────────────────────────────────────────
  const grouped = slots.reduce((g, s) => { (g[s.date] = g[s.date] || []).push(s); return g; }, {});
  const sortedDates = Object.keys(grouped).sort();

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleBulkCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await client.post(`/doctors/${selectedDoctor.id}/slots/bulk`, {
        doctor_id: selectedDoctor.id, start_date: bulkForm.startDate, end_date: bulkForm.endDate,
        start_time: bulkForm.startTime, end_time: bulkForm.endTime, duration_minutes: 15,
      });
      alert(`✅ Created ${data.created} slots (${data.skipped} duplicates skipped)`);
      fetchSlots(selectedDoctor.id);
      fetchDoctors();
    } catch (err) { alert(`Failed: ${err.response?.data?.detail || err.message}`); }
    finally { setLoading(false); }
  };

  const handleBulkCancel = async (e) => {
    e.preventDefault();
    const label = cancelForm.period === 'all' ? 'ALL slots' : `${cancelForm.period} slots`;
    if (!window.confirm(`Cancel ${label} on ${cancelForm.date}?`)) return;
    setLoading(true);
    try {
      const { data } = await client.post(`/doctors/${selectedDoctor.id}/slots/cancel`, {
        doctor_id: selectedDoctor.id, date: cancelForm.date, period: cancelForm.period,
      });
      alert(`✅ Cancelled ${data.cancelled} slots`);
      fetchSlots(selectedDoctor.id);
      fetchDoctors();
    } catch (err) { alert(`Failed: ${err.response?.data?.detail || err.message}`); }
    finally { setLoading(false); }
  };

  const toggleSlotStatus = async (slotId, cur) => {
    try {
      await client.patch(`/slots/${slotId}`, { status: cur === 'available' ? 'disabled' : 'available' });
      fetchSlots(selectedDoctor.id);
      fetchDoctors();
    } catch (err) { console.error('toggle failed', err); }
  };

  const toggleDate = (d) => setCollapsedDates(p => ({ ...p, [d]: !p[d] }));

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex gap-5 h-[calc(100vh-80px)]">
      {/* ───── Doctor Sidebar ─ */}
      <div className="w-64 shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        <h3 className="px-4 pt-4 pb-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">Doctors</h3>
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
          {doctors.map(doc => {
            const active = selectedDoctor?.id === doc.id;
            return (
              <div key={doc.id} onClick={() => setSelectedDoctor(doc)}
                className={`p-3 rounded-lg cursor-pointer transition-colors
                  ${active ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50 text-gray-700'}`}>
                <div className="font-semibold text-sm">{doc.name}</div>
                <div className={`text-xs mt-0.5 ${active ? 'text-indigo-200' : 'text-gray-400'}`}>{doc.specialization}</div>
                <div className={`text-xs mt-1 font-medium ${active ? 'text-indigo-100' : 'text-emerald-600'}`}>
                  {doc.available_slots_count ?? 0} slots available
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ───── Main Panel ─ */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
        {selectedDoctor ? (<>
          {/* Header */}
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{selectedDoctor.name}</h2>
              <span className="text-sm text-gray-400">{selectedDoctor.department} • {selectedDoctor.specialization}</span>
            </div>
            <span className="text-xs text-gray-400">{slots.length} slots total</span>
          </div>

          {/* ── Generate Slots ─ */}
          <form onSubmit={handleBulkCreate}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
              <Plus size={15} /> Generate Slots
            </div>
            <div className="flex flex-wrap gap-3 items-end">
              <Field label="Start Date">
                <input type="date" value={bulkForm.startDate} required
                  onChange={e => setBulkForm({...bulkForm, startDate: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
              </Field>
              <Field label="End Date">
                <input type="date" value={bulkForm.endDate} required
                  onChange={e => setBulkForm({...bulkForm, endDate: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
              </Field>
              <Field label="Start Time">
                <input type="time" value={bulkForm.startTime} required
                  onChange={e => setBulkForm({...bulkForm, startTime: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
              </Field>
              <Field label="End Time">
                <input type="time" value={bulkForm.endTime} required
                  onChange={e => setBulkForm({...bulkForm, endTime: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
              </Field>
              <button type="submit" disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap">
                <Plus size={14} className="inline -mt-0.5 mr-1" />
                {loading ? 'Creating...' : 'Generate 15-min Slots'}
              </button>
            </div>
          </form>

          {/* ── Cancel Slots ─ */}
          <form onSubmit={handleBulkCancel}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 border-l-4 border-l-red-400">
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-red-600">
              <XCircle size={15} /> Cancel Slots
            </div>
            <div className="flex flex-wrap gap-3 items-end">
              <Field label="Date">
                <input type="date" value={cancelForm.date} required
                  onChange={e => setCancelForm({...cancelForm, date: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-200 outline-none" />
              </Field>
              <Field label="Period">
                <select value={cancelForm.period}
                  onChange={e => setCancelForm({...cancelForm, period: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-200 outline-none cursor-pointer">
                  <option value="all">All Day</option>
                  <option value="morning">Morning (before 12 PM)</option>
                  <option value="evening">Evening (12 PM onwards)</option>
                </select>
              </Field>
              <button type="submit" disabled={loading}
                className="border border-red-400 text-red-600 hover:bg-red-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap">
                <Trash2 size={14} className="inline -mt-0.5 mr-1" />
                {loading ? 'Cancelling...' : 'Cancel Slots'}
              </button>
            </div>
          </form>

          {/* ── Slot List (grouped by date) ─ */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {sortedDates.length === 0 && (
              <div className="text-center text-gray-400 py-10">No slots configured. Use the form above to generate slots.</div>
            )}
            {sortedDates.map(date => {
              const dateSlots = grouped[date].sort((a, b) => (a.time > b.time ? 1 : -1));
              const collapsed = collapsedDates[date];
              const availCount = dateSlots.filter(s => s.status === 'available').length;
              return (
                <div key={date}>
                  <div onClick={() => toggleDate(date)}
                    className="flex items-center gap-2 py-2 cursor-pointer select-none font-semibold text-gray-700 text-sm">
                    {collapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                    <Calendar size={13} />
                    <span>{date}</span>
                    <span className="text-xs font-normal text-gray-400 ml-1">
                      ({availCount} available / {dateSlots.length} total)
                    </span>
                  </div>
                  {!collapsed && (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2">
                      {dateSlots.map(slot => (
                        <div key={slot.id}
                          className={`border border-gray-200 rounded-lg p-3 flex justify-between items-center transition-opacity
                            ${slot.status === 'available' ? 'bg-white' : slot.status === 'booked' ? 'bg-blue-50/50' : 'bg-gray-50 opacity-60'}`}>
                          <div>
                            <div className="flex items-center gap-1.5 font-semibold text-sm text-gray-800">
                              <Clock size={13} /> {slot.time}
                            </div>
                            <span className={`inline-block mt-1 text-[0.65rem] px-2 py-0.5 rounded-full font-semibold uppercase ${statusBadge[slot.status] || 'bg-gray-100 text-gray-500'}`}>
                              {slot.status}
                            </span>
                          </div>
                          {slot.status !== 'booked' && (
                            <button onClick={() => toggleSlotStatus(slot.id, slot.status)}
                              title={slot.status === 'available' ? 'Disable' : 'Enable'}
                              className={`p-1.5 rounded-md border transition-colors cursor-pointer
                                ${slot.status === 'available'
                                  ? 'border-red-200 text-red-500 hover:bg-red-50'
                                  : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
                              <Power size={13} />
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
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a doctor to manage slots
          </div>
        )}
      </div>
    </div>
  );
};

// ── Tiny helper for labelled inputs ───────────────────────────────────────
const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[0.7rem] font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

export default DoctorManager;
