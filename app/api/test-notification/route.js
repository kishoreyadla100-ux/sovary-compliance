export async function GET(req) {
  const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
  return Response.json({
    status: "test",
    configured: SCRIPT_URL ? "✅ YES" : "❌ NO",
    scriptUrl: SCRIPT_URL ? "Set" : "Not set",
  });
}

export async function POST(req) {
  const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

  if (!SCRIPT_URL) {
    return Response.json({
      success: false,
      error: "GOOGLE_SCRIPT_URL not configured",
    }, { status: 500 });
  }

  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "TEST_CA",
        email: "test@example.com",
        firmName: "Test",
        phone: "9999999999",
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return Response.json({
        success: false,
        error: `Script error ${response.status}`,
      }, { status: response.status });
    }

    const responseData = JSON.parse(responseText);
    return Response.json({
      success: true,
      message: "Test successful",
      result: responseData,
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}