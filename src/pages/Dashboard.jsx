import { useState, useEffect } from 'react';
import client from '../api/client';
import { Users, Calendar, Clock } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
    <div className="flex items-center gap-2.5 mb-3">
      <Icon size={18} className="text-gray-400" />
      <span className="text-sm text-gray-500 font-medium">{label}</span>
    </div>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ totalAppointments: 0, activeDoctors: 0, todaysSlots: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [apptRes, docRes] = await Promise.all([
          client.get('/appointments'),
          client.get('/doctors'),
        ]);
        let availableSlotsCount = 0;
        (docRes.data.doctors || []).forEach(doc => {
          availableSlotsCount += doc.available_slots_count || 0;
        });
        setStats({
          totalAppointments: apptRes.data.count || 0,
          activeDoctors: docRes.data.count || 0,
          todaysSlots: availableSlotsCount,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-gray-400 text-center py-12">Loading stats...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard icon={Calendar} label="Total Appointments" value={stats.totalAppointments} color="text-indigo-600" />
        <StatCard icon={Users}    label="Active Doctors"      value={stats.activeDoctors}     color="text-emerald-600" />
        <StatCard icon={Clock}    label="Available Slots"     value={stats.todaysSlots}       color="text-amber-500" />
      </div>
    </div>
  );
};

export default Dashboard;
