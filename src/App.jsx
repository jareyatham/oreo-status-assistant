import { BrowserRouter, Routes, Route } from "react-router-dom";
import ViewerPage from "./pages/ViewerPage";
import ControllerPage from "./pages/ControllerPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ViewerPage />} />
        {/* เปลี่ยน path นี้เป็นคำที่เดายากๆ ของตัวเอง แล้วอย่าแชร์ให้ใครนอกจากตัวเอง */}
        <Route path="/control-s1sqlfctl212748" element={<ControllerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
