import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { I18nProvider } from "./i18n/I18nProvider";
import About from "./pages/About";
import { AdminHome, AdminLogin } from "./pages/Admin";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import ListingDetail from "./pages/ListingDetail";
import Listings from "./pages/Listings";
import ProjectDetail from "./pages/ProjectDetail";
import Projects from "./pages/Projects";
import Services from "./pages/Services";
import TenderDetail from "./pages/TenderDetail";
import Tenders from "./pages/Tenders";

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminHome />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/projeler" element={<Projects />} />
            <Route path="/projeler/:id" element={<ProjectDetail />} />
            <Route path="/ihaleler" element={<Tenders />} />
            <Route path="/ihaleler/:id" element={<TenderDetail />} />
            <Route path="/emlaklar" element={<Listings />} />
            <Route path="/emlaklar/:id" element={<ListingDetail />} />
            <Route path="/hizmetler" element={<Services />} />
            <Route path="/hakkimizda" element={<About />} />
            <Route path="/iletisim" element={<Contact />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}
