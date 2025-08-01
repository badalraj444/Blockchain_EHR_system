# Blockchain_EHR_system

A **Blockchain-based Electronic Health Record (EHR) Management System** leveraging **Hyperledger Besu** for secure and decentralized storage of medical records and **React + Vite** for an interactive client-side interface. The system ensures **data integrity, privacy, and transparency** in healthcare record management.

---

## 🚀 Features

- **Decentralized EHR Management** using **Hyperledger Besu**.
- **Secure & Transparent Data Storage** – immutable blockchain ledger.
- **Smart Contract-based Access Control** for patient data sharing.
- **User-friendly React Frontend** with Vite for fast development.
- **Docker-based Local Deployment** for quick setup.
- **Benchmarking Support** using **Hyperledger Caliper**.

---

## 📌 Project Structure

```
Blockchain_EHR_system/
│
├── backend/           # Hyperledger Besu blockchain network setup & scripts
│   ├── config/        # Besu network configuration & genesis files
│   ├── chainlens/     # Nginx configs for blockchain explorer
│   ├── run.sh         # Script to start the blockchain network
│   ├── docker-compose.yml
│   └── ...
│
├── client/            # React + Vite frontend for the EHR DApp
│   ├── src/components # UI components (DataUpload, DataRetrieval, etc.)
│   ├── package.json
│   └── ...
│
└── README.md          # (You are here)
```

---

## 🛠️ Technology Stack

- **Blockchain:** [Hyperledger Besu](https://besu.hyperledger.org/)
- **Frontend:** React (Vite, JSX, TailwindCSS)
- **Smart Contracts:** Solidity (via Node.js & npm)
- **Containerization:** Docker & Docker Compose
- **Benchmarking:** Hyperledger Caliper

---

## ⚙️ Installation & Setup

### ✅ Prerequisites

Ensure you have the following installed:

- **Docker & Docker Compose**
- **Node.js & npm**
- **Git**

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/Blockchain_EHR_system.git
cd Blockchain_EHR_system
```

### 2️⃣ Start the Blockchain Network

```bash
cd backend
./run.sh
```

Verify running containers:

```bash
docker ps
```

### 3️⃣ Run the Client Application

```bash
cd ../client
npm install
npm run dev
```

Access the app at: **http://localhost:5173**

---

---

## 📜 License

This project is licensed under the MIT License – see the LICENSE file for details.
