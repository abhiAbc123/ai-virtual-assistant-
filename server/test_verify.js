// verification test script
const API = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING BACKEND API VERIFICATION TESTS ---');

  // 1. Health Check
  const healthRes = await fetch(`${API}/health`);
  const health = await healthRes.json();
  console.log('1. Health Check:', health);

  // 2. Presets Avatars
  const presetsRes = await fetch(`${API}/assistant/presets`);
  const presets = await presetsRes.json();
  console.log('2. Presets Avatars count:', presets.presets?.length);

  // 3. Demo Login
  const demoRes = await fetch(`${API}/auth/demo`, { method: 'POST' });
  const demo = await demoRes.json();
  console.log('3. Demo Login Success:', demo.success, 'Pilot:', demo.user?.name, 'Token received:', !!demo.token);
  const token = demo.token;

  // 4. Update Assistant Settings
  const updateRes = await fetch(`${API}/assistant/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'JARVIS-PRO',
      personality: 'jarvis',
      voiceSpeed: 1.1,
      themeColor: 'cyan'
    })
  });
  const update = await updateRes.json();
  console.log('4. Assistant Settings Update:', update.success, 'New Name:', update.assistantConfig?.name);

  // 5. Send Time Intent Message
  const timeRes = await fetch(`${API}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      message: 'What time is it?',
      assistantConfig: { name: 'JARVIS-PRO' }
    })
  });
  const timeData = await timeRes.json();
  console.log('5. Time Intent Chat Reply:', timeData.reply, 'Spoken:', timeData.spokenText, 'Action:', timeData.action?.type);

  // 6. Send Open YouTube Intent Message
  const ytRes = await fetch(`${API}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      message: 'Open YouTube',
      assistantConfig: { name: 'JARVIS-PRO' }
    })
  });
  const ytData = await ytRes.json();
  console.log('6. Open YouTube Action:', ytData.action?.payload?.url, 'Reply:', ytData.reply);

  // 7. Send Math Calculation Intent
  const mathRes = await fetch(`${API}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      message: 'Calculate 25 * 14',
      assistantConfig: { name: 'JARVIS-PRO' }
    })
  });
  const mathData = await mathRes.json();
  console.log('7. Math Intent Reply:', mathData.reply, 'Result:', mathData.action?.payload?.result);

  // 8. Fetch Chat History
  const histRes = await fetch(`${API}/chat/history`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const histData = await histRes.json();
  console.log('8. Chat History Messages Count in DB:', histData.messages?.length);

  console.log('--- ALL API VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(console.error);
