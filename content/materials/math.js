import limits from './math/limits.md?raw'
import calculus from './math/calculus.md?raw'
import linearAlgebra from './math/linear-algebra.md?raw'
import probability from './math/probability.md?raw'

export default [
  {
    id: 'limits',
    subject: 'math',
    order: 1,
    title: '极限与连续',
    summary: '七种未定式、等价无穷小、间断点分类，先建立极限题的判断顺序。',
    topics: ['函数极限'],
    books: ['同济《高等数学》', '武忠祥《高等数学辅导讲义》'],
    video: { title: '武忠祥 · 高数强化', kind: 'bilibili', query: '武忠祥 高数 极限 强化课' },
    body: limits,
  },
  {
    id: 'calculus',
    subject: 'math',
    order: 2,
    title: '一元微积分',
    summary: '中值定理、积分方法、面积体积，以及证明题怎么构造辅助函数。',
    topics: ['导数与微分', '定积分', '反常积分', '定积分应用', '一阶微分方程', '二阶微分方程'],
    books: ['同济《高等数学》', '武忠祥《高等数学辅导讲义》'],
    video: { title: '武忠祥 · 高数强化', kind: 'bilibili', query: '武忠祥 高数 中值定理 积分' },
    body: calculus,
  },
  {
    id: 'linear-algebra',
    subject: 'math',
    order: 3,
    title: '线性代数',
    summary: '用秩串起方程组、特征值与二次型，减少“会算但不会判断”。',
    topics: ['行列式', '矩阵的秩', '特征值', '二次型'],
    books: ['李永乐《线性代数辅导讲义》', '同济《线性代数》'],
    video: { title: '李永乐 · 线代', kind: 'bilibili', query: '李永乐 线性代数 考研' },
    body: linearAlgebra,
  },
  {
    id: 'probability',
    subject: 'math',
    order: 4,
    title: '概率论与数理统计',
    summary: '常见分布、数字特征、参数估计与假设检验的基本逻辑。',
    topics: ['正态分布', '随机变量数字特征', '泊松分布', '协方差'],
    books: ['余丙森《概率论与数理统计辅导讲义》', '浙大《概率论与数理统计》'],
    video: { title: '余丙森 · 概率', kind: 'bilibili', query: '余丙森 概率论 考研' },
    body: probability,
  },
]
