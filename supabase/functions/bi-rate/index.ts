import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BiRateData {
  bi_rate: number;
  deposit_facility: number;
  lending_facility: number;
  meeting_date: string;
}

const FALLBACK: BiRateData = {
  bi_rate: 5.75,
  deposit_facility: 4.75,
  lending_facility: 6.50,
  meeting_date: "22 Juli 2026",
};

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

function extractRate(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1].replace(",", "."));
      if (!isNaN(value)) return value;
    }
  }
  return null;
}

async function scrapeBiRatePage(): Promise<BiRateData | null> {
  try {
    const response = await fetch("https://www.bi.go.id/id/statistik/indikator/bi-rate.aspx", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return null;
    const html = await response.text();

    // The BI-Rate page has a table: | No | Tanggal | BI-Rate | Pranala Siaran Pers |
    // Rows look like: | 1 | 22 Juli 2026 | 5.75 % | Lihat |
    const rowPattern = /\|\s*\d+\s*\|\s*([^|]+?)\s*\|\s*([\d.,]+)\s*%\s*\|/g;
    const matches = [...html.matchAll(rowPattern)];

    if (matches.length === 0) return null;

    const firstMatch = matches[0];
    const meetingDate = firstMatch[1].trim();
    const biRate = parseFloat(firstMatch[2].replace(",", "."));

    if (isNaN(biRate)) return null;

    return {
      bi_rate: biRate,
      deposit_facility: FALLBACK.deposit_facility,
      lending_facility: FALLBACK.lending_facility,
      meeting_date: meetingDate,
    };
  } catch (error) {
    console.error("Error scraping BI-Rate page:", error);
    return null;
  }
}

async function scrapeBiHomepage(data: BiRateData): Promise<BiRateData> {
  try {
    const response = await fetch("https://www.bi.go.id/en/default.aspx", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return data;
    const html = await response.text();

    // The homepage mentions: "Deposit Facility (DF) rate and Lending Facility (LF) rate at X.XX% and Y.YY% respectively"
    const dfRate = extractRate(html, [
      /Deposit Facility[^]*?(\d+\.?\d*)\s*%/i,
      /DF\)?\s*(?:rate)?[^]*?(\d+\.?\d*)\s*%/i,
    ]);

    const lfRate = extractRate(html, [
      /Lending Facility[^]*?(\d+\.?\d*)\s*%/i,
      /LF\)?\s*(?:rate)?[^]*?(\d+\.?\d*)\s*%/i,
    ]);

    return {
      ...data,
      deposit_facility: dfRate ?? data.deposit_facility,
      lending_facility: lfRate ?? data.lending_facility,
    };
  } catch (error) {
    console.error("Error scraping BI homepage:", error);
    return data;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check cache
    const { data: cached, error: cacheError } = await supabase
      .from("bi_rate_cache")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (cacheError) {
      console.error("Cache read error:", cacheError);
    }

    const now = Date.now();
    const cacheAge = cached ? now - new Date(cached.updated_at).getTime() : Infinity;

    // Return cached data if fresh
    if (cached && cacheAge < CACHE_TTL_MS) {
      const result: BiRateData = {
        bi_rate: Number(cached.bi_rate),
        deposit_facility: Number(cached.deposit_facility),
        lending_facility: Number(cached.lending_facility),
        meeting_date: cached.meeting_date,
      };
      return new Response(
        JSON.stringify({ ...result, source: "cache", updated_at: cached.updated_at }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Scrape fresh data
    let freshData: BiRateData | null = await scrapeBiRatePage();

    if (freshData) {
      freshData = await scrapeBiHomepage(freshData);
    } else {
      // Scraping failed — use cached data if available, otherwise fallback
      freshData = cached
        ? {
            bi_rate: Number(cached.bi_rate),
            deposit_facility: Number(cached.deposit_facility),
            lending_facility: Number(cached.lending_facility),
            meeting_date: cached.meeting_date,
          }
        : FALLBACK;
    }

    // Update cache
    const { error: upsertError } = await supabase
      .from("bi_rate_cache")
      .upsert({
        id: 1,
        bi_rate: freshData.bi_rate,
        deposit_facility: freshData.deposit_facility,
        lending_facility: freshData.lending_facility,
        meeting_date: freshData.meeting_date,
        updated_at: new Date().toISOString(),
      });

    if (upsertError) {
      console.error("Cache write error:", upsertError);
    }

    return new Response(
      JSON.stringify({ ...freshData, source: "live", updated_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response(
      JSON.stringify({ ...FALLBACK, source: "fallback", error: "Failed to fetch BI rate" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
