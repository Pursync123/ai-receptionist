import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import { Plus, Trash2, Power, Briefcase, Clock, Calendar } from 'lucide-react';

const DoctorManager = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ date: '', time: '' });

  const fetchDoctors = useCallback(async () => {
    try {
      const response = await client.get('/doctors');
      const docs = response.data.doctors || [];
      setDoctors(docs);
      setSelectedDoctor(prev => prev || (docs.length > 0 ? docs[0] : null));
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  }, []);

  const fetchSlots = useCallback(async (doctorId) => {
      try {
          // Use manage_mode=true to get all slots (including disabled)
          const response = await client.get(`doctors/${doctorId}?include_slots=true&slot_limit=100&manage_mode=true`);
          setSlots(response.data.doctor.available_slots || []);
      } catch (error) {
          console.error("Failed to fetch slots", error);
      }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    if (selectedDoctor) {
      fetchSlots(selectedDoctor.id);
    }
  }, [selectedDoctor, fetchSlots]);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.date || !newSlot.time) return;

    try {
      await client.post(`/doctors/${selectedDoctor.id}/slots`, {
        doctor_id: selectedDoctor.id,
        date: newSlot.date,
        time: newSlot.time,
        duration_minutes: 15
      });
      // Refresh slots
      fetchSlots(selectedDoctor.id);
      setNewSlot({ date: '', time: '' });
    } catch (error) {
      console.error('Failed to add slot:', error);
      const msg = error.response?.data?.detail || error.message || 'Check inputs';
      alert(`Failed to add slot: ${msg}`);
    }
  };

  const toggleSlotStatus = async (slotId, currentStatus) => {
      const newStatus = currentStatus === 'available' ? 'disabled' : 'available';
      try {
        await client.patch(`/slots/${slotId}`, { status: newStatus });
        fetchSlots(selectedDoctor.id);
      } catch (error) {
          console.error("Failed to toggle slot", error);
      }
  };

  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-lg)', height: 'calc(100vh - 100px)' }}>
      {/* Doctor List */}
      <div className="card" style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3>Doctors</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
            {doctors.map(doc => (
                <div 
                    key={doc.id}
                    onClick={() => setSelectedDoctor(doc)}
                    style={{
                        padding: '10px',
                        borderRadius: 'var(--radius)',
                        cursor: 'pointer',
                        backgroundColor: selectedDoctor && selectedDoctor.id === doc.id ? 'var(--primary)' : 'transparent',
                        color: selectedDoctor && selectedDoctor.id === doc.id ? 'white' : 'inherit',
                        border: '1px solid var(--border-color)'
                    }}
                >
                    <div style={{ fontWeight: 600 }}>{doc.name}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{doc.specialization}</div>
                </div>
            ))}
        </div>
      </div>

      {/* Slot Manager */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {selectedDoctor ? (
            <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <div>
                        <h2>{selectedDoctor.name}</h2>
                        <span className="text-muted">{selectedDoctor.department}</span>
                    </div>
                </div>

                {/* Add Slot Form */}
                <form onSubmit={handleAddSlot} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', backgroundColor: 'var(--bg-body)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                    <div className="flex-col" style={{ gap: '0.5rem' }}>
                        <label className="text-sm font-medium">Date</label>
                        <input 
                            type="date" 
                            className="p-2 border rounded"
                            value={newSlot.date}
                            onChange={e => setNewSlot({...newSlot, date: e.target.value})}
                            required
                        />
                    </div>
                    <div className="flex-col" style={{ gap: '0.5rem' }}>
                        <label className="text-sm font-medium">Time</label>
                        <input 
                            type="time" 
                            className="p-2 border rounded"
                            value={newSlot.time}
                            onChange={e => setNewSlot({...newSlot, time: e.target.value})}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        <Plus size={18} /> Add Slot
                    </button>
                </form>

                {/* Slot List */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', alignContent: 'start' }}>
                    {slots.map(slot => (
                        <div key={slot.id} style={{ 
                            border: '1px solid var(--border-color)', 
                            borderRadius: 'var(--radius)', 
                            padding: '1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: slot.status === 'available' ? 'white' : 'var(--bg-body)',
                            opacity: slot.status === 'available' ? 1 : 0.6
                        }}>
                           <div>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                    <Calendar size={14} /> {slot.date}
                               </div>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                    <Clock size={14} /> {slot.time}
                               </div>
                               <div className="text-sm text-muted" style={{ marginTop: '4px' }}>
                                   {slot.status}
                               </div>
                           </div>
                           <button 
                                onClick={() => toggleSlotStatus(slot.id, slot.status)}
                                className="btn btn-outline"
                                style={{ padding: '6px', color: slot.status === 'available' ? 'var(--danger)' : 'var(--secondary)' }}
                                title={slot.status === 'available' ? "Disable Slot" : "Enable Slot"}
                           >
                               <Power size={16} />
                           </button>
                        </div>
                    ))}
                    {slots.length === 0 && (
                        <div className="text-muted">No slots configured. Add one above.</div>
                    )}
                </div>
            </>
        ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                Select a doctor to manage slots
            </div>
        )}
      </div>
    </div>
  );
};

export default DoctorManager;
