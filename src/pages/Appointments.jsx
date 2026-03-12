import { useState, useEffect } from 'react';
import client from '../api/client';
import { Calendar, Clock, User, Sparkles, Activity } from 'lucide-react';

const statusStyles = {
  booked:    'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm',
  cancelled: 'bg-red-50 text-red-600 border border-red-200 shadow-sm',
  completed: 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm',
  no_show:   'bg-gray-100 text-gray-600 border border-gray-200 shadow-sm',
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppts = async () => {
      try {
        const { data } = await client.get('/appointments');
        const allAppts = data.appointments || [];
        
        // Filter: Only show appointments from today onwards (using LOCAL time, not UTC)
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
        
        const filtered = allAppts.filter(appt => {
          // Extract date string directly from the appointment (already in local IST)
          const apptDateStr = appt.requested_datetime.split('T')[0];
          return apptDateStr >= todayStr;
        });
        
        // Sort chronologically
        filtered.sort((a, b) => new Date(a.requested_datetime) - new Date(b.requested_datetime));
        
        setAppointments(filtered);
      } catch (err) { 
        console.error('Failed to fetch appointments:', err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchAppts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <Activity className="text-indigo-400 mb-4 h-10 w-10 spin-slow" />
        <div className="text-gray-500 font-medium tracking-wide">Loading upcoming appointments...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2">
      {/* Premium Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600 tracking-tight flex items-center gap-3">
            <Sparkles className="text-indigo-500" size={28} />
            Upcoming Appointments
          </h2>
          <p className="text-gray-500 mt-2 font-medium text-sm">Review scheduled visits from today onwards</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
          <span className="text-2xl font-black text-indigo-600">{appointments.length}</span>
          <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold mt-1">Scheduled</span>
        </div>
      </div>

      {/* Modern Glassmorphic Table Container */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
        {/* Subtle decorative gradient orb in background */}
        <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="relative z-10">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gradient-to-r from-gray-50/90 to-white/90 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[0.65rem] font-bold text-gray-400 uppercase tracking-[0.2em]">Patient Details</th>
                <th className="px-6 py-4 text-[0.65rem] font-bold text-gray-400 uppercase tracking-[0.2em]">Schedule</th>
                <th className="px-6 py-4 text-[0.65rem] font-bold text-gray-400 uppercase tracking-[0.2em]">Reason for Visit</th>
                <th className="px-6 py-4 text-[0.65rem] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {appointments.map((appt) => {
                const dateObj = new Date(appt.requested_datetime);
                const localNow = new Date();
                const todayLocal = `${localNow.getFullYear()}-${String(localNow.getMonth()+1).padStart(2,'0')}-${String(localNow.getDate()).padStart(2,'0')}`;
                const isToday = appt.requested_datetime.split('T')[0] === todayLocal;
                
                return (
                  <tr key={appt.id} className="hover:bg-indigo-50/30 transition-all duration-200 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-indigo-200 transform group-hover:scale-105 transition-transform">
                          {appt.patient.first_name[0]}{appt.patient.last_name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 tracking-tight">{appt.patient.first_name} {appt.patient.last_name}</div>
                          <div className="text-xs text-gray-400 font-medium mt-0.5">{appt.patient.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 min-w-[140px]">
                        <span className={`flex items-center gap-2 text-sm font-semibold ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>
                          <Calendar size={14} className={isToday ? 'text-indigo-500' : 'text-gray-400'} />
                          {isToday ? 'Today' : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                          <Clock size={13} className="text-gray-400" />
                          {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 font-medium max-w-xs truncate" title={appt.reason}>
                        {appt.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[0.65rem] font-black uppercase tracking-wider ${statusStyles[appt.status] || statusStyles['no_show']}`}>
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              
              {appointments.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <div className="inline-flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                      <Calendar className="text-gray-300 mb-3" size={32} />
                      <p className="text-gray-500 font-medium tracking-wide">No upcoming appointments scheduled</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
