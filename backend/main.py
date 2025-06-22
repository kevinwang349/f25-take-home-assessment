from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
import requests

app = FastAPI(title="Weather Data System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for weather data
weather_storage: Dict[str, Dict[str, Any]] = {}

class WeatherRequest(BaseModel):
    date: str
    location: str
    notes: Optional[str] = ""

class WeatherResponse(BaseModel):
    id: str

@app.post("/weather", response_model=WeatherResponse)
async def create_weather_request(request: WeatherRequest):
    """
    You need to implement this endpoint to handle the following:
    1. Receive form data (date, location, notes)
    2. Calls WeatherStack API for the location
    3. Stores combined data with unique ID in memory
    4. Returns the ID to frontend
    """
    url = "http://api.weatherstack.com/current"
    key = "dfa61ea90a2bc78f75dd14a004cff2c3"
    params = {
        "access_key": key,
        "query": request.location
    }
    
    response = requests.get(url, params=params)

    if not response.ok:
        print(f"Error: {response.status_code}")
        return { "id": f"ERROR {response.status_code}" }
    
    id = str(len(weather_storage))  # sequential ids
    responseData: dict[str, Any] = response.json()

    # Ensure "success" field is always present
    if responseData.get("success") is None:
        responseData["success"] = True
    
    print(responseData)

    weather_storage[id] = responseData

    return { "id": id }

@app.get("/weather/{weather_id}")
async def get_weather_data(weather_id: str):
    """
    Retrieve stored weather data by ID.
    This endpoint is already implemented for the assessment.
    """
    if weather_id not in weather_storage:
        raise HTTPException(status_code=404, detail="Weather data not found")
    
    return weather_storage[weather_id]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)