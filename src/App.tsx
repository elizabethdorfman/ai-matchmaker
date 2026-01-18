import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import SignUpForm from './components/SignUpForm';
import DateMeDoc from './pages/DateMeDoc';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import MarketAnalysis from './pages/MarketAnalysis';
import DatingROI from './pages/DatingROI';
import AIActivity from './pages/AIActivity';
import Database from './pages/Database';
import RequestDM from './pages/RequestDM';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="signup" element={<SignUpForm />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="analysis" element={<MarketAnalysis />} />
          <Route path="market-analysis" element={<MarketAnalysis />} />
          <Route path="roi" element={<DatingROI />} />
          <Route path="dating-roi" element={<DatingROI />} />
          <Route path="ai-activity" element={<AIActivity />} />
          <Route path="activity" element={<AIActivity />} />
          <Route path="see-community" element={<Database />} />
          <Route path="community" element={<Database />} />
          <Route path="request-dm" element={<RequestDM />} />
          <Route path="*" element={
            <div className="container mx-auto px-4 py-16 text-center">
              <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
              <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
              <a href="/" className="text-blue-600 hover:underline">Return to Home</a>
            </div>
          } />
        </Route>
        <Route path="date-me-doc/:userId" element={<DateMeDoc />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

