# GameShow (Sankalp - New UI Branch)

Welcome to the **SBNA Game Show** project
This branch focuses on the updated UI design.

### ⚙️ Setup Instructions

Before running the project, make sure you **update the following configuration files**:

---

### 1️⃣ Database Name

- Go to:
  `/backend/src/constants.js`

- Update the database name to match your local or remote MongoDB instance.

Example:

```js
export const DB_NAME = "YourDatabaseNameHere";
```

---

### 2️⃣ API Key

- Go to:
  `/frontend/src/api/config.ts`

- Update the `API_KEY` value with the correct key you will use for API requests.

Example:

```ts
export const defaultHeaders = {
  "Content-Type": "application/json",
  "x-api-key": "your-api-key",
};
```

---

### 📁 Folder Reference

| Folder               | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| `/backend`           | Express backend, MongoDB models                          |
| `/frontend`          | React frontend (New UI branch)                           |
| `/frontend/src/api/` | Holds `config.ts` for API keys and settings              |
| `/backend/src/`      | Holds `constants.js` for DB configs and backend settings |

---

### ✅ Reminders

- Always **check these files** before pushing or running locally.
- Keep your **API keys private** and don’t commit sensitive keys into the repository.
- Update `.env` files if needed, depending on your deployment setup.

---

### 🚀 Run Commands

To run the **frontend**:

```bash
cd frontend
npm install
npm run build
npm start
```

To run the **backend**:

```bash
cd backend
cd src
npm install
npm run dev
```
