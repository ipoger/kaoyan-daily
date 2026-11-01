import dataStructures from './cs408/data-structures.md?raw'
import computerOrganization from './cs408/computer-organization.md?raw'
import operatingSystems from './cs408/operating-systems.md?raw'
import networks from './cs408/networks.md?raw'

export default [
  {
    id: 'data-structures',
    subject: 'cs408',
    order: 1,
    title: '数据结构',
    summary: '用操作代价理解结构，串起栈队列、树、图、排序和哈希。',
    topics: ['栈', '循环队列', '链表', '二叉树遍历', '完全二叉树', '二叉排序树', '平衡二叉树', '图的遍历', '最短路径', '拓扑排序', '排序', 'B 树'],
    books: ['王道《数据结构考研复习指导》', '严蔚敏《数据结构》'],
    video: { title: '王道 · 数据结构', kind: 'bilibili', query: '王道 数据结构 408' },
    body: dataStructures,
  },
  {
    id: 'computer-organization',
    subject: 'cs408',
    order: 2,
    title: '计算机组成原理',
    summary: '补码、IEEE 754、Cache、流水线和性能公式，按计算题组织。',
    topics: ['补码', 'IEEE 754', 'Cache', '流水线', 'CPU 性能', '寻址方式', '存储层次', '总线', 'I/O 方式', 'TLB', 'RISC', 'RAID'],
    books: ['王道《计算机组成原理考研复习指导》', '唐朔飞《计算机组成原理》'],
    video: { title: '王道 · 组成原理', kind: 'bilibili', query: '王道 计算机组成原理 408' },
    body: computerOrganization,
  },
  {
    id: 'operating-systems',
    subject: 'cs408',
    order: 3,
    title: '操作系统',
    summary: '进程状态、调度、同步死锁、分页置换和文件系统。',
    topics: ['进程状态', '进程调度', '信号量', '死锁', '银行家算法', '分页存储', '页面置换', '文件分配', '磁盘调度', 'DMA', '虚拟内存', '文件系统'],
    books: ['王道《操作系统考研复习指导》', '汤小丹《计算机操作系统》'],
    video: { title: '王道 · 操作系统', kind: 'bilibili', query: '王道 操作系统 408' },
    body: operatingSystems,
  },
  {
    id: 'networks',
    subject: 'cs408',
    order: 4,
    title: '计算机网络',
    summary: '分层、TCP/UDP、IP 与子网、可靠传输、拥塞控制和路由。',
    topics: ['OSI 模型', 'UDP', 'IP 分片', '子网划分', 'ARP', 'DNS', 'HTTP', 'TCP 拥塞控制', 'CSMA/CD', '路由协议', 'NAT', 'TLS'],
    books: ['王道《计算机网络考研复习指导》', '谢希仁《计算机网络》'],
    video: { title: '王道 · 计算机网络', kind: 'bilibili', query: '王道 计算机网络 408' },
    body: networks,
  },
]
