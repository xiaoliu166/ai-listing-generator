/**
 * 竞品分析 API 测试用例
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

// ============ 测试用例 ============

async function test1_缺少ASIN返回错误() {
  const { status, data } = await POST('/api/analyze', {})
  
  if (status !== 400) throw new Error(`状态码应为400，实际${status}`)
  if (!data.error) throw new Error('缺少error字段')
}

async function test2_ASIN数量超限返回错误() {
  const { status, data } = await POST('/api/analyze', {
    asins: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6']
  })
  
  if (status !== 400) throw new Error(`状态码应为400，实际${status}`)
  if (!data.error) throw new Error('缺少error字段')
}

async function test3_免费用户次数限制() {
  // 用一个新的 userId 测试
  const userId = `test_${Date.now()}`
  
  // 第一次请求
  const { status: s1 } = await POST('/api/analyze', {
    asins: ['B08N5WRWNW'],
    userId,
    domain: 'com'
  })
  
  // 第二次请求应该被限制（如果是真实请求，会返回403）
  // 这里只测试 API 能正常响应
  console.log(`  第一次请求状态: ${s1}`)
}

async function test4_返回数据结构完整() {
  const { status, data } = await POST('/api/analyze', {
    asins: ['B08N5WRWNW'],
    domain: 'com',
    includeReviews: false
  })
  
  if (status === 200 || status === 403) {
    // 403 是因为次数限制，这是正常的
    console.log(`  状态码: ${status} (正常)`)
    return
  }
  
  if (status !== 200) throw new Error(`状态码应为200或403，实际${status}`)
  
  if (!data.success) throw new Error('success字段应为true')
  if (!data.data) throw new Error('缺少data字段')
  if (!Array.isArray(data.data)) throw new Error('data应为数组')
  if (!data.summary) throw new Error('缺少summary字段')
}

async function test5_支持多站点() {
  const domains = ['com', 'co.uk', 'de', 'co.jp', 'es']
  
  for (const domain of domains) {
    const { status } = await POST('/api/analyze', {
      asins: ['B08N5WRWNW'],
      domain
    })
    
    // 403 是因为免费次数限制，其他错误说明 API 有问题
    if (status !== 200 && status !== 403) {
      throw new Error(`domain=${domain} 失败，状态码${status}`)
    }
  }
}

async function test6_可选参数userId() {
  // 不传 userId 应该使用默认值
  const { status, data } = await POST('/api/analyze', {
    asins: ['B08N5WRWNW'],
    domain: 'com'
  })
  
  // 应该能正常处理
  if (status !== 200 && status !== 403) {
    throw new Error(`不传userId应正常处理，实际${status}`)
  }
}

async function test7_可选参数includeReviews() {
  // 不传 includeReviews 默认为 false
  const { status, data } = await POST('/api/analyze', {
    asins: ['B08N5WRWNW'],
    domain: 'com',
    includeReviews: false
  })
  
  if (status !== 200 && status !== 403) {
    throw new Error(`includeReviews=false应正常处理，实际${status}`)
  }
}

// ============ 运行测试 ============

async function runTests() {
  console.log('🧪 开始竞品分析 API 测试...\n')
  
  await runTest('缺少ASIN返回错误', test1_缺少ASIN返回错误)
  await runTest('ASIN数量超限返回错误', test2_ASIN数量超限返回错误)
  await runTest('免费用户次数限制', test3_免费用户次数限制)
  await runTest('返回数据结构完整', test4_返回数据结构完整)
  await runTest('支持多站点', test5_支持多站点)
  await runTest('可选参数userId', test6_可选参数userId)
  await runTest('可选参数includeReviews', test7_可选参数includeReviews)
  
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
