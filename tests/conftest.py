"""
Pytest 配置和通用 fixtures
"""

import pytest
import sys
from pathlib import Path

# 确保项目根目录在 Python 路径中
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))


@pytest.fixture
def sample_watchlist():
    """示例自选股列表"""
    return [
        {"code": "600519", "name": "贵州茅台", "priority": "high"},
        {"code": "000858", "name": "五粮液", "priority": "medium"},
    ]


@pytest.fixture
def sample_ohlcv_data():
    """示例 OHLCV 数据"""
    import pandas as pd
    from datetime import datetime, timedelta
    
    dates = [datetime.now() - timedelta(days=i) for i in range(20, 0, -1)]
    return pd.DataFrame({
        "date": dates,
        "open": [100 + i * 0.5 for i in range(20)],
        "high": [101 + i * 0.5 for i in range(20)],
        "low": [99 + i * 0.5 for i in range(20)],
        "close": [100.5 + i * 0.5 for i in range(20)],
        "volume": [1000000 + i * 10000 for i in range(20)],
    })

