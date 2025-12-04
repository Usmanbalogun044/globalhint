import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { Profile } from '@/pages/Profile';
import { LiveStream } from '@/pages/LiveStream';
import { Messages } from '@/pages/Messages';
import { NotificationList } from '@/pages/Notifications';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/live" element={<LiveStream />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<NotificationList />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
