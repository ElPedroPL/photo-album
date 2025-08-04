import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { connectDB } from "@/app/lib/db";
import ImageModel from "@/app/models/image";
import { supabase } from "@/app/lib/supabase";
import * as exifr from "exifr";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return new NextResponse("Brak autoryzacji", { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const year = formData.get("year") as string;
  const locationName = formData.get("locationName") as string;

  if (!file) {
    return new NextResponse("Nie przesłano pliku", { status: 400 });
  }

  if (!year) {
    return new NextResponse("Nie wybrano roku", { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;

  console.log("=== UPLOAD DEBUG INFO ===");
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("Service Role Key length:", process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0);
  console.log("Bucket name:", process.env.SUPABASE_BUCKET);
  console.log("File name:", fileName);
  console.log("File type:", file.type);
  console.log("File size:", buffer.length, "bytes");
  console.log("User:", session.user.email);
  
  // Test if bucket exists
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  console.log("Available buckets:", buckets?.map(b => b.name));
  if (bucketError) {
    console.error("Bucket list error:", bucketError);
  }
  
  const { error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET!)
    .upload(fileName, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });

  if (error) {
    console.error("Supabase upload error:", error);
    return new NextResponse(`Błąd uploadu do Supabase: ${error.message}`, { status: 500 });
  }

  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${fileName}`;

  const exif = await exifr.parse(buffer, { gps: true });
  const dateTaken = exif?.DateTimeOriginal || null;
  const lat = exif?.latitude || null;
  const lon = exif?.longitude || null;

  await connectDB();
  await ImageModel.create({
    userId: session.user.email,
    imageUrl,
    dateTaken,
    year: parseInt(year),
    location: {
      name: locationName || "Nieznana lokalizacja",
      lat: lat || null,
      lon: lon || null,
    },
  });

  return NextResponse.json({ imageUrl, dateTaken, location: { lat, lon } });
}
