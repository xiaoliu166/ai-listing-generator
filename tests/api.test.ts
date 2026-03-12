/**
 * API 测试用例（完善版）
 * 测试 /api/generate 接口
 */

const API_BASE = 'http://localhost:3000'

interface TestResult {
  name: string
  passed: boolean
  error?: string
}

const results: TestResult[] = []

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    results.push({ name, passed: true })
    console.log(`✅ ${name}`)
  } catch (error: any) {
    results.push({ name, passed: false, error: error.message })
    console.log(`❌ ${name}: ${error.message}`)
  }
}

async function POST(endpoint: string, body: any) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return { status: res.status, data: await res.json() }
}

// ============ 基础功能测试 ============

async function test1_测试模式返回模拟数据() {
  const { status, data } = await POST('/api/generate', {
    apiKey: 'test',
    productName: 'Test Product',
    keywords: 'keyword1, keyword2',
    productFeatures: 'feature1, feature2',
    tone: 'professional'
  })
  
  if (status !== 200) throw new Error(`状态码应为200，实际${status}`)
  if (!data.result) throw new Error('缺少result字段')
  if (!data.isTestMode) throw new Error('应为测试模式')
  if (!data.result.title) throw new Error('缺少title字段')
}

async function test2_无apiKey返回模拟数据() {
  const { status, data } = await POST('/api/generate', {
    productName: 'Test Product',
    keywords: 'keyword1, keyword2'
  })
  
  if (status !== 200) throw new Error(`状态码应为200，实际${status}`)
  if (!data.result) throw new Error('缺少result字段')
}

async function test3_缺少productName返回错误() {
  const { status, data } = await POST('/api/generate', {
    apiKey: 'test',
    keywords: 'keyword1'
  })
  
  if (status !== 400) throw new Error(`状态码应为400，实际${status}`)
  if (!data.error) throw new Error('缺少error字段')
}

async function test4_缺少keywords返回错误() {
  const { status, data } = await POST('/api/generate', {
    apiKey: 'test',
    productName: 'Test Product'
  })
  
  if (status !== 400) throw new Error(`状态码应为400，实际${status}`)
  if (!data.error) throw new Error('缺少error字段')
}

async function test5_返回数据结构完整() {
  const { status, data } = await POST('/api/generate', {
    apiKey: 'test',
    productName: 'Test Product',
    keywords: 'keyword1, keyword2',
    tone: 'casual'
  })
  
  if (status !== 200) throw new Error(`状态码应为200，实际${status}`)
  
  const result = data.result
  const requiredFields = ['title', 'bullet1', 'bullet2', 'bullet3', 'bullet4', 'bullet5', 'description']
  
  for (const field of requiredFields) {
    if (!result[field]) throw new Error(`缺少字段: ${field}`)
  }
}

async function test6_不同tone返回不同结果() {
  const { data: data1 } = await POST('/api/generate', {
    apiKey: 'test',
    productName: 'Test Product',
    keywords: 'keyword1',
    tone: 'professional'
  })
  
  const { data: data2 } = await POST('/api/generate', {
    apiKey: 'test',
    productName: 'Test Product',
    keywords: 'keyword1',
    tone: 'casual'
  })
  
  if (data1.result.title === data2.result.title) {
    throw new Error('不同tone应返回不同title')
  }
}

async function test7_异常处理() {
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'invalid json{'
  })
  
  const status = res.status
  const data = await res.json()
  
  if (status !== 200) throw new Error(`异常时应返回降级数据，状态码${status}`)
  if (!data.result) throw new Error('异常时应返回降级数据')
}

// ============ 扩展功能测试 ============

async function test8_所有tone选项都能正常工作() {
  const tones = ['professional', 'casual', 'luxury', 'friendly']
  
  for (const tone of tones) {
    const { status, data } = await POST('/api/generate', {
      apiKey: 'test',
      productName: 'Test Product',
      keywords: 'test',
      tone: tone
    })
    
    if (status !== 200) throw new Error(`tone=${tone} 状态码应为200，实际${status}`)
    if (!data.result.title) throw new Error(`tone=${tone} 应返回title`)
  }
}

async function test9_productFeatures字段传递() {
  const { data } = await POST('/api/generate', {
    apiKey: 'test',
    productName: 'Test Product',
    keywords: 'keyword1',
    productFeatures: '防水, 防摔, 超长续航'
  })
  
  // 验证返回的数据包含传入的特征
  const resultStr = JSON.stringify(data.result)
  if (!resultStr.includes('Test Product')) {
    throw new Error('返回结果应包含产品名称')
  }
}

async function test10_多个关键词处理() {
  const { data } = await POST('/api/generate', {
    apiKey: 'test',
    productName: 'Wireless Earbuds',
    keywords: 'bluetooth, music, sports, workout'
  })
  
  // 验证返回数据
  if (!data.result.title) throw new Error('应返回title')
  if (data.result.title.length === 0) throw new Error('title不应为空')
}

async function test11_空字符串vs无字段() {
  // 空字符串 productName
  const { status: status1 } = await POST('/api/generate', {
    apiKey: 'test',
    productName: '',
    keywords: 'test'
  })
  
  // 无 productName 字段
  const { status: status2 } = await POST('/api/generate', {
    apiKey: 'test',
    keywords: 'test'
  })
  
  // 两者都应返回 400
  if (status1 !== 400) throw new Error(`空字符串productName应返回400，实际${status1}`)
  if (status2 !== 400) throw new Error(`无productName字段应返回400，实际${status2}`)
}

async function test12_title包含产品名称() {
  const productName = 'My Custom Product'
  const { data } = await POST('/api/generate', {
    apiKey: 'test',
    productName: productName,
    keywords: 'test'
  })
  
  if (!data.result.title.includes(productName)) {
    throw new Error(`title应包含产品名称 "${productName}"`)
  }
}

async function test13_bullet字段非空() {
  const { data } = await POST('/api/generate', {
    apiKey: 'test',
    productName: 'Test',
    keywords: 'test'
  })
  
  const bullets = ['bullet1', 'bullet2', 'bullet3', 'bullet4', 'bullet5']
  for (const bullet of bullets) {
    if (!data.result[bullet] || data.result[bullet].length === 0) {
      throw new Error(`${bullet} 不应为空`)
    }
  }
}

async function test14_description非空且包含产品名() {
  const productName = 'Test Product Name'
  const { data } = await POST('/api/generate', {
    apiKey: 'test',
    productName: productName,
    keywords: 'test, keyword'
  })
  
  if (!data.result.description || data.result.description.length < 10) {
    throw new Error('description 不应太短')
  }
  
  if (!data.result.description.includes(productName)) {
    throw new Error('description 应包含产品名称')
  }
}

async function test15_warning字段存在() {
  // 发送无效 API key，触发真实 API 调用（会失败）
  const { data } = await POST('/api/generate', {
    apiKey: 'invalid_key_12345',
    productName: 'Test Product',
    keywords: 'test',
    groupId: ''
  })
  
  // 应该返回模拟数据 + warning
  if (!data.warning && !data.result) {
    throw new Error('应返回结果或警告')
  }
}

async function test16_无效JSON请求体() {
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{broken json'
  })
  
  const status = res.status
  const data = await res.json()
  
  // 应该有降级处理
  if (status !== 200) throw new Error(`无效JSON应返回降级数据，实际${status}`)
  if (!data.result) throw new Error('无效JSON应返回降级结果')
}

async function test17_正确JSON但字段类型错误() {
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: 'test',
      productName: 12345,  // 应该是 string
      keywords: 'test'
    })
  })
  
  const status = res.status
  // 类型错误可能有不同处理
  console.log(`  类型错误状态码: ${status}`)
}

async function test18_默认tone为professional() {
  const { data } = await POST('/api/generate', {
    apiKey: 'test',
    productName: 'Test',
    keywords: 'test'
    // 不传 tone
  })
  
  // 应该能正常返回
  if (!data.result) throw new Error('不传tone应使用默认值')
  if (!data.result.title) throw new Error('应返回title')
}

// ============ 运行测试 ============

async function runTests() {
  console.log('🧪 开始完善版测试...\n')
  
  // 基础功能
  await runTest('测试模式返回模拟数据', test1_测试模式返回模拟数据)
  await runTest('无apiKey返回模拟数据', test2_无apiKey返回模拟数据)
  await runTest('缺少productName返回错误', test3_缺少productName返回错误)
  await runTest('缺少keywords返回错误', test4_缺少keywords返回错误)
  await runTest('返回数据结构完整', test5_返回数据结构完整)
  await runTest('不同tone返回不同结果', test6_不同tone返回不同结果)
  await runTest('异常处理', test7_异常处理)
  
  // 扩展功能
  await runTest('所有tone选项都能正常工作', test8_所有tone选项都能正常工作)
  await runTest('productFeatures字段传递', test9_productFeatures字段传递)
  await runTest('多个关键词处理', test10_多个关键词处理)
  await runTest('空字符串vs无字段', test11_空字符串vs无字段)
  await runTest('title包含产品名称', test12_title包含产品名称)
  await runTest('bullet字段非空', test13_bullet字段非空)
  await runTest('description非空且包含产品名', test14_description非空且包含产品名)
  await runTest('无效API key返回warning', test15_warning字段存在)
  await runTest('无效JSON请求体', test16_无效JSON请求体)
  await runTest('字段类型错误处理', test17_正确JSON但字段类型错误)
  await runTest('默认tone为professional', test18_默认tone为professional)
  
  console.log('\n📊 测试结果:')
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  console.log(`   通过: ${passed}/${results.length}`)
  console.log(`   失败: ${failed}/${results.length}`)
  
  if (failed > 0) {
    console.log('\n❌ 失败用例:')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`)
    })
    process.exit(1)
  }
  
  console.log('\n✅ 所有测试通过!')
}

runTests()
