export async function POST(req) {
  try {
    const { name, email, firmName = "", phone = "" } = await req.json();
    const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

    // Validate input
    if (!name || !email) {
      return Response.json(
        { success: false, error: "Name and email required" },
        { status: 400 }
      );
    }

    // Check if script URL is configured
    if (!SCRIPT_URL) {
      console.warn("GOOGLE_SCRIPT_URL not configured in environment variables");
      return Response.json(
        { success: false, error: "Notification service not configured" },
        { status: 500 }
      );
    }

    // Call Google Apps Script
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        firmName: firmName.trim(),
        phone: phone.trim(),
        timestamp: new Date().toISOString(),
      }),
    });

    // Handle response
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Script API error ${response.status}:`, errorText);
      return Response.json(
        { success: false, error: "Failed to send notification" },
        { status: response.status }
      );
    }

    // Parse response
    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      console.error("Failed to parse script response:", parseError);
      return Response.json(
        { success: false, error: "Invalid response from notification service" },
        { status: 500 }
      );
    }

    // Check if script succeeded
    if (!result.success) {
      console.error("Script reported error:", result.error);
      return Response.json(
        { success: false, error: result.error || "Script failed" },
        { status: 500 }
      );
    }

    console.log(`Notification sent for ${name} (${email})`);
    return Response.json({ 
      success: true, 
      message: "Notification sent",
      sentAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Notification route error:", error.message);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req) {
  return Response.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}