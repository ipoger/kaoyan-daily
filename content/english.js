/**
 * 英语 starter 题库（24 天）。
 * 句子为原创，模仿考研英语一长难句的密度与话题，不直接摘录真题原文。
 * 每题先给出带空的原句，提交后再看完整译文、语法点与词汇。
 */
export default [
  {
    id: 'eng-001',
    subject: 'english',
    topic: '长难句 · 定语从句',
    difficulty: 2,
    type: 'choice',
    passage:
      'The assumption that economic growth will automatically improve public welfare has been challenged by a growing body of evidence, ____ suggests that the benefits of growth are often unevenly distributed.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['which', 'what', 'that', 'where'],
    answer: 0,
    explanation:
      '逗号后是非限制性定语从句，先行词是 evidence，which 在从句中作主语。that 不能引导非限制性定语从句；what 前不能再有先行词；where 是关系副词，不能作主语。',
    translation:
      '经济增长会自动改善公共福利这一假设，正受到越来越多证据的挑战；这些证据表明，增长的收益往往分配不均。',
    vocab: [
      { word: 'assumption', meaning: 'n. 假设，假定' },
      { word: 'welfare', meaning: 'n. 福利，福祉' },
      { word: 'unevenly', meaning: 'adv. 不均匀地' },
    ],
    source: '原创',
  },
  {
    id: 'eng-002',
    subject: 'english',
    topic: '长难句 · 倒装',
    difficulty: 3,
    type: 'choice',
    passage:
      'Not until scientists began to map the deep ocean ____ the extent to which human activity had already altered even the most remote ecosystems.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['they realized', 'did they realize', 'they had realized', 'had they realized'],
    answer: 1,
    explanation:
      'Not until 位于句首时，主句要部分倒装：助动词 did 提前，实义动词还原为原形 realize。until 从句用一般过去时，主句用一般过去时即可。',
    translation:
      '直到科学家开始绘制深海地图，他们才意识到人类活动已经把即使最偏远的生态系统改变到了何种程度。',
    vocab: [
      { word: 'map', meaning: 'v. 绘制……的地图；详细研究' },
      { word: 'extent', meaning: 'n. 程度，范围' },
      { word: 'remote', meaning: 'adj. 偏远的，遥远的' },
    ],
    source: '原创',
  },
  {
    id: 'eng-003',
    subject: 'english',
    topic: '长难句 · 分词作状语',
    difficulty: 2,
    type: 'choice',
    passage:
      '____ with rising housing costs and stagnant wages, many young professionals are postponing marriage and children, a trend that demographers say could reshape the country’s future.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['Faced', 'Facing', 'To face', 'Having faced'],
    answer: 0,
    explanation:
      'be faced with 表示“面对”，过去分词短语 Faced with... 作原因状语。Facing 后面直接接宾语，不能接 with；To face 表目的，Having faced 强调动作已完成，均不合语境。',
    translation:
      '面对不断上涨的住房成本和停滞不前的工资，许多年轻职场人正在推迟结婚和生育；人口学家认为，这一趋势可能重塑国家的未来。',
    vocab: [
      { word: 'stagnant', meaning: 'adj. 停滞的，不发展的' },
      { word: 'postpone', meaning: 'v. 推迟，延期' },
      { word: 'demographer', meaning: 'n. 人口学家' },
    ],
    source: '原创',
  },
  {
    id: 'eng-004',
    subject: 'english',
    topic: '长难句 · 主谓一致',
    difficulty: 2,
    type: 'choice',
    passage:
      'The number of students choosing to study abroad ____ steadily over the past decade, despite rising tuition and tighter visa rules.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['has risen', 'have risen', 'rose', 'rise'],
    answer: 0,
    explanation:
      '主语中心词是 The number（数量），谓语用单数；over the past decade 表示从过去持续到现在，用现在完成时。注意 a number of students 才是“许多学生”，谓语用复数。',
    translation:
      '尽管学费上涨、签证规定收紧，过去十年选择出国留学的学生人数仍在稳步上升。',
    vocab: [
      { word: 'tuition', meaning: 'n. 学费' },
      { word: 'steadily', meaning: 'adv. 稳定地，持续地' },
      { word: 'tight', meaning: 'adj. 严格的，收紧的' },
    ],
    source: '原创',
  },
  {
    id: 'eng-005',
    subject: 'english',
    topic: '长难句 · 虚拟语气',
    difficulty: 2,
    type: 'choice',
    passage:
      'If the city ____ more attention to maintaining its drainage system, last summer’s floods might have been less severe.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['paid', 'had paid', 'has paid', 'would pay'],
    answer: 1,
    explanation:
      '主句是 might have been，表示对过去的虚拟；if 从句应用过去完成时 had paid。完整结构为：If + had done, ... might have done。',
    translation:
      '如果这座城市当初更重视排水系统的维护，去年夏天洪水造成的破坏本可能轻一些。',
    vocab: [
      { word: 'drainage', meaning: 'n. 排水系统' },
      { word: 'severe', meaning: 'adj. 严重的，剧烈的' },
      { word: 'maintain', meaning: 'v. 维护，保养' },
    ],
    source: '原创',
  },
  {
    id: 'eng-006',
    subject: 'english',
    topic: '长难句 · 让步',
    difficulty: 1,
    type: 'choice',
    passage:
      '____ the importance of sleep, many students still sacrifice it for an extra hour of revision.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['Despite', 'Although', 'Because of', 'Given'],
    answer: 0,
    explanation:
      '空格后是名词短语 the importance of sleep，且前后为转折关系，用介词 Despite。Although 后必须接完整句子；Because of 表原因；Given 表“考虑到”，逻辑相反。',
    translation:
      '尽管睡眠很重要，许多学生仍然牺牲睡眠来多复习一个小时。',
    vocab: [
      { word: 'sacrifice', meaning: 'v. 牺牲，舍弃' },
      { word: 'revision', meaning: 'n. 复习，温习' },
      { word: 'despite', meaning: 'prep. 尽管' },
    ],
    source: '原创',
  },
  {
    id: 'eng-007',
    subject: 'english',
    topic: '长难句 · 比较结构',
    difficulty: 2,
    type: 'choice',
    passage:
      'The more carefully a hypothesis is tested, ____ likely it is that false conclusions will be accepted as fact.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['the less', 'the least', 'less', 'least'],
    answer: 0,
    explanation:
      '“the + 比较级，the + 比较级”表示“越……越……”。前半句是 The more carefully，后半句必须用 the less 与 it is 构成 the less likely it is。',
    translation:
      '一个假设被检验得越仔细，错误结论被当作事实接受的可能性就越小。',
    vocab: [
      { word: 'hypothesis', meaning: 'n. 假设，假说' },
      { word: 'conclusion', meaning: 'n. 结论' },
      { word: 'accept', meaning: 'v. 接受，认可' },
    ],
    source: '原创',
  },
  {
    id: 'eng-008',
    subject: 'english',
    topic: '长难句 · 定语从句',
    difficulty: 2,
    type: 'choice',
    passage:
      'Universities are under pressure to prove that their degrees are worth the money, ____ has led some to publish detailed data on graduate salaries.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['which', 'that', 'what', 'it'],
    answer: 0,
    explanation:
      'which 引导非限制性定语从句，指代前面“大学被要求证明学位值回学费”整件事，并在从句中作主语。that 不能引导非限制性定语从句；what 不能有先行内容；it 会造成两个句子并列却无连词。',
    translation:
      '大学面临压力，要证明自己的学位物有所值；这促使一些大学公布毕业生薪资的详细数据。',
    vocab: [
      { word: 'under pressure', meaning: '处于压力之下' },
      { word: 'graduate', meaning: 'n. 毕业生；adj. 研究生的' },
      { word: 'detailed', meaning: 'adj. 详细的' },
    ],
    source: '原创',
  },
  {
    id: 'eng-009',
    subject: 'english',
    topic: '长难句 · 强调句',
    difficulty: 2,
    type: 'choice',
    passage:
      'It is not the amount of time spent studying but the quality of attention ____ largely determines how much students learn.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['that', 'which', 'what', 'it'],
    answer: 0,
    explanation:
      '这是强调句 It is ... that ...，被强调部分是 not the amount of time ... but the quality of attention。强调句连接词用 that（指人时也可用 who），不能用 which/what。',
    translation:
      '决定学生学习效果的，主要不是花在学习上的时间多少，而是注意力的质量。',
    vocab: [
      { word: 'attention', meaning: 'n. 注意力' },
      { word: 'determine', meaning: 'v. 决定，影响' },
      { word: 'largely', meaning: 'adv. 主要地，在很大程度上' },
    ],
    source: '原创',
  },
  {
    id: 'eng-010',
    subject: 'english',
    topic: '长难句 · 倒装',
    difficulty: 3,
    type: 'choice',
    passage:
      'No sooner ____ the lecture than the fire alarm went off, forcing everyone to leave the hall.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: [
      'had the professor begun',
      'the professor had begun',
      'did the professor begin',
      'the professor began',
    ],
    answer: 0,
    explanation:
      'No sooner ... than ... 表示“一……就……”。No sooner 置于句首时主句部分倒装，且主句用过去完成时：had + 主语 + begun。',
    translation:
      '教授刚开始讲课，火警就响了，所有人被迫离开大厅。',
    vocab: [
      { word: 'lecture', meaning: 'n. 讲座，讲课' },
      { word: 'go off', meaning: '（警报等）响起' },
      { word: 'force', meaning: 'v. 迫使' },
    ],
    source: '原创',
  },
  {
    id: 'eng-011',
    subject: 'english',
    topic: '长难句 · 非谓语',
    difficulty: 2,
    type: 'choice',
    passage:
      'The new regulations, intended to protect consumers, have been criticized for ____ small businesses with unnecessary paperwork.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['burdening', 'burden', 'to burden', 'burdened'],
    answer: 0,
    explanation:
      'for 是介词，后面接动名词 burdening。be criticized for doing sth. 表示“因做某事而受批评”。intended to protect consumers 是过去分词短语作后置定语。',
    translation:
      '这些旨在保护消费者的新规，因给小微企业增加不必要的文书负担而受到批评。',
    vocab: [
      { word: 'regulation', meaning: 'n. 规章，法规' },
      { word: 'burden', meaning: 'v. 使负担；n. 负担' },
      { word: 'paperwork', meaning: 'n. 文书工作' },
    ],
    source: '原创',
  },
  {
    id: 'eng-012',
    subject: 'english',
    topic: '长难句 · 让步',
    difficulty: 1,
    type: 'choice',
    passage:
      'The company’s profits fell sharply last year, ____ its investment in research and development actually increased.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['even though', 'as if', 'so that', 'in case'],
    answer: 0,
    explanation:
      '前后是“利润下降”与“研发投入增加”的对比，用 even though 引导让步状语从句。as if 表“好像”；so that 表结果/目的；in case 表“以防”。',
    translation:
      '尽管这家公司去年在研发上的投入实际上增加了，其利润却大幅下降。',
    vocab: [
      { word: 'profit', meaning: 'n. 利润' },
      { word: 'sharply', meaning: 'adv. 急剧地' },
      { word: 'investment', meaning: 'n. 投资，投入' },
    ],
    source: '原创',
  },
  {
    id: 'eng-013',
    subject: 'english',
    topic: '长难句 · 倒装',
    difficulty: 3,
    type: 'choice',
    passage:
      'Only after the data had been analyzed ____ that the two groups differed in ways no one had predicted.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: [
      'did the researchers realize',
      'the researchers realized',
      'had the researchers realized',
      'the researchers had realized',
    ],
    answer: 0,
    explanation:
      'Only + 状语（after 从句）置于句首时，主句部分倒装。主句动作发生在分析之后，用一般过去时，故为 did the researchers realize。',
    translation:
      '只有在数据被分析之后，研究人员才意识到，两组之间的差异方式无人预料到。',
    vocab: [
      { word: 'analyze', meaning: 'v. 分析' },
      { word: 'differ', meaning: 'v. 不同，有差异' },
      { word: 'predict', meaning: 'v. 预测' },
    ],
    source: '原创',
  },
  {
    id: 'eng-014',
    subject: 'english',
    topic: '长难句 · 代词与省略',
    difficulty: 3,
    type: 'choice',
    passage:
      'The proposal was rejected not because it was too expensive but because it failed to address the needs of ____ it was intended to help.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['those', 'them', 'who', 'whoever'],
    answer: 0,
    explanation:
      'those 作介词 of 的宾语，同时是后面省略了关系代词 whom 的定语从句的先行词：those (whom) it was intended to help。them 不能接定语从句；who 不能作介词宾语；whoever 语义不符。',
    translation:
      '这项提案被否决，不是因为它太昂贵，而是因为它未能满足那些本应受助者的需求。',
    vocab: [
      { word: 'proposal', meaning: 'n. 提案，建议' },
      { word: 'address', meaning: 'v. 解决，处理' },
      { word: 'intend', meaning: 'v. 打算，旨在' },
    ],
    source: '原创',
  },
  {
    id: 'eng-015',
    subject: 'english',
    topic: '长难句 · 介词短语',
    difficulty: 2,
    type: 'choice',
    passage:
      '____ the possibility of failure, the team decided to proceed with the experiment.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['Given', 'Giving', 'To give', 'Give'],
    answer: 0,
    explanation:
      'Given 在这里是介词，表示“考虑到，鉴于”，后接名词短语。Giving 是现在分词，表主动；To give 表目的；Give 是动词原形，均不能引导这个状语。',
    translation:
      '考虑到失败的可能性，团队仍决定继续这项实验。',
    vocab: [
      { word: 'possibility', meaning: 'n. 可能性' },
      { word: 'proceed', meaning: 'v. 继续进行' },
      { word: 'experiment', meaning: 'n. 实验' },
    ],
    source: '原创',
  },
  {
    id: 'eng-016',
    subject: 'english',
    topic: '长难句 · 转折',
    difficulty: 1,
    type: 'choice',
    passage:
      'The study’s findings are consistent with earlier research, ____ they also raise questions about how the data were collected.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['but', 'so', 'for', 'or'],
    answer: 0,
    explanation:
      '前半句说“与早期研究一致”，后半句说“也提出质疑”，语义转折，用 but。so 表结果；for 表原因；or 表选择。',
    translation:
      '这项研究的发现与早期研究一致，但它们也对数据的收集方式提出了疑问。',
    vocab: [
      { word: 'consistent', meaning: 'adj. 一致的' },
      { word: 'raise questions', meaning: '提出疑问' },
      { word: 'data', meaning: 'n. 数据' },
    ],
    source: '原创',
  },
  {
    id: 'eng-017',
    subject: 'english',
    topic: '长难句 · 时态',
    difficulty: 2,
    type: 'choice',
    passage:
      'By the time the vaccine became widely available, the virus ____ to several new variants.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['had mutated', 'has mutated', 'mutated', 'would mutate'],
    answer: 0,
    explanation:
      'By the time + 一般过去时，主句表示“到那时为止已经发生”，用过去完成时 had mutated。',
    translation:
      '等到疫苗广泛可用时，病毒已经变异出好几个新变种。',
    vocab: [
      { word: 'vaccine', meaning: 'n. 疫苗' },
      { word: 'mutate', meaning: 'v. 变异' },
      { word: 'variant', meaning: 'n. 变体，变种' },
    ],
    source: '原创',
  },
  {
    id: 'eng-018',
    subject: 'english',
    topic: '长难句 · 虚拟语气',
    difficulty: 2,
    type: 'choice',
    passage:
      'The professor insisted that every student ____ a draft before the final paper was due.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['submit', 'submits', 'submitted', 'has submitted'],
    answer: 0,
    explanation:
      'insist 表示“坚持要求”时，that 从句用虚拟语气 (should) + 动词原形，should 可省略，故用 submit。若 insist 表示“坚持说”，则用陈述语气。',
    translation:
      '教授坚持要求每位学生在期末论文截止前提交一份初稿。',
    vocab: [
      { word: 'insist', meaning: 'v. 坚持，坚决要求' },
      { word: 'draft', meaning: 'n. 草稿，初稿' },
      { word: 'due', meaning: 'adj. 到期的，截止的' },
    ],
    source: '原创',
  },
  {
    id: 'eng-019',
    subject: 'english',
    topic: '长难句 · 介词',
    difficulty: 1,
    type: 'choice',
    passage:
      'The city’s air quality has improved significantly ____ the introduction of stricter emission standards.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['since', 'for', 'during', 'while'],
    answer: 0,
    explanation:
      'since + 名词短语表示“自从……以来”，常与现在完成时连用。for 后接时间段；during 强调在某个时期之内；while 后接从句。',
    translation:
      '自从实施更严格的排放标准以来，这座城市的空气质量已显著改善。',
    vocab: [
      { word: 'emission', meaning: 'n. 排放，排放物' },
      { word: 'standard', meaning: 'n. 标准' },
      { word: 'significantly', meaning: 'adv. 显著地' },
    ],
    source: '原创',
  },
  {
    id: 'eng-020',
    subject: 'english',
    topic: '长难句 · 让步',
    difficulty: 2,
    type: 'choice',
    passage:
      '____ the risks involved, the treatment remains the best option available for patients with this rare condition.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['Despite', 'Although', 'Because', 'Unless'],
    answer: 0,
    explanation:
      '空格后是名词短语 the risks involved，且前后为让步关系，用 Despite。Although 后接从句；Because 表原因；Unless 表“除非”。',
    translation:
      '尽管存在相关风险，这种疗法仍是这类罕见病患者目前最好的选择。',
    vocab: [
      { word: 'involved', meaning: 'adj. 涉及的，伴随的' },
      { word: 'treatment', meaning: 'n. 治疗，疗法' },
      { word: 'rare', meaning: 'adj. 罕见的' },
    ],
    source: '原创',
  },
  {
    id: 'eng-021',
    subject: 'english',
    topic: '长难句 · 虚拟语气',
    difficulty: 2,
    type: 'choice',
    passage:
      'It is essential that the results ____ by an independent laboratory before they are published.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['be verified', 'are verified', 'will be verified', 'verified'],
    answer: 0,
    explanation:
      'It is essential that ... 从句使用虚拟语气 (should) + 动词原形；results 与 verify 是被动关系，故为 (should) be verified。',
    translation:
      '研究结果在发表前必须由独立实验室验证，这一点至关重要。',
    vocab: [
      { word: 'essential', meaning: 'adj. 至关重要的' },
      { word: 'verify', meaning: 'v. 核实，验证' },
      { word: 'independent', meaning: 'adj. 独立的' },
    ],
    source: '原创',
  },
  {
    id: 'eng-022',
    subject: 'english',
    topic: '长难句 · 让步',
    difficulty: 1,
    type: 'choice',
    passage:
      'The government has promised to cut carbon emissions, ____ it has yet to explain how the target will be achieved.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['although', 'because', 'so', 'unless'],
    answer: 0,
    explanation:
      '“承诺减排”与“尚未解释如何实现”构成让步/对比关系，用 although。because 表原因；so 表结果；unless 表条件。',
    translation:
      '政府已承诺减少碳排放，尽管它尚未解释将如何实现这一目标。',
    vocab: [
      { word: 'carbon emissions', meaning: '碳排放' },
      { word: 'target', meaning: 'n. 目标' },
      { word: 'yet to', meaning: '尚未' },
    ],
    source: '原创',
  },
  {
    id: 'eng-023',
    subject: 'english',
    topic: '长难句 · 定语从句',
    difficulty: 1,
    type: 'choice',
    passage:
      'Consumers are increasingly willing to pay more for products ____ produced in an environmentally friendly way.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['that are', 'which is', 'what are', 'who are'],
    answer: 0,
    explanation:
      '先行词 products 是复数，定语从句谓语用 are；that 可指物并在从句中作主语，故为 that are produced。which is 主谓不一致；what 不能引导定语从句；who 指人。',
    translation:
      '消费者越来越愿意为以环保方式生产的产品支付更高价格。',
    vocab: [
      { word: 'increasingly', meaning: 'adv. 越来越' },
      { word: 'willing', meaning: 'adj. 愿意的' },
      { word: 'environmentally friendly', meaning: '环保的' },
    ],
    source: '原创',
  },
  {
    id: 'eng-024',
    subject: 'english',
    topic: '长难句 · 条件',
    difficulty: 1,
    type: 'choice',
    passage:
      'The researchers warned that the trend could reverse ____ the current policy is maintained.',
    prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
    options: ['unless', 'if', 'because', 'although'],
    answer: 0,
    explanation:
      'unless = if not，表示“除非”。句意：除非维持现行政策，否则这一趋势可能逆转。if 会使逻辑变成“如果维持政策，趋势逆转”，与 warn 的语境不符。',
    translation:
      '研究人员警告说，除非维持现行政策，否则这一趋势可能会逆转。',
    vocab: [
      { word: 'reverse', meaning: 'v. 逆转，反转' },
      { word: 'maintain', meaning: 'v. 维持，保持' },
      { word: 'warn', meaning: 'v. 警告' },
    ],
    source: '原创',
  },
]
