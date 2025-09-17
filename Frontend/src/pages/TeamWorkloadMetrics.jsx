import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function TeamWorkloadMetrics() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔑 Airtable ENV
  const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID2;
  
  // Check if environment variables are set
  if (!apiKey || !baseId) {
    console.error('Missing Airtable environment variables');
  }

  // 📊 Config
  const tables = {
    leads: "Leads",
    employees: "Employee Directory",
    departments: "Departments",
  };
  const fields = {
    assigned: "Assigned To",
    name: "Full Name",
    photo: "Profile Photo",
    deptLink: "Department",
    deptName: "Department Name",
    stage: "Stage",
  };
  const stages = {
    fresh: "Fresh",
    follow: "Follow Up Required",
    notConn: "Not Connected",
  };
  const targetDept = "Sales & Customer Success";

  // 🔄 Fetch Airtable
  const fetchAirtable = async (table, fieldsArr, filter = "") => {
    let url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
      table
    )}?${fieldsArr.map((f) => `fields[]=${encodeURIComponent(f)}`).join("&")}`;
    if (filter) url += `&filterByFormula=${filter}`;
    let records = [],
      offset;
    do {
      const res = await fetch(url + (offset ? `&offset=${offset}` : ""), {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} on ${table}`);
      const data = await res.json();
      records = records.concat(data.records);
      offset = data.offset;
    } while (offset);
    return records;
  };

  // 📌 Run workload calc
  const runMetrics = async () => {
    setLoading(true);
    setError(null);
    
    // Check environment variables first
    if (!apiKey || !baseId) {
      setError('Airtable configuration missing. Please check environment variables.');
      setLoading(false);
      return;
    }
    
    try {
      const deptFilter = encodeURIComponent(
        `({${fields.deptName}} = '${targetDept}')`
      );
      const dept = await fetchAirtable(
        tables.departments,
        [fields.deptName],
        deptFilter
      );
      if (!dept.length) throw new Error(`No department '${targetDept}' found`);
      const deptId = dept[0].id;

      const employees = await fetchAirtable(tables.employees, [
        fields.name,
        fields.photo,
        fields.deptLink,
      ]);
      const salesEmployees = employees.filter((e) =>
        e.fields[fields.deptLink]?.includes(deptId)
      );

      const leads = await fetchAirtable(tables.leads, [
        fields.assigned,
        fields.stage,
      ]);

      const counts = new Map();
      salesEmployees.forEach((e) =>
        counts.set(e.id, {
          name: e.fields[fields.name] || "Unknown",
          photo: e.fields[fields.photo]?.[0]?.thumbnails?.small?.url || "",
          total: 0,
          fresh: 0,
          follow: 0,
          notConn: 0,
        })
      );

      leads.forEach((l) => {
        const [empId] = l.fields[fields.assigned] || [];
        if (counts.has(empId)) {
          const emp = counts.get(empId);
          emp.total++;
          if (l.fields[fields.stage] === stages.fresh) emp.fresh++;
          else if (l.fields[fields.stage] === stages.follow) emp.follow++;
          else if (l.fields[fields.stage] === stages.notConn) emp.notConn++;
        }
      });

      setEmployees([...counts.values()].sort((a, b) => b.total - a.total));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    runMetrics();
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm max-w-6xl mx-auto">
      <div className="flex justify-between items-center border-b pb-4 mb-5">
        <h2 className="text-xl font-bold">Team Workload Overview</h2>
        <div className="flex gap-3">
          <button
            onClick={runMetrics}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100 transition"
          >
            Refresh
          </button>
          <a
            href="/old-home-b5231aef-cdf4-4116-a8cd-43c274a8c910"
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Start Assigning
          </a>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 font-medium">Error: {error}</p>
          <p className="text-red-500 text-sm mt-1">
            Please check your Airtable configuration or contact support.
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading team data...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No team data available</p>
          </div>
        ) : (
          employees.map((emp, i) => {
              const p = (c) => (emp.total ? (c / emp.total) * 100 : 0);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.03 }}
                  className="p-5 border rounded-xl shadow-md bg-white transition-all duration-300 hover:shadow-xl"
                >
                  <div className="flex gap-3 items-center mb-4">
                    {emp.photo ? (
                      <img
                        src={emp.photo}
                        className="w-12 h-12 rounded-full shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-full font-semibold">
                        {emp.name[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">{emp.name}</div>
                      <div className="text-sm text-gray-500">
                        {emp.total} Total Leads
                      </div>
                    </div>
                  </div>
                  {["fresh", "follow", "notConn"].map((type) => (
                    <div
                      key={type}
                      className="flex items-center gap-2 mb-2 group"
                    >
                      <span className="w-28 text-sm">{stages[type]}</span>
                      <div className="flex-grow h-2 bg-gray-200 rounded overflow-hidden">
                        <motion.div
                          className={`h-2 rounded ${
                            type === "fresh"
                              ? "bg-blue-500"
                              : type === "follow"
                              ? "bg-yellow-500"
                              : "bg-gray-500"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${p(emp[type])}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                      <span className="w-6 text-right text-sm">{emp[type]}</span>
                    </div>
                  ))}
                </motion.div>
              );
            })
        )}
      </div>
    </div>
  );
}
