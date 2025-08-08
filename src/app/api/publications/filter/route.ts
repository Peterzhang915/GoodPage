import { NextResponse } from "next/server";
import { getAllPublicationsFormatted } from "@/lib/publications";

// GET /api/publications/filter?ccf=A,B,C&author=Name
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // 解析 CCF 列表：例如 "A,B" -> Set(["A","B"]) (转为大写)
    const ccfRaw = (searchParams.get("ccf") || "").trim();
    const ccfSet = new Set(
      ccfRaw
        ? ccfRaw
            .split(",")
            .map((s) => s.trim().toUpperCase())
            .filter((s) => s === "A" || s === "B" || s === "C")
        : []
    );

    const author = (searchParams.get("author") || "").trim().toLowerCase();

    // 获取所有格式化的出版物（已发布）
    const all = await getAllPublicationsFormatted();

    // 在内存中应用过滤器，简化逻辑并重用格式化逻辑
    const filtered = all.filter((pub) => {
      // CCF 等级过滤器（可选）
      if (ccfSet.size > 0) {
        const rank = (pub.ccf_rank || "").toUpperCase();
        if (!rank || !ccfSet.has(rank as "A" | "B" | "C")) return false;
      }

      // 作者过滤器（可选）
      if (author) {
        const match = (pub.displayAuthors || []).some((a) => {
          if (a.type === "internal") {
            return (
              a.name_en.toLowerCase().includes(author) ||
              (a.name_zh ? a.name_zh.toLowerCase().includes(author) : false)
            );
          }
          return a.text.toLowerCase().includes(author);
        });
        if (!match) return false;
      }

      return true;
    });

    return NextResponse.json({ data: filtered, count: filtered.length });
  } catch (error) {
    console.error("API Error in GET /api/publications/filter:", error);
    return NextResponse.json(
      { error: "Failed to filter publications" },
      { status: 500 }
    );
  }
}


