# 大脑单细胞注释系统

这是一个用于基因分类匹配的单细胞注释工具，可以根据参考数据对用户提供的基因数据进行分类和匹配。

## 功能特点

- 支持 Excel 和 CSV 格式的数据文件
- 自动计算基因匹配分数
- 支持转录因子二次匹配
- 详细的匹配结果展示

## 数据格式要求

### 参考数据文件 (Excel格式)
必须包含以下列：
- `subclass_label`: 细胞类型标签
- `subclass.markers.combo`: 标记基因列表（逗号分隔）
- `subclass.tf.markers.combo`: 转录因子基因列表（逗号分隔）

### 用户数据文件 (Excel或CSV格式)
必须包含以下列：
- `cluster`: 聚类编号
- `gene`: 基因名称

## 安装

1. 克隆仓库：
```bash
git clone https://github.com/你的用户名/gene-classification-system.git
cd gene-classification-system
```

2. 安装依赖：
```bash
pip install -r requirements.txt
```

## 使用方法

1. 运行程序：
```bash
python gene_matcher.py
```

2. 按提示输入数据文件路径

3. 查看初步匹配结果

4. 选择是否进行转录因子二次匹配

## 评分系统

- Marker基因匹配：每匹配到一个基因加10分
- 转录因子匹配：每匹配到一个基因加1分
- 总分 = marker基因分数 + 转录因子分数

## 示例输出

```
Cluster 1:
最佳匹配: 细胞类型A
匹配分数: 30
匹配到的基因: Gene1, Gene2, Gene3

与所有细胞类型的匹配分数:
细胞类型A: 30
匹配到的基因: Gene1, Gene2, Gene3
```

## 注意事项

- 确保输入文件格式正确
- 基因名称需要完全匹配
- 建议使用最新版本的 Python 3.x
