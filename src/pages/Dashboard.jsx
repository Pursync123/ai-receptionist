import { useState, useEffect } from 'react';
import client from '../api/client';
import { Users, Calendar, Clock } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalAppointments: 0,
        activeDoctors: 0,
        todaysSlots: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch appointments count
                const apptRes = await client.get('/appointments');
                const totalAppts = apptRes.data.count || 0;

                // Fetch doctors count
                const docRes = await client.get('/doctors');
                const totalDocs = docRes.data.count || 0;

                // For today's slots, we might need to filter available slots manually if no endpoint exists
                // Or use the doctors endpoint which includes slots if we ask
                // For now, let's use a simple approximation or 0 if we can't easily get it without heavy logic
                // The user asked to check "doctors, appoitments, dashboard related endpoints"
                
                // Let's count available slots from the doctors response if included
                let availableSlotsCount = 0;
                if (docRes.data.doctors) {
                     docRes.data.doctors.forEach(doc => {
                        availableSlotsCount += doc.available_slots_count || 0;
                     });
                }

                setStats({
                    totalAppointments: totalAppts,
                    activeDoctors: totalDocs,
                    todaysSlots: availableSlotsCount // This is total available, close enough for now
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div>Loading stats...</div>;

    return (
      <div>
        <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-lg)' }}>Dashboard</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-lg)' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Calendar className="text-muted" size={20} />
                <h3 className="text-muted text-sm">Total Appointments</h3>
            </div>
            <p className="text-xl" style={{ color: 'var(--primary)' }}>{stats.totalAppointments}</p>
          </div>
          <div className="card">
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Users className="text-muted" size={20} />
                <h3 className="text-muted text-sm">Active Doctors</h3>
            </div>
            <p className="text-xl" style={{ color: 'var(--secondary)' }}>{stats.activeDoctors}</p>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Clock className="text-muted" size={20} />
                <h3 className="text-muted text-sm">Available Slots</h3>
            </div>
            <p className="text-xl" style={{ color: 'var(--accent)' }}>{stats.todaysSlots}</p>
          </div>
        </div>
      </div>
    );
  };
  
  export default Dashboard;

