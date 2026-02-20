import { Outlet } from "react-router";
import Header from "./Header";
import Footer from "./Footer";
import BackToTop from "./BackToTop";

export default function Root() {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      <Outlet />
      <Footer />
      <BackToTop />
    </div>
  );
}