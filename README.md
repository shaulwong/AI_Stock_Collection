# A股自动化研报系统

> 🚀 面向个人投资者的 A 股自动化研报生成系统

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📖 项目简介

构建一套面向 A 股市场的自动化研报生成系统，服务于个人投资决策。

### 核心功能

- 📊 **盘前报告** (08:30): 隔夜外盘、期货数据、政策新闻、今日关注
- 📈 **盘后报告** (15:30): 大盘总结、板块分析、30只自选股分析、信号提示
- 🤖 **AI TLDR**: Claude 自动生成摘要
- 📑 **PDF 输出**: 专业美观的研报格式

## 🏗️ 项目结构

```
AI_Stock_Collection/
├── config/                      # 配置文件
│   ├── watchlist.yaml          # 自选股列表
│   ├── indicators.yaml         # 技术指标参数
│   └── alerts.yaml             # 信号阈值配置
│
├── src/                        # 源代码
│   ├── collectors/             # 数据采集
│   │   ├── base.py            # 采集器基类
│   │   └── akshare_collector.py
│   ├── analyzers/              # 数据分析
│   │   ├── technical.py       # 技术分析
│   │   ├── capital_flow.py    # 资金分析
│   │   └── signals.py         # 信号检测
│   ├── ai/                     # AI 模块
│   │   ├── llm_client.py      # LLM 封装
│   │   └── tldr_generator.py  # TLDR 生成
│   ├── reports/                # 报告生成
│   │   ├── builder.py         # 报告构建器
│   │   ├── templates/         # Jinja2 模板
│   │   └── pdf_exporter.py    # PDF 导出
│   ├── scheduler/              # 调度
│   │   └── cron.py
│   └── utils/                  # 工具函数
│       ├── config_loader.py
│       └── logger.py
│
├── output/                     # 输出目录
│   ├── pre_market/            # 盘前报告
│   └── post_market/           # 盘后报告
│
├── tests/                      # 测试
├── docs/                       # 文档
│   └── DESIGN.md              # 设计文档
├── requirements.txt
└── README.md
```

## 🚀 快速开始

### 1. 环境准备

```bash
# 克隆项目
git clone https://github.com/shaulwong/AI_Stock_Collection.git
cd AI_Stock_Collection

# 创建虚拟环境
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

### 2. 配置

```bash
# 复制配置模板
cp config/watchlist.yaml.example config/watchlist.yaml

# 编辑自选股列表
vim config/watchlist.yaml
```

### 3. 运行

```bash
# 生成盘前报告
python main.py --report pre_market

# 生成盘后报告
python main.py --report post_market

# 启动定时任务
python main.py --daemon
```

## 📅 开发计划

### Sprint 1: MVP (当前)
- [x] 项目结构初始化
- [ ] 数据采集层 (AKShare)
- [ ] 技术分析模块 (MACD/RSI/BOLL)
- [ ] AI TLDR 生成
- [ ] PDF 报告生成
- [ ] 定时任务调度

### Sprint 2: 数据增强
- [ ] 龙虎榜分析
- [ ] 飞书推送
- [ ] 付费数据源接入

### Sprint 3: AI 深度分析
- [ ] 财报分析
- [ ] 政策解读

### Sprint 4: 图形识别
- [ ] TradingView 图表采集
- [ ] AI 视觉图形识别

## 📄 License

MIT License

---

⚠️ **免责声明**: 本系统仅供学习和研究使用，不构成投资建议。
