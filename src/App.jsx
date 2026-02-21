import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments'; 
import DoctorManager from './pages/DoctorManager';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/doctors" element={<DoctorManager />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
