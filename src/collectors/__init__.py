"""
数据采集层 (Data Collectors)

负责从各种数据源获取市场数据:
- 个股行情 (OHLCV)
- 大盘指数
- 外盘数据
- 期货数据
- 板块数据
"""

from .base import BaseCollector

__all__ = ["BaseCollector"]

