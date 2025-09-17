
import { useEffect, useState } from "react";
import axios from "axios";

export default function LeadAssignmentMetrics() {
  const [assignedCount, setAssignedCount] = useState(0);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Load from .env
  // Load from .env
const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID2;
const leadsTableName = import.meta.env.VITE_AIRTABLE_TABLE;
const assignedToFieldName = import.meta.env.VITE_AIRTABLE_FIELD;


  useEffect(() => {
    const fetchLeads = async () => {
      let allRecords = [];
      let offset = null;
      const fieldsToFetch = [encodeURIComponent(assignedToFieldName)];
      const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
        leadsTableName
      )}?fields[]=${fieldsToFetch.join("&fields[]=")}`;

      try {
        do {
          let fetchUrl = baseUrl;
          if (offset) fetchUrl += `&offset=${offset}`;

          const response = await axios.get(fetchUrl, {
            headers: { Authorization: `Bearer ${apiKey}` },
          });

          allRecords = allRecords.concat(response.data.records);
          offset = response.data.offset;
        } while (offset);

        let assigned = 0;
        let unassigned = 0;

        allRecords.forEach((lead) => {
          if (
            lead.fields[assignedToFieldName] &&
            lead.fields[assignedToFieldName].length > 0
          ) {
            assigned++;
          } else {
            unassigned++;
          }
        });

        setAssignedCount(assigned);
        setUnassignedCount(unassigned);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [apiKey, baseId, leadsTableName, assignedToFieldName]);

  const MetricCard = ({ title, count, color, icon }) => (
    <div
      className={`flex flex-1 min-w-[280px] items-center justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
        loading ? "animate-pulse" : ""
      }`}
    >
      <div className="flex flex-col gap-2">
        <span
          className={`text-lg font-medium ${
            loading
              ? "bg-gray-200 text-transparent rounded-md w-32 h-6"
              : "text-gray-700"
          }`}
        >
          {title}
        </span>
        <span
          className={`text-5xl font-bold leading-none ${
            loading
              ? "bg-gray-200 text-transparent rounded-md w-20 h-12"
              : color
          }`}
        >
          {count}
        </span>
      </div>
      <div
        className={`h-12 w-12 ${
          loading ? "bg-gray-200 rounded-full" : ""
        } flex items-center justify-center`}
      >
        {icon}
      </div>
    </div>
  );

  return (
    <div className="mx-auto my-4 flex max-w-6xl flex-wrap justify-center gap-6 px-6">
      {error ? (
        <p className="text-red-600 font-semibold">Error: {error}</p>
      ) : (
        <>
          {/* Assigned Leads */}
          <MetricCard
            title="Assigned Leads"
            count={assignedCount}
            color="text-green-600"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full text-green-400"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                <path
                  fillRule="evenodd"
                  d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"
                />
                <path
                  fillRule="evenodd"
                  d="M15.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L12.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0z"
                />
              </svg>
            }
          />

          {/* Unassigned Leads */}
          <MetricCard
            title="Unassigned Leads"
            count={unassignedCount}
            color="text-amber-600"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full text-amber-400"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                <path
                  fillRule="evenodd"
                  d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"
                />
              </svg>
            }
          />
        </>
      )}
    </div>
  );
}
