"""
Convenience entry point to launch the FastAPI backend server.
Run with:
    python run_backend.py
Or:
    uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
"""
import uvicorn

if __name__ == "__main__":
    print("Starting Adverse Reaction Prediction API on http://127.0.0.1:8000 ...")
    print("Interactive Swagger Documentation available at http://127.0.0.1:8000/docs")
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
