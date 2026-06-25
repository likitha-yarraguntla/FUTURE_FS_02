import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Papa from "papaparse";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function Dashboard() {

  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

const leadsPerPage = 5;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "Website",
    followUpDate: "",
    priority: "Medium",
    notes: "",
  });

  const API_URL = "https://future-fs-02-rkv9.onrender.com/api/leads";

  const fetchLeads = async () => {
    try {
      const response = await axios.get(API_URL);
      setLeads(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch leads");
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);
  useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, statusFilter]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this lead?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success("Lead deleted successfully!");
      fetchLeads();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete lead");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status });

      toast.success(`Status updated to ${status}`);
      fetchLeads();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const payload = {
      ...formData,
      notes: formData.notes ? [{ text: formData.notes }] : [],
    };

    if (editingId) {
      await axios.put(`${API_URL}/${editingId}`, payload);

      toast.success("Lead updated successfully!");
      setEditingId(null);
    } else {
      await axios.post(API_URL, payload);

      toast.success("Lead added successfully!");
    }

    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      source: "Website",
      followUpDate: "",
      priority: "Medium",
      notes: "",
    });

    fetchLeads();
  } catch (error) {
    console.error(error);
    toast.error(
      error.response?.data?.message || "Operation failed"
    );
  }
};
const handleEdit = (lead) => {
  setEditingId(lead._id);
  toast("Editing lead...");

  setFormData({
    name: lead.name || "",
    email: lead.email || "",
    phone: lead.phone || "",
    company: lead.company || "",
    source: lead.source || "Website",
    priority: lead.priority || "Medium",
    followUpDate: lead.followUpDate
      ? lead.followUpDate.split("T")[0]
      : "",
    notes: lead.notes?.[0]?.text || "",
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
const exportCSV = () => {
  const csv = Papa.unparse(leads);

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = "leadflow-leads.csv";

  link.click();

  URL.revokeObjectURL(url);

  toast.success("CSV exported successfully!");
};
  const totalLeads = leads.length;

  const newLeads = leads.filter(
    (lead) => lead.status === "New"
  ).length;

  const qualifiedLeads = leads.filter(
    (lead) => lead.status === "Qualified"
  ).length;

  const convertedLeads = leads.filter(
    (lead) => lead.status === "Converted"
  ).length;
  const conversionRate = totalLeads
  ? ((convertedLeads / totalLeads) * 100).toFixed(1)
  : 0;
  

  const chartData = [
    { name: "New", value: newLeads },
    { name: "Qualified", value: qualifiedLeads },
    { name: "Converted", value: convertedLeads },
  ];
  const sourceData = [
  {
    name: "Website",
    value: leads.filter((lead) => lead.source === "Website").length,
  },
  {
    name: "LinkedIn",
    value: leads.filter((lead) => lead.source === "LinkedIn").length,
  },
  {
    name: "Referral",
    value: leads.filter((lead) => lead.source === "Referral").length,
  },
  {
    name: "Instagram",
    value: leads.filter((lead) => lead.source === "Instagram").length,
  },
  {
    name: "Other",
    value: leads.filter((lead) => lead.source === "Other").length,
  },
];

  const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
];

  const filteredLeads = leads.filter((lead) => {
  const matchesSearch =
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
   

  const matchesStatus =
    statusFilter === "All" || lead.status === statusFilter;

  return matchesSearch && matchesStatus;
});
const indexOfLastLead = currentPage * leadsPerPage;
const indexOfFirstLead = indexOfLastLead - leadsPerPage;

const currentLeads = filteredLeads.slice(
  indexOfFirstLead,
  indexOfLastLead
);

const totalPages = Math.ceil(
  filteredLeads.length / leadsPerPage
);
const upcomingFollowUps = leads
  .filter((lead) => lead.followUpDate)
  .sort(
    (a, b) =>
      new Date(a.followUpDate) - new Date(b.followUpDate)
  )
  .slice(0, 5);

  const overdueLeads = leads.filter(
  (lead) =>
    lead.followUpDate &&
    new Date(lead.followUpDate) < new Date() &&
    lead.status !== "Converted"
);
const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

  return (
  <div className="min-h-screen bg-slate-100 p-4 md:p-8">
<div className="mb-8 flex items-center justify-between">
      <h1 className="text-3xl font-bold text-blue-600 md:text-5xl">
        LeadFlow CRM 🚀
      </h1>

      <button
        onClick={handleLogout}
        className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
      >
        Logout
      </button>
    </div>
{/* Dashboard Cards */}
      <div className="mx-auto mb-8 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-5 shadow-lg">
  <p className="text-sm text-gray-500">🎯 Converted</p>

  <h2 className="text-3xl font-bold">{convertedLeads}</h2>

  <p className="mt-2 text-sm text-gray-500">
    Conversion Rate: {conversionRate}%
  </p>
</div>
{overdueLeads.length > 0 && (
  <div className="mx-auto mb-8 max-w-5xl rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
    <h2 className="font-bold text-red-700">
      ⚠️ Overdue Follow-ups ({overdueLeads.length})
    </h2>

    <p className="mt-1 text-sm text-red-600">
      Some leads have missed follow-up dates.
    </p>
  </div>
)}

        <div className="rounded-lg bg-white p-5 shadow-lg">
          <p className="text-sm text-gray-500">🆕 New Leads</p>
          <h2 className="text-3xl font-bold">{newLeads}</h2>
        </div>

        <div className="rounded-lg bg-white p-5 shadow-lg">
          <p className="text-sm text-gray-500">⭐ Qualified</p>
          <h2 className="text-3xl font-bold">{qualifiedLeads}</h2>
        </div>

        <div className="rounded-lg bg-white p-5 shadow-lg">
          <p className="text-sm text-gray-500">🎯 Converted</p>
          <h2 className="text-3xl font-bold">{convertedLeads}</h2>
        </div>
      </div>

      {/* Chart */}
      <div className="mx-auto mb-8 max-w-4xl rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-6 text-center text-3xl font-bold">
          Lead Status Overview
        </h2>

        <div className="h-[320px] w-full min-w-0">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mx-auto mb-8 max-w-4xl rounded-lg bg-white p-6 shadow-lg">
  <h2 className="mb-6 text-center text-3xl font-bold">
    Lead Sources
  </h2>

  <div className="w-full h-[320px] min-w-0">
     <ResponsiveContainer width="100%" height={320}>
    
      <PieChart>
        <Pie
          data={sourceData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label
        >
          {sourceData.map((entry, index) => (
            <Cell
              key={index}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>

        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>
      <div className="mx-auto mb-8 max-w-4xl rounded-lg bg-white p-6 shadow-lg">
  <h2 className="mb-4 text-2xl font-bold">
    📅 Upcoming Follow-ups
  </h2>

  {upcomingFollowUps.length > 0 ? (
    <div className="space-y-3">
      {upcomingFollowUps.map((lead) => (
        <div
          key={lead._id}
          className="flex items-center justify-between rounded border p-3"
        >
          <div>
            <p className="font-semibold">{lead.name}</p>
            <p className="text-sm text-gray-500">
              {lead.company}
            </p>
          </div>

          <span className="text-blue-600">
            {new Date(
              lead.followUpDate
            ).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500">
      No upcoming follow-ups.
    </p>
  )}
</div>

      {/* Search */}
      <div className="mx-auto mb-6 flex max-w-4xl flex-col gap-4 md:flex-row">
  <input
    type="text"
    placeholder="🔍 Search by name or email..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="flex-1 rounded-lg border bg-white p-4 shadow-lg outline-none"
  />

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="rounded-lg border bg-white p-4 shadow-lg"
  >
    <option value="All">All Status</option>
    <option value="New">New</option>
    <option value="Contacted">Contacted</option>
    <option value="Qualified">Qualified</option>
    <option value="Converted">Converted</option>
  </select>

  <button
    onClick={exportCSV}
    className="rounded-lg bg-green-600 px-6 py-4 text-white hover:bg-green-700"
  >
    ⬇️ Export CSV
  </button>
</div>
      

      {/* Form */}
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="rounded border p-3"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="rounded border p-3"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="rounded border p-3"
          />

          <input
            type="text"
            name="company"
            placeholder="Company"
            value={formData.company}
            onChange={handleChange}
            className="rounded border p-3"
          />

          <select
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="rounded border p-3"
          >
            <option>Website</option>
            <option>LinkedIn</option>
            <option>Referral</option>
            <option>Instagram</option>
            <option>Other</option>
          </select>

          <input
            type="date"
            name="followUpDate"
            value={formData.followUpDate}
            onChange={handleChange}
            className="rounded border p-3"
          />

          <textarea
            name="notes"
            placeholder="Add notes..."
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="rounded border p-3 md:col-span-2"
          />

          <button
  type="submit"
  className="rounded bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 md:col-span-2"
>
  {editingId ? "Update Lead" : "Add Lead"}
</button>
{editingId && (
  <button
    type="button"
    onClick={() => {
      setEditingId(null);

      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        source: "Website",
        followUpDate: "",
        notes: "",
      });
    }}
    className="rounded bg-gray-500 p-3 font-semibold text-white hover:bg-gray-600 md:col-span-2"
  >
    Cancel Edit
  </button>
)}
        </form>
      </div>

      {/* Leads List */}
      <div className="mx-auto mt-8 max-w-4xl rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold">Leads</h2>

        <div className="space-y-4">
         {currentLeads.map((lead) => (
            <div
              key={lead._id}
              className="rounded-lg border p-4 shadow-sm"
            >
              <h3 className="text-lg font-bold">{lead.name}</h3>

              <p>{lead.email}</p>

              {lead.company && <p>{lead.company}</p>}
              <p className="text-sm text-gray-400">
  Added: {new Date(lead.createdAt).toLocaleDateString()}
</p>

              <p className="mt-2 text-sm text-gray-500">
                Source: {lead.source}
              </p>
              <p
  className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold text-white ${
    lead.status === "New"
      ? "bg-blue-500"
      : lead.status === "Contacted"
      ? "bg-purple-500"
      : lead.status === "Qualified"
      ? "bg-green-500"
      : "bg-orange-500"
  }`}
>
  {lead.status}
</p>
              <p className="mt-1 text-sm">
  Priority:{" "}
  <span
    className={`font-semibold ${
      lead.priority === "High"
        ? "text-red-500"
        : lead.priority === "Medium"
        ? "text-yellow-500"
        : "text-green-500"
    }`}
  >
    {lead.priority}
  </span>
</p>

              {lead.followUpDate && (
                <p className="mt-2 text-sm text-blue-600">
                  📅 Follow-up:{" "}
                  {new Date(
                    lead.followUpDate
                  ).toLocaleDateString()}
                </p>
              )}

              {lead.notes?.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  📝 {lead.notes[0].text}
                </p>
              )}

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
  <select
    value={lead.status || "New"}
    onChange={(e) =>
      handleStatusChange(lead._id, e.target.value)
    }
    className="w-full rounded border p-2 sm:w-auto"
  >
    <option value="New">New</option>
    <option value="Contacted">Contacted</option>
    <option value="Qualified">Qualified</option>
    <option value="Converted">Converted</option>
  </select>

  <button
    onClick={() => handleEdit(lead)}
    className="w-full rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 sm:w-auto"
  >
    Edit
  </button>

  <button
    onClick={() => handleDelete(lead._id)}
    className="w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 sm:w-auto"
  >
    Delete
  </button>
</div>
            </div>
          ))}
        </div>

        {filteredLeads.length === 0 && (
          <div className="mt-6 text-center">
  <p className="text-5xl">📭</p>
  <p className="mt-2 text-gray-500">
    No leads found.
  </p>
</div>
          
        )}
        {totalPages > 1 && (
  <div className="mt-6 flex items-center justify-center gap-4">
    <button
      onClick={() =>
        setCurrentPage((prev) => Math.max(prev - 1, 1))
      }
      disabled={currentPage === 1}
      className="rounded bg-gray-500 px-4 py-2 text-white disabled:opacity-50"
    >
      Previous
    </button>

    <span className="font-semibold">
      Page {currentPage} of {totalPages}
    </span>

    <button
      onClick={() =>
        setCurrentPage((prev) =>
          Math.min(prev + 1, totalPages)
        )
      }
      disabled={currentPage === totalPages}
      className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
    >
      Next
    </button>
  </div>
)}
      </div>
    </div>
  );
}

export default Dashboard;