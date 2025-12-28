"""
数据采集器基类

定义所有采集器的通用接口和行为
"""

from abc import ABC, abstractmethod
from typing import Optional
import pandas as pd
from datetime import date


class BaseCollector(ABC):
    """数据采集器抽象基类"""
    
    def __init__(self, name: str):
        self.name = name
    
    @abstractmethod
    def collect(self, *args, **kwargs) -> pd.DataFrame:
        """采集数据的核心方法，子类必须实现"""
        pass
    
    def validate(self, df: pd.DataFrame) -> bool:
        """验证采集到的数据是否有效"""
        if df is None or df.empty:
            return False
        return True
    
    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}(name={self.name})>"

