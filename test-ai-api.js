// Simple test for AI API
async function testAI() {
  try {
    console.log("Testing AI API...");
    
    const response = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Tìm khách sạn Đà Lạt' }),
    });

    const data = await response.json();
    
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log("✅ AI API working!");
    } else {
      console.log("❌ AI API error");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testAI();