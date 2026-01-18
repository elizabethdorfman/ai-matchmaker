import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import SignUpForm from './components/SignUpForm';
import DateMeDoc from './pages/DateMeDoc';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="signup" element={<SignUpForm />} />
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

