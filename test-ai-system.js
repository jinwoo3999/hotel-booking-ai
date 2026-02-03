/**
 * Test script for AI booking system
 * Tests various AI conversation scenarios
 */

const testCases = [
  {
    name: "Greeting Test",
    message: "Xin chào",
    expectedKeywords: ["AI Assistant", "Lumina Stay", "tìm kiếm", "đặt phòng"]
  },
  {
    name: "Location Search - Da Nang",
    message: "Tìm khách sạn ở Đà Nẵng",
    expectedKeywords: ["Đà Nẵng", "khách sạn", "tìm thấy", "đặt phòng"]
  },
  {
    name: "Booking Request with Date",
    message: "Đặt phòng Đà Nẵng ngày mai 2 đêm cho 2 người",
    expectedKeywords: ["đặt phòng", "Đà Nẵng", "ngày mai", "2 đêm", "2 người"]
  },
  {
    name: "Price Check",
    message: "Giá phòng ở Nha Trang",
    expectedKeywords: ["giá", "Nha Trang", "đêm", "sao"]
  },
  {
    name: "Weekend Booking",
    message: "Đặt phòng Hà Nội cuối tuần",
    expectedKeywords: ["Hà Nội", "cuối tuần", "đặt phòng"]
  }
];

async function testAISystem() {
  console.log("🤖 Testing AI Booking System...\n");
  
  for (const testCase of testCases) {
    console.log(`📋 Test: ${testCase.name}`);
    console.log(`💬 Message: "${testCase.message}"`);
    
    try {
      const response = await fetch('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: testCase.message }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Response received (${data.response.length} chars)`);
        
        // Check for expected keywords
        const hasKeywords = testCase.expectedKeywords.some(keyword => 
          data.response.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (hasKeywords) {
          console.log(`✅ Contains expected keywords`);
        } else {
          console.log(`⚠️  Missing expected keywords: ${testCase.expectedKeywords.join(', ')}`);
        }
        
        if (data.actions && data.actions.length > 0) {
          console.log(`🎯 Actions: ${data.actions.map(a => a.type).join(', ')}`);
        }
        
        console.log(`📝 Preview: ${data.response.substring(0, 100)}...`);
      } else {
        console.log(`❌ HTTP Error: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log("─".repeat(50));
  }
  
  console.log("🏁 AI System Test Complete!");
}

// Run tests if this script is executed directly
if (require.main === module) {
  testAISystem().catch(console.error);
}

module.exports = { testAISystem, testCases };