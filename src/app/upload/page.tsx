"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [locationName, setLocationName] = useState<string>("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Lista popularnych lokalizacji
  const popularLocations = [
    "Kraków", "Warszawa", "Gdańsk", "Wrocław", "Poznań", "Łódź", "Szczecin",
    "Fuerteventura", "Teneryfa", "Mallorca", "Ibiza", "Lanzarote",
    "Paryż", "Londyn", "Rzym", "Barcelona", "Madryt", "Amsterdam",
    "Berlin", "Wiedeń", "Praga", "Budapeszt", "Kopenhaga", "Sztokholm",
    "Nowy Jork", "Los Angeles", "San Francisco", "Miami", "Chicago",
    "Tokio", "Seul", "Bangkok", "Singapur", "Hong Kong", "Sydney",
    "Inne..."
  ];

  const [customLocation, setCustomLocation] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setStatus("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("year", year.toString());
    formData.append("locationName", showCustomInput ? customLocation : locationName);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setStatus("✅ Zdjęcie zostało pomyślnie przesłane!");
        setFile(null);
        setLocationName("");
        setCustomLocation("");
        setShowCustomInput(false);
        // Reset file input
        const fileInput = document.getElementById("file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        const errorText = await res.text();
        setStatus(`❌ Błąd: ${errorText}`);
      }
    } catch {
      setStatus("❌ Wystąpił błąd podczas przesyłania pliku");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dodaj nowe zdjęcie
        </h1>
        <p className="text-gray-600">
          Wybierz zdjęcie z komputera, aby dodać je do swojej galerii
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
              Wybierz zdjęcie
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <div className="text-4xl mb-4">📸</div>
                <p className="text-gray-600 mb-2">
                  Kliknij, aby wybrać plik lub przeciągnij go tutaj
                </p>
                <p className="text-sm text-gray-500">
                  Obsługiwane formaty: JPG, PNG, GIF
                </p>
              </label>
            </div>
            {file && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  Wybrany plik: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                Rok
              </label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Lokalizacja
              </label>
              {!showCustomInput ? (
                <select
                  id="location"
                  value={locationName}
                  onChange={(e) => {
                    setLocationName(e.target.value);
                    if (e.target.value === "Inne...") {
                      setShowCustomInput(true);
                      setLocationName("");
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Wybierz lokalizację</option>
                  {popularLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    placeholder="Wpisz nazwę lokalizacji"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomLocation("");
                      setLocationName("");
                    }}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    ← Wróć do listy
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            disabled={loading || !file}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            type="submit"
          >
            {loading ? "Przesyłanie..." : "Prześlij zdjęcie"}
          </button>

          {status && (
            <div className={`p-4 rounded-md ${
              status.includes("✅") 
                ? "bg-green-50 border border-green-200 text-green-700" 
                : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
