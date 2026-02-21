import { useState, useEffect } from 'react';
import client from '../api/client';
import { Calendar, Clock, User } from 'lucide-react';

const statusColors = {
  booked:    'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-600',
  completed: 'bg-blue-50 text-blue-600',
  no_show:   'bg-gray-100 text-gray-500',
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await client.get('/appointments');
        setAppointments(data.appointments || []);
      } catch (err) { console.error('Failed to fetch appointments:', err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="text-gray-400 text-center py-12">Loading appointments...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Appointments</h2>
        <span className="text-sm text-gray-400">{appointments.length} Total</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {appointments.map((appt) => (
              <tr key={appt.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold">
                      {appt.patient.first_name[0]}{appt.patient.last_name[0]}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{appt.patient.first_name} {appt.patient.last_name}</div>
                      <div className="text-xs text-gray-400">{appt.patient.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-col gap-0.5 text-sm">
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <Calendar size={13} className="text-gray-400" />
                      {new Date(appt.requested_datetime).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <Clock size={13} className="text-gray-400" />
                      {new Date(appt.requested_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{appt.reason}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[appt.status] || 'bg-gray-100 text-gray-500'}`}>
                    {appt.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr><td colSpan="4" className="px-5 py-8 text-center text-gray-400">No appointments found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Appointments;
