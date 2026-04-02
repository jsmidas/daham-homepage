import { NextResponse } from "next/server";
import { requireAdmin } from "../../lib/auth-guard";
import { supabase } from "../../lib/supabase";

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) ?? "products";

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    // 파일명 생성 (중복 방지)
    const ext = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // Supabase Storage 업로드
    const arrayBuffer = await file.arrayBuffer();
    const { data, error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "업로드에 실패했습니다." }, { status: 500 });
    }

    // 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(data.path);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error("POST /api/upload error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
