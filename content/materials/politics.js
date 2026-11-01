import marxism from './politics/marxism.md?raw'
import history from './politics/history.md?raw'
import ethics from './politics/ethics-and-current.md?raw'

export default [
  {
    id: 'marxism',
    subject: 'politics',
    order: 1,
    title: '马原',
    summary: '唯物论、辩证法、认识论、唯物史观和政治经济学的主干。',
    topics: ['唯物论', '辩证法', '认识论', '商品与劳动', '剩余价值'],
    books: ['肖秀荣《精讲精练》', '腿姐《冲刺背诵手册》'],
    video: { title: '徐涛 · 马原', kind: 'bilibili', query: '徐涛 考研政治 马原' },
    body: marxism,
  },
  {
    id: 'history',
    subject: 'politics',
    order: 2,
    title: '史纲与毛中特',
    summary: '用三条时间线串近代史、新民主主义革命、社会主义改造与新时代。',
    topics: ['新民主主义革命', '新时代主要矛盾', '新发展理念', '中国式现代化'],
    books: ['肖秀荣《精讲精练》', '腿姐《冲刺背诵手册》'],
    video: { title: '腿姐 · 史纲', kind: 'bilibili', query: '腿姐 考研政治 史纲' },
    body: history,
  },
  {
    id: 'ethics-and-current',
    subject: 'politics',
    order: 3,
    title: '思修与形势政策',
    summary: '人生观、中国精神、社会主义核心价值观，以及时政题的三条线。',
    topics: ['全过程人民民主', '人类命运共同体', '宪法'],
    books: ['肖秀荣《精讲精练》', '腿姐《冲刺背诵手册》'],
    video: { title: '腿姐 · 思修与时政', kind: 'bilibili', query: '腿姐 考研政治 思修 时政' },
    body: ethics,
  },
]
