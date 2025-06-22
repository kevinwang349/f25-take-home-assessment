"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WeatherGetFormData {
  id: string;
}

function formatDateForDisplay(epoch: number): string {
  const date = new Date(epoch);
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    localtime_epoch: number;
  };
  current: {
    temperature: number;
    weather_icons: string[];
    weather_descriptions: string[];
    astro: {
      sunrise: string;
      sunset: string;
      moonrise: string;
      moonset: string;
      moon_phase: string;
    };
    wind_speed: number;
    wind_dir: string;
    pressure: number;
    precip: number;
    humidity: number;
    feelslike: number;
    uv_index: number;
    visibility: number;
    is_day: string;
  }
}

export function WeatherGetForm() {

  const [formData, setFormData] = useState<WeatherGetFormData>({
    id: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    id?: string;
  } | null>(null);

  // For storing and displaying API-fetched weather data
  const [data, setData] = useState<WeatherData | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);
    setData(null);

    try {
      console.log(JSON.stringify(formData));
      const response = await fetch(`http://localhost:8000/weather/${formData.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.error) {
          setResult({
            success: false,
            message: `Error ${responseData.error.code}: ${responseData.error.info}`
          });
        } else {
          setData({
            location: responseData.location,
            current: responseData.current
          });
          setResult({
            success: true,
            message: `Weather data successfully obtained!`
          });
        }
      } else {
        const errorData = await response.json();
        setResult({
          success: false,
          message: errorData.detail || "Failed to submit weather request",
        });
      }
    } catch {
      setResult({
        success: false,
        message: "Network error: Could not connect to the server",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Weather Data Request</CardTitle>
        <CardDescription>
          Get weather data using the ID from a weather data request
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">Request ID</Label>
            <Input
              id="id"
              name="id"
              placeholder="Request ID returned by a weather data request"
              value={formData.id}
              onChange={handleInputChange}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Get Weather Data"}
          </Button>

          {result && (
            <div
              className={`p-3 rounded-md ${
                result.success
                  ? "bg-green-900/20 text-green-500 border border-green-500"
                  : "bg-red-900/20 text-red-500 border border-red-500"
              }`}
            >
              <p className="text-sm font-medium">{result.message}</p>
              {result.success && result.id && (
                <p className="text-xs mt-1">
                  Your weather request ID:{" "}
                  <code className="bg-green-500/20 text-green-400 px-1 rounded">
                    {result.id}
                  </code>
                </p>
              )}
            </div>
          )}

          {/* Displaying weather data */}
          {data && (
            <div id="data">
              <p>Displaying weather in {data.location.name}, {data.location.region}
                , {data.location.country} at {formatDateForDisplay(data.location.localtime_epoch * 1000)}:</p>
              <br></br>
              <span className="text-3xl font-medium">{data.current.temperature}°</span> 
              <span className="text-lg font-medium ml-6">Feels like</span>
              <span className="text-2xl font-medium ml-2">{data.current.feelslike}°</span>
              <br></br>
              <p className="text-xl">{data.current.weather_descriptions[0]}</p>
              <p className="text-lg">Precipitation
                <span className="text-xl ml-3">{data.current.precip} mm</span></p>
              <div id="wind" className="rounded-lg border-2 border-blue-500 bg-blue-900 m-1 p-3">
                <p className="text-base">Wind speed {data.current.wind_speed}</p>
                <p className="text-base">Wind direction {data.current.wind_dir}</p>
              </div>
              { (data.current.is_day == "yes") /* Day version of sunrise/sunse timest */ && (
                <div id="astro" className="rounded-lg border-2 border-blue-500 bg-blue-900 m-1 p-3">
                  <p className="text-sm">Sunrise:  {data.current.astro.sunrise}</p>
                  <p className="text-base">Sunset:  {data.current.astro.sunset}</p>
                  <p className="text-sm">Moonrise:  {data.current.astro.moonrise}</p>
                  <p className="text-sm">Moonset:  {data.current.astro.moonset}</p>
                  <p className="text-sm">Moon:  {data.current.astro.moon_phase}</p>
              </div> )}
              { (data.current.is_day == "no") /* Night version of sunrise/sunset times */ && (
                <div id="astro" className="rounded-lg border-2 border-blue-500 bg-blue-900 m-1 p-3">
                  <p className="text-base">Sunrise:  {data.current.astro.sunrise}</p>
                  <p className="text-sm">Sunset:  {data.current.astro.sunset}</p>
                  <p className="text-sm">Moonrise:  {data.current.astro.moonrise}</p>
                  <p className="text-sm">Moonset:  {data.current.astro.moonset}</p>
                  <p className="text-base">Moon:  {data.current.astro.moon_phase}</p>
              </div> )}
              <p className="text-lg">UV index
                <span className="text-xl ml-3">{data.current.uv_index}</span></p>
              <p className="text-lg">Air pressure
                <span className="text-xl ml-3">{data.current.pressure} hPa</span></p>
              <p className="text-lg">Humidity
                <span className="text-xl ml-3">{data.current.humidity}%</span></p>
              <p className="text-lg">Visibility
                <span className="text-xl ml-3">{data.current.visibility} km</span></p>
              <p></p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
