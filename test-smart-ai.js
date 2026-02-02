const https = require('http');

async function testSmartAISystem() {
  console.log('🤖 TESTING SMART AI SYSTEM...\n');
  
  const testMessages = [
    "Xin chào",
    "Tìm khách sạn Đà Lạt",
    "Giá phòng bao nhiêu?",
    "Có voucher giảm giá không?",
    "Cách đặt phòng như thế nào?",
    "Du lịch Hà Nội có gì hay?",
    "Khách sạn nào giá rẻ nhất?",
    "Tôi muốn đặt phòng 2 người",
    "Cảm ơn bạn",
    "Tạm biệt"
  ];
  
  try {
    for (let i = 0; i < testMessages.length; i++) {
      const message = testMessages[i];
      console.log(`📝 Test ${i + 1}: "${message}"`);
      
      const response = await makeAIRequest(message);
      
      if (response.success) {
        console.log(`✅ Response received (${response.data.context?.aiModel || 'Unknown Model'})`);
        console.log(`📊 Context: ${response.data.context?.hotelsCount || 0} hotels, ${response.data.context?.vouchersCount || 0} vouchers`);
        
        // Hiển thị một phần response để kiểm tra
        const responseText = response.data.response;
        const preview = responseText.length > 100 ? responseText.substring(0, 100) + '...' : responseText;
        console.log(`💬 Preview: ${preview}`);
        
        // Kiểm tra chất lượng response
        const quality = analyzeResponseQuality(message, responseText);
        console.log(`🎯 Quality Score: ${quality.score}/10 - ${quality.assessment}`);
        
      } else {
        console.log(`❌ Failed: ${response.error}`);
      }
      
      console.log('---\n');
      
      // Delay giữa các request
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('🎉 SMART AI SYSTEM TEST COMPLETED!');
    
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

function analyzeResponseQuality(message, response) {
  let score = 0;
  let issues = [];
  
  // Kiểm tra độ dài phản hồi
  if (response.length > 50) score += 2;
  else issues.push('Response too short');
  
  // Kiểm tra có emoji không
  if (/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(response)) {
    score += 1;
  } else {
    issues.push('No emojis');
  }
  
  // Kiểm tra có thông tin cụ thể không
  if (response.includes('khách sạn') || response.includes('voucher') || response.includes('đặt phòng')) {
    score += 2;
  } else {
    issues.push('No specific information');
  }
  
  // Kiểm tra có hướng dẫn hành động không
  if (response.includes('Bạn muốn') || response.includes('Hãy') || response.includes('có thể')) {
    score += 2;
  } else {
    issues.push('No action guidance');
  }
  
  // Kiểm tra có thông tin liên hệ không
  if (response.includes('1900') || response.includes('hotline') || response.includes('email')) {
    score += 1;
  }
  
  // Kiểm tra tính nhất quán với message
  const lowerMessage = message.toLowerCase();
  const lowerResponse = response.toLowerCase();
  
  if (lowerMessage.includes('xin chào') && lowerResponse.includes('xin chào')) score += 1;
  if (lowerMessage.includes('đà lạt') && lowerResponse.includes('đà lạt')) score += 1;
  if (lowerMessage.includes('giá') && lowerResponse.includes('giá')) score += 1;
  
  let assessment = 'Poor';
  if (score >= 8) assessment = 'Excellent';
  else if (score >= 6) assessment = 'Good';
  else if (score >= 4) assessment = 'Fair';
  
  return { score, assessment, issues };
}

// Run the test
testSmartAISystem().catch(console.error);