// ─────────────────────────────────────────────────────────────────
// App.js  –  The main dashboard component
//
// HOW IT WORKS (easy to explain in an interview):
//
//  1. We import the employee data (20 rows) from data.js
//  2. We define COLUMN DEFINITIONS – this tells AG Grid what
//     columns to show and how to render each cell
//  3. We have a Search box and a Department filter
//     → These update "rowData" (the data AG Grid displays)
//  4. The top 4 stat cards are calculated from the full dataset
//
// FILES IN THIS PROJECT:
//   src/data.js   → the 20 rows of employee data
//   src/App.js    → this file (main component)
//   src/App.css   → all styles
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
// These 2 lines were missing — this is why grid showed empty
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import employees from "./data";
import "./App.css";

ModuleRegistry.registerModules([AllCommunityModule]);
// AG Grid requires these two CSS files to render the table

// ── Helper: render the Active/Inactive badge in the Status column ──
function StatusBadge({ value }) {
  return (
    <span className={`badge ${value ? "active" : "inactive"}`}>
      {value ? "Active" : "Inactive"}
    </span>
  );
}

// ── Helper: color-code the performance rating ──
function RatingCell({ value }) {
  const cls =
    value >= 4.5 ? "rating-high" :
    value >= 4.0 ? "rating-medium" :
    "rating-low";
  return <span className={cls}>{"★ " + value}</span>;
}

// ── Helper: show each skill as a small purple tag ──
function SkillsCell({ value }) {
  // value is an array like ["React", "Node.js"]
  return (
    <div>
      {value.map((skill) => (
        <span key={skill} className="skill-tag">{skill}</span>
      ))}
    </div>
  );
}

// ── Helper: format salary as $95,000 ──
function SalaryCell({ value }) {
  return <span>${value.toLocaleString()}</span>;
}

// ─────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────

export default function App() {
  // State for the search box text
  const [searchText, setSearchText] = useState("");

  // State for the selected department filter
  const [selectedDept, setSelectedDept] = useState("All");

  // ── COLUMN DEFINITIONS ──
  // Each object = one column in the table
  // "field" must match the key name in data.js
  const columnDefs = useMemo(() => [
    {
      field: "id",
      headerName: "#",
      width: 60,
      sortable: true,
    },
    {
      field: "firstName",
      headerName: "First Name",
      sortable: true,
      width: 120,
    },
    {
      field: "lastName",
      headerName: "Last Name",
      sortable: true,
      width: 120,
    },
    {
      field: "department",
      headerName: "Department",
      sortable: true,
      width: 130,
    },
    {
      field: "position",
      headerName: "Position",
      sortable: true,
      width: 190,
    },
    {
      field: "location",
      headerName: "Location",
      sortable: true,
      width: 130,
    },
    {
      field: "salary",
      headerName: "Salary",
      sortable: true,
      width: 110,
      cellRenderer: SalaryCell, // use our custom formatter
    },
    {
      field: "age",
      headerName: "Age",
      sortable: true,
      width: 80,
    },
    {
      field: "performanceRating",
      headerName: "Rating",
      sortable: true,
      width: 100,
      cellRenderer: RatingCell, // color-coded stars
    },
    {
      field: "projectsCompleted",
      headerName: "Projects",
      sortable: true,
      width: 100,
    },
    {
      field: "hireDate",
      headerName: "Hire Date",
      sortable: true,
      width: 120,
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 110,
      cellRenderer: StatusBadge, // Active / Inactive badge
    },
    {
      field: "skills",
      headerName: "Skills",
      width: 260,
      cellRenderer: SkillsCell, // skill tags
      // Taller row height is set in defaultColDef below
    },
    {
      field: "manager",
      headerName: "Manager",
      sortable: true,
      width: 150,
      // Show "—" if no manager (null means they are top-level)
      valueFormatter: ({ value }) => value ?? "—",
    },
  ], []);

  // ── DEFAULT COLUMN SETTINGS ──
  // These apply to ALL columns unless overridden above
  const defaultColDef = useMemo(() => ({
    resizable: true,   // user can drag column edges to resize
    minWidth: 80,
  }), []);

  // ── GET ALL UNIQUE DEPARTMENTS for the filter dropdown ──
  const departments = useMemo(() => {
    const unique = [...new Set(employees.map((e) => e.department))];
    return ["All", ...unique.sort()];
  }, []);

  // ── FILTER THE DATA based on search + department ──
  // This runs every time searchText or selectedDept changes
  // Search and department filter work INDEPENDENTLY.
  // Typing in search ignores the dropdown. Picking a dept ignores search.
  // This way "smit" always shows all Smiths, regardless of department chosen.
  const filteredData = useMemo(() => {

    // If user is typing in search box, use that
    if (searchText.trim() !== "") {
      const query = searchText.toLowerCase();
      return employees.filter((e) => {
        const fullName = (e.firstName + " " + e.lastName).toLowerCase();
        return (
          fullName.includes(query) ||
          e.position.toLowerCase().includes(query) ||
          e.location.toLowerCase().includes(query) ||
          e.email.toLowerCase().includes(query)
        );
      });
    }

    // If user picked a department, use that
    if (selectedDept !== "All") {
      return employees.filter((e) => e.department === selectedDept);
    }

    // Nothing selected, show all 20
    return employees;

  }, [searchText, selectedDept]);

  // ── STAT CARDS (always calculated from the full 20 rows) ──
  const totalEmployees   = employees.length;
  const activeEmployees  = employees.filter((e) => e.isActive).length;
  const avgSalary        = Math.round(employees.reduce((sum, e) => sum + e.salary, 0) / employees.length);
  const avgRating        = (employees.reduce((sum, e) => sum + e.performanceRating, 0) / employees.length).toFixed(1);

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Top header ── */}
      <div className="header">
        <div>
          <h1>FactWise Employee Dashboard</h1>
          <span>Client-side AG Grid · {employees.length} employees</span>
        </div>
      </div>

      <div className="dashboard">

        {/* ── Stat cards row ── */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total Employees</div>
            <div className="stat-value">{totalEmployees}</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Active</div>
            <div className="stat-value">{activeEmployees}</div>
          </div>
          <div className="stat-card orange">
            <div className="stat-label">Avg. Salary</div>
            <div className="stat-value">${avgSalary.toLocaleString()}</div>
          </div>
          <div className="stat-card red">
            <div className="stat-label">Avg. Rating</div>
            <div className="stat-value">★ {avgRating}</div>
          </div>
        </div>

        {/* ── Table section ── */}
        <div className="table-section">

          {/* Toolbar: title + search + department filter */}
          <div className="toolbar">
            <h2>Employee Records</h2>

            {/* Search box */}
            <input
              className="search-input"
              type="text"
              placeholder="Search name, position, location…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            {/* Department dropdown */}
            <select
              className="filter-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* ── AG Grid table ── */}
          {/*
            ag-theme-alpine  → the visual theme (Alpine looks clean & professional)
            rowData           → the filtered array of employees
            columnDefs        → our column config from above
            rowHeight         → slightly taller rows to fit skill tags
            pagination        → splits rows into pages (10 per page)
          */}
          <div className="grid-wrapper ag-theme-alpine">
            <AgGridReact
              key={filteredData.length + selectedDept + searchText}
              rowData={filteredData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowHeight={52}
              pagination={true}
              paginationPageSize={10}
              animateRows={true}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          FactWise Assessment · Built with React + AG Grid
        </div>

      </div>
    </div>
  );
}