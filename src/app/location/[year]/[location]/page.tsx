import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { connectDB } from "@/app/lib/db";
import ImageModel from "@/app/models/image";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Photo {
  _id: string;
  imageUrl: string;
  dateTaken?: Date;
  location?: {
    lat?: number;
    lon?: number;
  };
}

interface LocationPageProps {
  params: {
    year: string;
    location: string;
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return <p>Zaloguj się, aby zobaczyć galerię.</p>;
  }

  await connectDB();

  const { year, location } = params;
  const decodedLocation = decodeURIComponent(location);

  const photos = await ImageModel.find({
    userId: session.user.email,
    year: parseInt(year),
    "location.name": decodedLocation,
  }).sort({ createdAt: -1 });

  if (!photos.length) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-500 flex items-center gap-2"
          >
            ← Powrót do galerii
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {decodedLocation} - {year}
        </h1>
        <p className="text-gray-600">
          {photos.length} zdjęć w tej lokalizacji
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {photos.map((photo: Photo) => (
          <div key={photo._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative w-full h-48">
              <Image
                src={photo.imageUrl}
                alt="Zdjęcie"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 space-y-2">
              {photo.dateTaken && (
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="mr-1">📅</span>
                  {new Date(photo.dateTaken).toLocaleDateString('pl-PL')}
                </p>
              )}
              {photo.location?.lat && photo.location?.lon && (
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="mr-1">📍</span>
                  {photo.location.lat.toFixed(4)}, {photo.location.lon.toFixed(4)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 