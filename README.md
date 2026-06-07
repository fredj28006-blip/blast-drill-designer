# Blast Drill Designer

Advanced application for simulating and optimizing blast drilling parameters in mines and quarries, as well as underground excavation drilling.

## Implemented Methodologies

- **Longfors Method**: For general blast design and fragmentation prediction
- **Kuz-Ram Method**: For rock fragmentation analysis
- **RMSE Method**: For precision in parameter optimization
- **Holmberg-Person Method**: For underground excavation design

## Features

- ✅ Blast parameter simulation
- ✅ Automatic parameter optimization
- ✅ 2D/3D visualization
- ✅ Report generation and export
- ✅ Multi-platform support (Desktop, Mobile, Web)

## Project Structure

```
blast-drill-designer/
├── packages/
│   ├── core/                    # Business logic & methodologies
│   ├── backend/                 # API Server
│   ├── desktop/                 # Desktop Application (Tauri/Electron)
│   ├── mobile/                  # Mobile Application (React Native)
│   └── web/                     # Web Application (React)
├── docs/
└── scripts/
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Develop
pnpm dev

# Build
pnpm build
```

## Technology Stack

- **Core**: TypeScript
- **Backend**: Node.js + Express
- **Desktop**: Tauri + React
- **Mobile**: React Native (Expo)
- **Web**: React + Vite
- **Database**: SQLite/PostgreSQL
- **UI**: Material-UI + Tailwind CSS

## License

MIT

## Contributors

- fredj28006-blip

---

Last Updated: 2026-06-07
