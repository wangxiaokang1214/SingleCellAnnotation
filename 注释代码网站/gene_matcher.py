import pandas as pd
import numpy as np

def read_reference_data(file_path):
    """读取参考数据文件"""
    try:
        df = pd.read_excel(file_path)
        # 确保必要的列存在
        required_columns = ['subclass_label', 'subclass.markers.combo', 'subclass.tf.markers.combo']
        if not all(col in df.columns for col in required_columns):
            raise ValueError("参考数据文件必须包含 'subclass_label', 'subclass.markers.combo' 和 'subclass.tf.markers.combo' 列")
        return df
    except Exception as e:
        print(f"读取参考数据文件时出错: {str(e)}")
        return None

def read_user_data(file_path):
    """读取用户数据文件"""
    try:
        # 根据文件扩展名选择不同的读取方式
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.endswith('.xlsx'):
            df = pd.read_excel(file_path, engine='openpyxl')
        elif file_path.endswith('.xls'):
            df = pd.read_excel(file_path, engine='xlrd')
        else:
            raise ValueError("不支持的文件格式，请使用 .csv, .xlsx 或 .xls 格式")
            
        # 确保必要的列存在
        required_columns = ['cluster', 'gene']
        if not all(col in df.columns for col in required_columns):
            raise ValueError("用户数据文件必须包含 'cluster' 和 'gene' 列")
        return df
    except Exception as e:
        print(f"读取用户数据文件时出错: {str(e)}")
        return None

def process_reference_data(df):
    """处理参考数据，将基因字符串转换为列表"""
    reference_dict = {}
    tf_dict = {}  # 存储转录因子基因
    for _, row in df.iterrows():
        subclass = row['subclass_label']
        genes = [g.strip() for g in str(row['subclass.markers.combo']).split(',')]
        tf_genes = [g.strip() for g in str(row['subclass.tf.markers.combo']).split(',')]
        reference_dict[subclass] = genes
        tf_dict[subclass] = tf_genes
    return reference_dict, tf_dict

def process_user_data(df):
    """处理用户数据，按cluster分组基因"""
    user_dict = {}
    for _, row in df.iterrows():
        cluster = row['cluster']
        gene = row['gene']
        if cluster not in user_dict:
            user_dict[cluster] = []
        user_dict[cluster].append(gene)
    return user_dict

def calculate_matching_score(user_genes, reference_genes, is_tf=False):
    """计算匹配分数
    Args:
        user_genes: 用户基因列表
        reference_genes: 参考基因列表
        is_tf: 是否是转录因子匹配
    Returns:
        匹配分数
    """
    user_genes = set(user_genes)
    reference_genes = set(reference_genes)
    if not reference_genes:
        return 0
    matching_genes = user_genes.intersection(reference_genes)
    # 如果是转录因子匹配，每个基因加1分；如果是marker基因匹配，每个基因加10分
    score = len(matching_genes) * (1 if is_tf else 10)
    return score

def find_best_match(user_genes, reference_dict, tf_dict=None):
    """找到最佳匹配的细胞类型"""
    best_match = None
    best_score = 0
    matches = {}
    matching_genes_dict = {}  # 存储每个subclass匹配到的基因
    tf_matching_genes_dict = {}  # 存储每个subclass匹配到的转录因子基因
    
    for subclass, ref_genes in reference_dict.items():
        # 计算marker基因匹配分数
        marker_score = calculate_matching_score(user_genes, ref_genes, is_tf=False)
        matches[subclass] = marker_score
        # 计算匹配到的基因
        matching_genes = set(user_genes).intersection(set(ref_genes))
        matching_genes_dict[subclass] = matching_genes
        
        # 如果有转录因子数据，计算转录因子匹配
        if tf_dict:
            tf_score = calculate_matching_score(user_genes, tf_dict[subclass], is_tf=True)
            tf_matching_genes = set(user_genes).intersection(set(tf_dict[subclass]))
            tf_matching_genes_dict[subclass] = tf_matching_genes
            # 总分 = marker基因分数 + 转录因子分数
            total_score = marker_score + tf_score
            if total_score > best_score:
                best_score = total_score
                best_match = subclass
        else:
            if marker_score > best_score:
                best_score = marker_score
                best_match = subclass
    
    return best_match, best_score, matches, matching_genes_dict, tf_matching_genes_dict

def main():
    # 读取参考数据
    reference_file = "/Users/xiaokangwang/Research/ProfSu/project1/brain.xlsx"
    ref_df = read_reference_data(reference_file)
    if ref_df is None:
        return
    
    # 处理参考数据
    reference_dict, tf_dict = process_reference_data(ref_df)
    
    # 读取用户数据
    user_file = input("请输入您的数据文件路径: ")
    user_df = read_user_data(user_file)
    if user_df is None:
        return
    
    # 处理用户数据
    user_dict = process_user_data(user_df)
    
    # 分析每个cluster
    print("\n分析结果:")
    print("-" * 50)
    for cluster, genes in user_dict.items():
        best_match, best_score, all_matches, matching_genes_dict, _ = find_best_match(genes, reference_dict)
        print(f"\nCluster {cluster}:")
        if best_match is None:
            print("未找到匹配的细胞类型")
            print("匹配分数: 0")
            print("匹配到的基因: 无")
        else:
            print(f"最佳匹配: {best_match}")
            print(f"匹配分数: {best_score}")
            print(f"匹配到的基因: {', '.join(matching_genes_dict[best_match])}")
        
        # 显示所有匹配分数
        print("\n与所有细胞类型的匹配分数:")
        for subclass, score in sorted(all_matches.items(), key=lambda x: x[1], reverse=True):
            if score > 0:  # 只显示有匹配的
                print(f"{subclass}: {score}")
                print(f"匹配到的基因: {', '.join(matching_genes_dict[subclass])}")
    
    # 询问是否进行二次匹配
    while True:
        do_second_match = input("\n是否要进行转录因子二次匹配？(y/n): ").lower()
        if do_second_match in ['y', 'n']:
            break
        print("请输入 y 或 n")
    
    if do_second_match == 'y':
        # 获取要二次匹配的cluster
        print("\n可用的clusters:", list(user_dict.keys()))
        while True:
            try:
                clusters_to_match = input("请输入要二次匹配的cluster编号（用逗号分隔，例如：1,2,3）: ")
                clusters_to_match = [int(c.strip()) for c in clusters_to_match.split(',')]
                if all(c in user_dict.keys() for c in clusters_to_match):
                    break
                print("请输入有效的cluster编号")
            except ValueError:
                print("请输入有效的数字，用逗号分隔")
        
        print("\n二次匹配结果:")
        print("-" * 50)
        for cluster in clusters_to_match:
            genes = user_dict[cluster]
            best_match, best_score, all_matches, matching_genes_dict, tf_matching_genes_dict = find_best_match(genes, reference_dict, tf_dict)
            print(f"\nCluster {cluster}:")
            if best_match is None:
                print("未找到匹配的细胞类型")
                print("综合匹配分数: 0")
                print("匹配到的marker基因: 无")
                print("匹配到的转录因子: 无")
            else:
                print(f"最佳匹配: {best_match}")
                print(f"综合匹配分数: {best_score}")
                print(f"匹配到的marker基因: {', '.join(matching_genes_dict[best_match])}")
                print(f"匹配到的转录因子: {', '.join(tf_matching_genes_dict[best_match])}")
            
            # 显示所有匹配分数
            print("\n与所有细胞类型的匹配分数:")
            for subclass, score in sorted(all_matches.items(), key=lambda x: x[1], reverse=True):
                if score > 0:  # 只显示有匹配的
                    print(f"{subclass}:")
                    print(f"  Marker基因匹配分数: {score}")
                    print(f"  转录因子匹配分数: {calculate_matching_score(genes, tf_dict[subclass], is_tf=True)}")
                    print(f"  匹配到的marker基因: {', '.join(matching_genes_dict[subclass])}")
                    print(f"  匹配到的转录因子: {', '.join(tf_matching_genes_dict[subclass])}")

if __name__ == "__main__":
    main() 