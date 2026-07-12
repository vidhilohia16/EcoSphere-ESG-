# 🌐 EcoSphere ESG ERP Engine

EcoSphere is a modern, enterprise-grade **Environmental, Social, and Governance (ESG)** management platform. By integrating directly with simulated Enterprise Resource Planning (ERP) transaction pipelines, it maps operational logs to accurate sustainability impacts, gamifies compliance workflows, issues milestones, and delivers high-impact reporting tools.

The interface is styled using a premium, light-themed green-and-white glassmorphism layout designed to engage users and administrators alike.

---

## 📱 Fully Mobile Responsive Layout

EcoSphere is meticulously designed with a **mobile-first, fluid layout** to ensure frictionless operation on all viewport sizes—ranging from small mobile phone viewports and tablets to high-resolution desktop screens:

- **Collapsible Navigation Sidebar**: Toggles seamlessly between a persistent side-drawer on desktop and a hidden overlay toggle on mobile viewports.
- **Fluid CSS-Grid & Flexbox Mechanics**: Stacks multi-column reports, stats grids, and inputs into single-column vertical cards on compact viewports to prevent overflow.
- **Adaptable Charts & Gauges**: Canvas components (including composite ESG gauges) naturally scale to match container dimensions.
- **Horizontal Overflow Shields**: Avoids layout disruptions by styling audit logging tables with horizontal scroll containers when rendered on smaller viewports.
- **Enhanced Touch Targets**: Interactive menus, select inputs, profile badges, and buttons utilize robust padding and tap space matching modern dynamic UI guidelines.

---

## 🛠️ Core Features & Modules

### 1. 📊 Interactive Dashboard Meter
- Displays a real-time global composite **ESG Score** aggregated from individual Environmental, Social, and Governance parameters.
- Built-in configuration allows admins to adjust composite weights (e.g., 40% E, 30% S, 30% G) and immediately recalculates the company's scores.
- Employs dynamic line and bar charts to illustrate emissions, CSR hours, and compliance trends.

### 2. 🌱 Environmental Sourcing (Carbon Calculator)
- Directly records simulated ERP events (logistics fuel, facility electricity consumption, remote travel).
- Performs automatic carbon footprint calculations based on greenhouse gas emission factors (e.g., Diesel, Petrol, Electricity, Freight).
- Feeds transaction ledgers to log totals dynamically against the company's annual emissions goals.

### 3. 🤝 Social Impact & CSR Registry
- Contains input for registering corporate social responsibility (CSR) activities (hours volunteered, date, description).
- Includes validation mechanics to review, approve, or reject submissions before awarding XP.
- Visualizes Employee Participation percentages and Diversity, Equity, and Inclusion (DEI) metrics.

### 4. 🛡️ Corporate Governance Compliance
- Lists active compliance checklists, corporate safety regulations, and security protocols.
- Enables staff members to acknowledge policies (like Whistleblower Protections or Equal Opportunity Guidelines).
- Tracks compliance issues, audits, and infraction reports.

### 5. 🏆 Gamification Engine (XP Shop)
- Simulates an active workspace by letting you toggle between various employee accounts.
- Automatically grants XP to employees on achievements (e.g., reaching 300 XP logs, completing greenhouse targets, policy signoffs).
- Integrated XP Reward Shop where employees can redeem accrued points for environmental rewards (e.g., Planting a seed, Eco Ceramic Mug). Includes automated inventory tracking.

### 6. 📖 Custom Reports Builder
- Offers multi-dimensional filtering to construct filtered CSV/JSON format outputs.
- Filter by department, specific date ranges, ESG categories, and individual employees.

### 7. ⚙️ Centralized Administration Control
- Complete CRUD interface for managers to configure system variables.
- Add or modify Emission Factors, edit Reward shop inventory, create/remove employees, add new compliance policies, and reset database to default values.

---

## 🚀 Getting Started (Developer Setup)

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18+ recommended)
- `npm` (packaged with Node)

### Installation
1. Clone the repository to your local directory:
   ```bash
   git clone https://github.com/vidhilohia16/EcoSphere-ESG-.git
   cd EcoSphere-ESG-
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```

### Running Locally
To launch development environments, open two terminal windows (or split terminal panes) in the root directory:

*   **Terminal 1 (Backend API Service)**:
    ```bash
    npm run server
    ```
    This launches the Express API listener on `http://localhost:3001/api`.

*   **Terminal 2 (Frontend Client React SPA)**:
    ```bash
    npm run client
    ```
    This launches the Vite Dev server on `http://localhost:5173` and automatically configures a proxy forwarding page API requests directly to port 3001.

---

## 🧪 Running Automated Tests

Verify that backend logic (such as calculations, weight updates, badge triggers, database actions, and inventory redemptions) passes by executing the automated test suite:

```bash
node server/test.js
```
