import { useState, useEffect } from 'react';
import client from '../api/client';
import { Calendar, Clock, User } from 'lucide-react';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await client.get('/appointments');
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading appointments...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h2>Appointments</h2>
        <span className="text-muted">{appointments.length} Total</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-body)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th className="p-4 text-muted text-sm">Patient</th>
              <th className="p-4 text-muted text-sm">Date & Time</th>
              <th className="p-4 text-muted text-sm">Reason</th>
              <th className="p-4 text-muted text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td className="p-4">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', 
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' 
                    }}>
                      {appt.patient.first_name[0]}{appt.patient.last_name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{appt.patient.first_name} {appt.patient.last_name}</div>
                      <div className="text-muted text-sm">{appt.patient.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} className="text-muted" />
                      <span>{new Date(appt.requested_datetime).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} className="text-muted" />
                      <span>{new Date(appt.requested_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">{appt.reason}</td>
                <td className="p-4">
                  <span style={{ 
                    padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                    backgroundColor: appt.status === 'booked' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: appt.status === 'booked' ? 'var(--secondary)' : 'var(--danger)'
                  }}>
                    {appt.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-muted">No appointments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Appointments;
