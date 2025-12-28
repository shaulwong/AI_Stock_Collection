#!/usr/bin/env python3
"""
A股自动化研报系统 - 主入口

Usage:
    python main.py --report pre_market   # 生成盘前报告
    python main.py --report post_market  # 生成盘后报告
    python main.py --daemon              # 启动定时任务
"""

import argparse
from datetime import date


def main():
    parser = argparse.ArgumentParser(
        description="A股自动化研报系统",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    
    parser.add_argument(
        "--report",
        choices=["pre_market", "post_market"],
        help="生成指定类型的报告",
    )
    
    parser.add_argument(
        "--date",
        type=str,
        default=None,
        help="指定报告日期 (格式: YYYY-MM-DD)",
    )
    
    parser.add_argument(
        "--daemon",
        action="store_true",
        help="启动定时任务守护进程",
    )
    
    args = parser.parse_args()
    
    # 解析日期
    report_date = date.today()
    if args.date:
        from datetime import datetime
        report_date = datetime.strptime(args.date, "%Y-%m-%d").date()
    
    if args.report == "pre_market":
        print(f"🌅 生成盘前报告: {report_date}")
        # TODO: 调用盘前报告生成逻辑
        # from src.reports.builder import ReportBuilder
        # builder = ReportBuilder()
        # builder.build_pre_market(report_date)
        print("⚠️ 功能开发中...")
        
    elif args.report == "post_market":
        print(f"🌆 生成盘后报告: {report_date}")
        # TODO: 调用盘后报告生成逻辑
        # from src.reports.builder import ReportBuilder
        # builder = ReportBuilder()
        # builder.build_post_market(report_date)
        print("⚠️ 功能开发中...")
        
    elif args.daemon:
        print("🚀 启动定时任务守护进程...")
        # TODO: 调用调度器
        # from src.scheduler.cron import Scheduler
        # scheduler = Scheduler()
        # scheduler.run()
        print("⚠️ 功能开发中...")
        
    else:
        parser.print_help()


if __name__ == "__main__":
    main()

