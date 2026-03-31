import { useState, useEffect, useCallback, useRef } from "react";

const PHASES = [
  { id: "S1", name: "文献调研 & 研究设计", color: "#4A7C59", days: "Day 1–3" },
  { id: "S2", name: "数据获取 & 清洗", color: "#2E6B8A", days: "Day 3–6" },
  { id: "S3", name: "统计分析 & 建模", color: "#8B5E3C", days: "Day 5–9" },
  { id: "S4", name: "论文撰写", color: "#6B4C8A", days: "Day 7–12" },
  { id: "S5", name: "演讲准备 & 终稿", color: "#8A3E3E", days: "Day 11–14" },
];

const COLUMNS = [
  { id: "todo", name: "待开始", icon: "○" },
  { id: "doing", name: "进行中", icon: "◑" },
  { id: "review", name: "待审核", icon: "◕" },
  { id: "done", name: "已完成", icon: "●" },
];

const MEMBERS = ["未分配", "李汶静", "邓静", "王俊然"];

const INITIAL_TASKS = [
  { id: "S1-1", phase: "S1", title: "文献检索与筛选", priority: "P0", time: "4–6h", status: "todo", assignee: "未分配", desc: "用关键词组合在 PubMed / Google Scholar / CNKI 检索，初筛 20–30 篇，精筛 10–15 篇核心文献。输出文献清单表。" },
  { id: "S1-2", phase: "S1", title: "核心文献精读与摘要", priority: "P0", time: "4–6h", status: "todo", assignee: "未分配", desc: "精读 5–8 篇最相关文献，提炼睡眠指标定义、甲状腺指标处理、混杂变量控制等关键信息，每篇写 150–200 字结构化摘要。" },
  { id: "S1-3", phase: "S1", title: "数据库可行性评估", priority: "P0", time: "3–4h", status: "todo", assignee: "未分配", desc: "逐个检查候选数据库（NHANES / KNHANES 等），确认是否含睡眠+甲状腺变量、18–22岁样本量、混杂变量可用性。输出评估对比表。" },
  { id: "S1-4", phase: "S1", title: "变量操作定义 & 研究假设", priority: "P0", time: "2–3h", status: "todo", assignee: "未分配", desc: "填写变量定义表（X/Y/Z），写下正式研究假设 H1/H0。决定睡眠时长处理方式（连续 vs. 分组）。依赖 S1-3。" },
  { id: "S1-5", phase: "S1", title: "撰写研究方案（1页）", priority: "P1", time: "2h", status: "todo", assignee: "未分配", desc: "整合为 1 页研究方案：研究问题、假设、设计类型、数据来源、统计方法、预期表图清单。后续可扩展为论文骨架。" },
  { id: "S1-6", phase: "S1", title: "整理参考文献库", priority: "P1", time: "1–2h", status: "todo", assignee: "未分配", desc: "将文献导入 Zotero，按主题打 tag，选定引用格式（APA / Vancouver）。" },

  { id: "S2-1", phase: "S2", title: "数据下载与格式转换", priority: "P0", time: "2–3h", status: "todo", assignee: "未分配", desc: "从确定的数据库下载原始 .xpt / .csv 文件，用 pandas / haven 读入，确认数据使用协议，保存原始备份。" },
  { id: "S2-2", phase: "S2", title: "多模块数据合并", priority: "P0", time: "2–4h", status: "todo", assignee: "未分配", desc: "按受试者 ID（如 SEQN）将 DEMO、SLQ、THYROD、BMX 等模块 left join 合并为一张宽表。检查行数和变量完整性。" },
  { id: "S2-3", phase: "S2", title: "人群筛选（纳入排除）", priority: "P0", time: "2–3h", status: "todo", assignee: "未分配", desc: "逐步筛选：限定年龄 → 排除甲状腺疾病 → 排除甲状腺药物 → 排除怀孕 → 排除关键数据缺失。记录每步排除人数。" },
  { id: "S2-4", phase: "S2", title: "缺失值处理", priority: "P0", time: "2–3h", status: "todo", assignee: "未分配", desc: "统计各变量缺失率。<5% 完整案例分析；5–20% 考虑多重插补；>20% 慎用。检查缺失机制（MCAR/MAR/MNAR）。" },
  { id: "S2-5", phase: "S2", title: "异常值检测与处理", priority: "P1", time: "1–2h", status: "todo", assignee: "未分配", desc: "Boxplot + Z-score 标记异常值。睡眠 <2h/>14h 可能填写错误，TSH>10 可能临床甲减。主分析保留，敏感性分析排除。" },
  { id: "S2-6", phase: "S2", title: "变量重编码与派生", priority: "P1", time: "2–3h", status: "todo", assignee: "未分配", desc: "睡眠分组（<6h/6–7h/7–8h/>8h）、ln(TSH) 变换、BMI 分类、吸烟饮酒编码等。" },
  { id: "S2-7", phase: "S2", title: "数据字典 & 清洗日志", priority: "P1", time: "1–2h", status: "todo", assignee: "未分配", desc: "编写数据字典（变量名→含义→类型→取值→缺失率）和清洗日志（每步操作、排除人数、决策理由）。" },

  { id: "S3-1", phase: "S3", title: "描述性统计 → Table 1", priority: "P0", time: "2–3h", status: "todo", assignee: "未分配", desc: "按睡眠分组呈现人群特征。连续变量 mean±SD 或 median(IQR)，分类变量 n(%)。可用 tableone 包一键生成。" },
  { id: "S3-2", phase: "S3", title: "分布检验 & 变量变换", priority: "P0", time: "1–2h", status: "todo", assignee: "未分配", desc: "画直方图+Q-Q图，Shapiro-Wilk 检验。TSH 右偏→用 ln(TSH)。记录变换决策。" },
  { id: "S3-3", phase: "S3", title: "可视化探索（EDA）", priority: "P0", time: "3–4h", status: "todo", assignee: "未分配", desc: "睡眠分布图、甲状腺指标分布图、散点图+LOESS、分组箱线图、相关性热力图。依赖 S3-2。" },
  { id: "S3-4", phase: "S3", title: "单因素分析", priority: "P0", time: "2–3h", status: "todo", assignee: "未分配", desc: "Pearson/Spearman 相关（连续）、ANOVA/Kruskal-Wallis（分组）。显著时做两两比较。依赖 S3-2。" },
  { id: "S3-5", phase: "S3", title: "多元回归建模（核心）", priority: "P0", time: "4–6h", status: "todo", assignee: "未分配", desc: "分层回归 Model 1/2/3，对 TSH/FT3/FT4 分别建模。报告 β、95%CI、p、R²。如 NHANES 需 survey-weighted。检查 VIF 和残差。依赖 S3-4。" },
  { id: "S3-6", phase: "S3", title: "亚组分析", priority: "P1", time: "2–3h", status: "todo", assignee: "未分配", desc: "按性别、BMI 分层跑 Model 3。报告交互项 p 值，考虑森林图展示。依赖 S3-5。" },
  { id: "S3-7", phase: "S3", title: "敏感性分析", priority: "P1", time: "2–3h", status: "todo", assignee: "未分配", desc: "排除极端值 / 变量连续↔分类切换 / 排除临床甲减甲亢 / 完整案例 vs 插补 / 变换年龄范围。至少做 2–3 项。依赖 S3-5。" },
  { id: "S3-8", phase: "S3", title: "剂量-反应曲线（RCS）", priority: "P2", time: "3–4h", status: "todo", assignee: "未分配", desc: "限制性立方样条拟合睡眠→TSH 非线性关系。3–5 个节点。画调整后曲线+95%CI。检验非线性 p 值。依赖 S3-5。" },
  { id: "S3-9", phase: "S3", title: "图表精修至 publication-ready", priority: "P1", time: "2–3h", status: "todo", assignee: "未分配", desc: "≥300dpi，坐标轴标签完整，色盲友好配色，图例清晰，统一编号和标题。依赖 S3-3, S3-5。" },

  { id: "S4-1", phase: "S4", title: "Methods 撰写", priority: "P0", time: "3–4h", status: "todo", assignee: "未分配", desc: "数据来源、研究对象（纳排标准+流程图）、变量定义、统计方法。写到\"别人能复现\"的程度。S1 完成后即可开始。" },
  { id: "S4-2", phase: "S4", title: "Introduction 撰写", priority: "P0", time: "4–5h", status: "todo", assignee: "未分配", desc: "4 段式：甲状腺重要性→睡眠与内分泌关联→研究空白→本研究目的与假设。控制 500–800 字。S1 完成后即可开始。" },
  { id: "S4-3", phase: "S4", title: "Results 撰写", priority: "P0", time: "4–5h", status: "todo", assignee: "未分配", desc: "按分析顺序：基本特征→单因素→回归→亚组→敏感性。只陈述事实不解释。引用所有表图。需 S3 核心结果。" },
  { id: "S4-4", phase: "S4", title: "Discussion 撰写", priority: "P0", time: "4–6h", status: "todo", assignee: "未分配", desc: "核心发现概括→与文献比较→生物学机制→研究优势→局限→结论与意义。依赖 S4-3。" },
  { id: "S4-5", phase: "S4", title: "Abstract 撰写", priority: "P0", time: "1h", status: "todo", assignee: "未分配", desc: "最后写。结构化：背景(2–3句)→方法(3–4句)→结果(3–4句)→结论(1–2句)。全文完成后。" },
  { id: "S4-6", phase: "S4", title: "表格 & 图表整合排版", priority: "P1", time: "2–3h", status: "todo", assignee: "未分配", desc: "表格编号+标题+脚注，图表插入正文或附录，格式统一。需 S3-9 完成。" },
  { id: "S4-7", phase: "S4", title: "参考文献格式化", priority: "P1", time: "1–2h", status: "todo", assignee: "未分配", desc: "用 Zotero 插件统一格式，检查正文引用与文献列表一一对应。" },

  { id: "S5-1", phase: "S5", title: "PPT 框架 & 内容填充", priority: "P0", time: "4–5h", status: "todo", assignee: "未分配", desc: "12–15 页：封面→背景→文献空白→数据源→变量→方法→Table1→核心图→回归→亚组→讨论→机制→局限→结论→Q&A。" },
  { id: "S5-2", phase: "S5", title: "论文修订（内容）", priority: "P0", time: "3–4h", status: "todo", assignee: "未分配", desc: "全组通读初稿，检查逻辑、论证完整性、数据一致性（正文 vs 表格）。" },
  { id: "S5-3", phase: "S5", title: "论文修订（语言 & 格式）", priority: "P1", time: "2–3h", status: "todo", assignee: "未分配", desc: "学术用语规范化、避免口语、字体行距统一、参考文献格式最终检查。" },
  { id: "S5-4", phase: "S5", title: "演讲分工 & 排练", priority: "P0", time: "2–3h", status: "todo", assignee: "未分配", desc: "按模块分工（背景+方法 / 结果 / 讨论+结论），每人 3–5 分钟，至少完整排练 2 次并计时。" },
  { id: "S5-5", phase: "S5", title: "预设 Q&A 准备", priority: "P1", time: "1–2h", status: "todo", assignee: "未分配", desc: "准备 8 个高频问题的 2–3 句话回答：年龄段选择、自报偏差、因果推断、采血时间、碘摄入等。" },
  { id: "S5-6", phase: "S5", title: "代码和数据打包存档", priority: "P1", time: "1h", status: "todo", assignee: "未分配", desc: "按约定目录结构整理 /data /code /output /paper /slides，确保可复现，写 README。" },
  { id: "S5-7", phase: "S5", title: "最终提交前检查", priority: "P0", time: "1h", status: "todo", assignee: "未分配", desc: "全组最后过一遍所有交付物：论文、PPT、代码、数据。文件命名规范。" },
];

const CHECKLISTS = {
  S1: [
    "文献清单表完成（≥10 篇核心文献，含结构化信息）",
    "5–8 篇精读摘要完成",
    "数据库评估表完成，确定了主用数据库",
    "变量定义表完成，X/Y/Z 均有明确操作定义和数据来源",
    "研究假设已明确写下（至少 H1 和 H0）",
    "\"波动\" vs. \"水平/关联\" 措辞已决定",
    "1 页研究方案已写完，全组确认",
    "参考文献已录入管理工具",
    "【门禁】全组 15min 对齐会，确认方案无分歧",
  ],
  S2: [
    "原始数据文件已下载并备份",
    "多模块数据已合并为一张宽表",
    "人群筛选完成，每步排除人数已记录",
    "最终样本量 N ≥ 200",
    "各变量缺失率已统计，处理策略已决定",
    "异常值已标记，处理策略已决定",
    "变量重编码完成（睡眠分组、ln(TSH) 等）",
    "分析数据集已导出 analysis_dataset.csv",
    "数据字典和清洗日志已编写",
    "代码可复现：另一人 clone 后能跑通",
    "【门禁】至少一人交叉检查数据集",
  ],
  S3: [
    "Table 1 描述性统计表完成",
    "各因变量分布已检查，变换决策已记录",
    "EDA 图表完成（分布图、散点图、热力图）",
    "单因素分析结果表完成",
    "多元回归 Model 1/2/3 跑完，结果表已整理",
    "回归诊断已检查（残差、VIF、Cook's distance）",
    "亚组分析至少做了性别分层",
    "敏感性分析至少做了 2 项",
    "核心图表已精修至 publication-ready",
    "所有分析代码有注释，可复现",
    "【门禁】核心结果组内讨论完毕",
  ],
  S4: [
    "Methods 初稿完成",
    "Introduction 初稿完成",
    "Results 初稿完成，所有表图已引用",
    "Discussion 初稿完成",
    "Abstract 已撰写",
    "正文数字与表格数字一致（交叉核对）",
    "所有引用文献已在正文中标注",
    "参考文献格式统一",
    "全文字数 3000–5000 字（不含摘要和参考文献）",
    "【门禁】全组通读初稿并标记问题",
  ],
  S5: [
    "PPT 终版完成（12–15 页）",
    "论文所有修订意见已处理",
    "正文数字 vs 表格最终核对",
    "参考文献列表完整、格式统一",
    "演讲分工确定",
    "至少完整排练 2 次并计时",
    "预设 Q&A 答案准备好",
    "代码+数据+论文+PPT 打包存档",
    "文件命名规范",
    "【终检】全组最后过一遍所有交付物",
  ],
};

const PRIORITY_STYLES = {
  P0: { bg: "#1a1a1a", fg: "#f0f0f0", label: "P0 必做" },
  P1: { bg: "#5a5a5a", fg: "#f0f0f0", label: "P1 重要" },
  P2: { bg: "#a0a0a0", fg: "#1a1a1a", label: "P2 加分" },
};

export default function KanbanBoard() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [checklists, setChecklists] = useState({});
  const [activePhase, setActivePhase] = useState("all");
  const [expandedTask, setExpandedTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [showChecklist, setShowChecklist] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const dragOverCol = useRef(null);

  useEffect(() => {
    try {
      const r = localStorage.getItem("kanban-state");
      if (r) {
        const parsed = JSON.parse(r);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.checklists) setChecklists(parsed.checklists);
      }
    } catch (e) { }
    setLoaded(true);
  }, []);

  const persist = useCallback((t, c) => {
    try {
      localStorage.setItem("kanban-state", JSON.stringify({ tasks: t, checklists: c }));
    } catch (e) { }
  }, []);

  const updateTasks = useCallback((newTasks) => {
    setTasks(newTasks);
    persist(newTasks, checklists);
  }, [checklists, persist]);

  const updateChecklists = useCallback((newCL) => {
    setChecklists(newCL);
    persist(tasks, newCL);
  }, [tasks, persist]);

  const moveTask = (taskId, newStatus) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    updateTasks(updated);
  };

  const changeAssignee = (taskId, assignee) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, assignee } : t);
    updateTasks(updated);
  };

  const toggleCheckItem = (phase, idx) => {
    const key = `${phase}-${idx}`;
    const newCL = { ...checklists, [key]: !checklists[key] };
    setChecklists(newCL);
    persist(tasks, newCL);
  };

  const getCheckProgress = (phase) => {
    const items = CHECKLISTS[phase] || [];
    const done = items.filter((_, i) => checklists[`${phase}-${i}`]).length;
    return { done, total: items.length };
  };

  const filtered = activePhase === "all" ? tasks : tasks.filter(t => t.phase === activePhase);

  const stats = {
    todo: tasks.filter(t => t.status === "todo").length,
    doing: tasks.filter(t => t.status === "doing").length,
    review: tasks.filter(t => t.status === "review").length,
    done: tasks.filter(t => t.status === "done").length,
  };

  const resetAll = () => {
    if (confirm("确定要重置所有任务状态和 Checklist 吗？")) {
      setTasks(INITIAL_TASKS);
      setChecklists({});
      try { localStorage.setItem("kanban-state", JSON.stringify({ tasks: INITIAL_TASKS, checklists: {} })); } catch (e) { }
    }
  };

  if (!loaded) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'monospace', color: '#666' }}>Loading...</div>;

  const phase = activePhase !== "all" ? PHASES.find(p => p.id === activePhase) : null;

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', 'SF Mono', 'Menlo', monospace", background: "#f5f3f0", minHeight: "100vh", color: "#1a1a1a" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "#1a1a1a", color: "#f5f3f0", padding: "20px 24px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", opacity: 0.5, marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace" }}>Biostatistics Competition</div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, fontFamily: "'Noto Sans SC', sans-serif", lineHeight: 1.4 }}>
              睡眠有效时长 × 甲状腺激素波动
            </h1>
            <div style={{ fontSize: 11, opacity: 0.4, marginTop: 4, fontFamily: "'IBM Plex Mono', monospace" }}>GROUP REPO · 14-DAY SPRINT · 3 MEMBERS</div>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
            {COLUMNS.map(c => (
              <div key={c.id} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{stats[c.id]}</div>
                <div style={{ opacity: 0.4, fontSize: 10 }}>{c.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phase tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #1a1a1a", overflowX: "auto" }}>
        <button onClick={() => setActivePhase("all")} style={{
          padding: "10px 16px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: activePhase === "all" ? 700 : 400,
          background: activePhase === "all" ? "#1a1a1a" : "transparent", color: activePhase === "all" ? "#f5f3f0" : "#1a1a1a",
          fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap", borderRight: "1px solid #ccc",
        }}>ALL ({tasks.length})</button>
        {PHASES.map(p => {
          const count = tasks.filter(t => t.phase === p.id).length;
          const doneCount = tasks.filter(t => t.phase === p.id && t.status === "done").length;
          return (
            <button key={p.id} onClick={() => setActivePhase(p.id)} style={{
              padding: "10px 14px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: activePhase === p.id ? 700 : 400,
              background: activePhase === p.id ? p.color : "transparent", color: activePhase === p.id ? "#f5f3f0" : "#1a1a1a",
              fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap", borderRight: "1px solid #ccc", position: "relative",
            }}>
              {p.id} · {p.name}
              <span style={{ opacity: 0.5, marginLeft: 6 }}>{doneCount}/{count}</span>
            </button>
          );
        })}
      </div>

      {/* Phase info bar + checklist toggle */}
      {phase && (
        <div style={{ background: phase.color + "18", borderBottom: `2px solid ${phase.color}`, padding: "10px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
            <span style={{ fontWeight: 600 }}>{phase.days}</span>
            <span style={{ opacity: 0.5, marginLeft: 12 }}>
              进度: {tasks.filter(t => t.phase === phase.id && t.status === "done").length} / {tasks.filter(t => t.phase === phase.id).length} 任务完成
              {" · "}Checklist: {getCheckProgress(phase.id).done}/{getCheckProgress(phase.id).total}
            </span>
          </div>
          <button onClick={() => setShowChecklist(showChecklist === phase.id ? null : phase.id)} style={{
            padding: "4px 12px", fontSize: 11, border: `1px solid ${phase.color}`, background: showChecklist === phase.id ? phase.color : "transparent",
            color: showChecklist === phase.id ? "#fff" : phase.color, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace",
          }}>
            {showChecklist === phase.id ? "▲ 收起 Checklist" : "▼ 展开 Checklist"}
          </button>
        </div>
      )}

      {/* Checklist panel */}
      {showChecklist && CHECKLISTS[showChecklist] && (
        <div style={{ background: "#fff", borderBottom: "2px solid #1a1a1a", padding: "16px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, fontFamily: "'Noto Sans SC', sans-serif" }}>{showChecklist} 阶段门禁 Checklist</div>
          {CHECKLISTS[showChecklist].map((item, i) => {
            const checked = checklists[`${showChecklist}-${i}`];
            const isGate = item.startsWith("【");
            return (
              <label key={i} onClick={() => toggleCheckItem(showChecklist, i)} style={{
                display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", cursor: "pointer", fontSize: 12,
                fontFamily: "'Noto Sans SC', sans-serif", opacity: checked ? 0.45 : 1, textDecoration: checked ? "line-through" : "none",
                fontWeight: isGate ? 600 : 400, color: isGate ? PHASES.find(p => p.id === showChecklist)?.color : "#1a1a1a",
              }}>
                <span style={{ fontSize: 14, flexShrink: 0, marginTop: -1 }}>{checked ? "☑" : "☐"}</span>
                {item}
              </label>
            );
          })}
        </div>
      )}

      {/* Kanban columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, minHeight: "60vh" }}>
        {COLUMNS.map(col => {
          const colTasks = filtered.filter(t => t.status === col.id);
          return (
            <div key={col.id}
              onDragOver={e => { e.preventDefault(); dragOverCol.current = col.id; }}
              onDrop={() => { if (draggedTask) { moveTask(draggedTask, col.id); setDraggedTask(null); } }}
              style={{ borderRight: "1px solid #d4d0cc", padding: "0", background: col.id === "done" ? "#eeedeb" : "transparent" }}
            >
              {/* Column header */}
              <div style={{ padding: "12px 14px 8px", borderBottom: "1px solid #d4d0cc", position: "sticky", top: 0, background: col.id === "done" ? "#eeedeb" : "#f5f3f0", zIndex: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>
                  <span>{col.icon}</span>
                  <span>{col.name}</span>
                  <span style={{ opacity: 0.3, fontWeight: 400 }}>({colTasks.length})</span>
                </div>
              </div>

              {/* Cards */}
              <div style={{ padding: "8px 8px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
                {colTasks.map(task => {
                  const phaseObj = PHASES.find(p => p.id === task.phase);
                  const pri = PRIORITY_STYLES[task.priority];
                  const isExpanded = expandedTask === task.id;
                  return (
                    <div key={task.id} draggable onDragStart={() => setDraggedTask(task.id)} onDragEnd={() => setDraggedTask(null)}
                      style={{
                        background: "#fff", border: "1px solid #d4d0cc", padding: 0, cursor: "grab",
                        opacity: draggedTask === task.id ? 0.4 : 1, transition: "opacity 0.15s",
                        borderLeft: `3px solid ${phaseObj?.color || '#999'}`,
                      }}
                    >
                      {/* Card header */}
                      <div onClick={() => setExpandedTask(isExpanded ? null : task.id)} style={{ padding: "10px 10px 8px", cursor: "pointer" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
                          <span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", opacity: 0.4 }}>{task.id}</span>
                          <span style={{ fontSize: 9, padding: "1px 5px", background: pri.bg, color: pri.fg, fontFamily: "'IBM Plex Mono', monospace", flexShrink: 0 }}>{task.priority}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 500, fontFamily: "'Noto Sans SC', sans-serif", lineHeight: 1.4 }}>{task.title}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                          <span style={{ fontSize: 10, opacity: 0.4, fontFamily: "'IBM Plex Mono', monospace" }}>⏱ {task.time}</span>
                          <span style={{ fontSize: 10, fontFamily: "'Noto Sans SC', sans-serif", color: task.assignee === "未分配" ? "#bbb" : phaseObj?.color, fontWeight: task.assignee !== "未分配" ? 600 : 400 }}>
                            {task.assignee}
                          </span>
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div style={{ borderTop: "1px solid #eee", padding: "10px", background: "#fafaf8" }}>
                          <div style={{ fontSize: 11, lineHeight: 1.6, fontFamily: "'Noto Sans SC', sans-serif", color: "#444", marginBottom: 10 }}>{task.desc}</div>

                          {/* Assignee selector */}
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 10, opacity: 0.5, marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>ASSIGNEE</div>
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                              {MEMBERS.map(m => (
                                <button key={m} onClick={(e) => { e.stopPropagation(); changeAssignee(task.id, m); }} style={{
                                  padding: "2px 8px", fontSize: 11, border: `1px solid ${task.assignee === m ? phaseObj?.color : '#ddd'}`,
                                  background: task.assignee === m ? phaseObj?.color + '20' : '#fff', color: "#1a1a1a", cursor: "pointer",
                                  fontFamily: "'Noto Sans SC', sans-serif", fontWeight: task.assignee === m ? 600 : 400,
                                }}>
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Status mover */}
                          <div>
                            <div style={{ fontSize: 10, opacity: 0.5, marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>MOVE TO</div>
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                              {COLUMNS.filter(c => c.id !== task.status).map(c => (
                                <button key={c.id} onClick={(e) => { e.stopPropagation(); moveTask(task.id, c.id); }} style={{
                                  padding: "2px 8px", fontSize: 11, border: "1px solid #ddd", background: "#fff", cursor: "pointer",
                                  fontFamily: "'Noto Sans SC', sans-serif", color: "#1a1a1a",
                                }}>
                                  {c.icon} {c.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {colTasks.length === 0 && (
                  <div style={{ padding: "20px 10px", textAlign: "center", fontSize: 11, opacity: 0.25, fontFamily: "'IBM Plex Mono', monospace" }}>
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "2px solid #1a1a1a", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f5f3f0", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 10, opacity: 0.4, fontFamily: "'IBM Plex Mono', monospace" }}>
          拖拽卡片移动状态 · 点击卡片展开详情/分配成员 · 数据自动保存
        </div>
        <button onClick={resetAll} style={{
          padding: "4px 12px", fontSize: 10, border: "1px solid #ccc", background: "transparent", cursor: "pointer",
          fontFamily: "'IBM Plex Mono', monospace", color: "#999",
        }}>
          ↺ 重置全部
        </button>
      </div>
    </div>
  );
}
