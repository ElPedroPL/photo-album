"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function UploadForm() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setStatus("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setStatus("✅ Zdjęcie przesłane pomyślnie!");
        setFile(null);
      } else {
        const error = await res.text();
        setStatus(`❌ Błąd: ${error}`);
      }
    } catch {
      setStatus("❌ Wystąpił błąd podczas przesyłania.");
    }

    setLoading(false);
  };

  if (!session) {
    return <p className="text-gray-500">Zaloguj się, aby przesłać zdjęcie.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg max-w-md mx-auto space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading || !file}
      >
        {loading ? "Wysyłanie..." : "Wyślij zdjęcie"}
      </button>
      {status && <p className="text-sm text-gray-700">{status}</p>}
    </form>
  );
}
