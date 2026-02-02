const https = require('http');

async function testLocationSpecificAI() {
  console.log('🎯 TESTING LOCATION-SPECIFIC AI RESPONSES...\n');
  
  const testCases = [
    {
      message: "Khách sạn Đà Lạt gần hồ Xuân Hương",
      expectation: "Chỉ hiển thị khách sạn tại Đà Lạt, không hiển thị Hà Nội"
    },
    {
      message: "Tìm khách sạn ở Hà Nội",
      expectation: "Chỉ hiển thị khách sạn tại Hà Nội, không hiển thị Đà Lạt"
    },
    {
      message: "Khách sạn Nha Trang view biển",
      expectation: "Nói rõ không có khách sạn tại Nha Trang"
    },
    {
      message: "Resort ở Đà Lạt có hồ bơi",
      expectation: "Chỉ thông tin về Đà Lạt"
    },
    {
      message: "Khách sạn giá rẻ ở Hà Nội",
      expectation: "Chỉ khách sạn Hà Nội, không mix với thành phố khác"
    }
  ];
  
  try {
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`📝 Test ${i + 1}: "${testCase.message}"`);
      console.log(`🎯 Expectation: ${testCase.expectation}`);
      
      const response = await makeAIRequest(testCase.message);
      
      if (response.success) {
        const aiModel = response.data.context?.aiModel || 'Unknown';
        console.log(`🤖 AI Model: ${aiModel}`);
        
        const responseText = response.data.response;
        console.log(`💬 Response:\n${responseText}\n`);
        
        // Phân tích response
        const analysis = analyzeLocationResponse(testCase.message, responseText);
        console.log(`📊 Analysis: ${analysis.result}`);
        if (analysis.issues.length > 0) {
          console.log(`⚠️  Issues: ${analysis.issues.join(', ')}`);
        }
        
      } else {
        console.log(`❌ Failed: ${response.error}`);
      }
      
      console.log('=' .repeat(80) + '\n');
      
      // Delay giữa các request
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('🎉 LOCATION-SPECIFIC AI TEST COMPLETED!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

function makeAIRequest(message) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ message });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/ai/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (res.statusCode === 200) {
            resolve({ success: true, data });
          } else {
            resolve({ success: false, error: data.error || 'Unknown error' });
          }
        } catch (error) {
          resolve({ success: false, error: 'Invalid JSON response' });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });
    
    req.write(postData);
    req.end();
  });
}

function analyzeLocationResponse(message, response) {
  const lowerMessage = message.toLowerCase();
  const lowerResponse = response.toLowerCase();
  
  let issues = [];
  let result = 'GOOD';
  
  // Kiểm tra nếu hỏi về Đà Lạt
  if (lowerMessage.includes('đà lạt') || lowerMessage.includes('dalat')) {
    if (lowerResponse.includes('hà nội') || lowerResponse.includes('hanoi')) {
      issues.push('Mentioned Hanoi when asked about Da Lat');
      result = 'POOR';
    }
    if (lowerResponse.includes('nha trang')) {
      issues.push('Mentioned Nha Trang when asked about Da Lat');
      result = 'POOR';
    }
    if (!lowerResponse.includes('đà lạt') && !lowerResponse.includes('dalat')) {
      issues.push('Did not mention Da Lat in response');
      result = 'POOR';
    }
  }
  
  // Kiểm tra nếu hỏi về Hà Nội
  if (lowerMessage.includes('hà nội') || lowerMessage.includes('hanoi')) {
    if (lowerResponse.includes('đà lạt') || lowerResponse.includes('dalat')) {
      issues.push('Mentioned Da Lat when asked about Hanoi');
      result = 'POOR';
    }
    if (lowerResponse.includes('nha trang')) {
      issues.push('Mentioned Nha Trang when asked about Hanoi');
      result = 'POOR';
    }
    if (!lowerResponse.includes('hà nội') && !lowerResponse.includes('hanoi')) {
      issues.push('Did not mention Hanoi in response');
      result = 'POOR';
    }
  }
  
  // Kiểm tra nếu hỏi về Nha Trang (không có trong DB)
  if (lowerMessage.includes('nha trang')) {
    if (!lowerResponse.includes('chưa có') && !lowerResponse.includes('không có')) {
      issues.push('Should mention no hotels available in Nha Trang');
      result = 'POOR';
    }
    if (lowerResponse.includes('đà lạt') || lowerResponse.includes('hà nội')) {
      issues.push('Should not suggest other cities when asked about Nha Trang');
      result = 'POOR';
    }
  }
  
  if (issues.length === 0) {
    result = 'EXCELLENT';
  } else if (issues.length <= 1) {
    result = 'FAIR';
  }
  
  return { result, issues };
}

// Run the test
testLocationSpecificAI().catch(console.error);