
import { Routes, Route, Link } from "react-router-dom";
import Home from "../src/pages/Home";
import TeamWorkloadMetrics from "../src/pages/TeamWorkloadMetrics"; // ✅ Add this
import ProductCards from "../src/pages/ProductCards";               // ✅ And this

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> | <Link to="teamworkloadmetrics">Team Work Load</Link> |<Link to="productcards">Products</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teamworkloadmetrics" element={<TeamWorkloadMetrics />} />
        <Route path="/productcards" element={<ProductCards />} />
      </Routes>
    </div>
  );
}
