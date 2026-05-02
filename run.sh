#!/bin/bash

echo "Starting Backend (FastAPI)..."
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

echo "Starting Frontend (Next.js)..."
cd frontend
npm run dev -- -p 3005 &
FRONTEND_PID=$!
cd ..

echo "Both services are starting..."
echo "Backend is at http://localhost:8000"
echo "Frontend is at http://localhost:3005"
echo "Press Ctrl+C to stop both services."

# Wait for user to terminate
trap "kill $BACKEND_PID $FRONTEND_PID" SIGINT SIGTERM
wait
