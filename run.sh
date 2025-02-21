#!/usr/bin/env bash

# Run backend_one on port 8000
uvicorn hotel_api.app.main:app --reload --port 8001 &

# Run backend_two on port 8001 (or the second backend in its respective folder)
uvicorn langgraph_agent.agent.main:app --reload --port 8000 &

# Wait for both background jobs to finish (i.e., keep the script alive).
wait
